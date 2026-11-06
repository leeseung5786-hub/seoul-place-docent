import {env} from '@/lib/runtime-env';
import {z} from 'zod';
import {archiveStats, database} from '@/lib/archive-db';
import {getDocentStory, getFullDocentStory} from '@/lib/docent-data';
import {photoResearchThumbnail} from '@/lib/photo-research';
import {searchAddresses, ServiceError, verifyAddress} from '@/lib/providers';
import {generatePlaceAnswer, placeAnswerStats} from '@/lib/place-answer';
import {handleMcpMessage, rpcError, textResult, type McpTool, type McpToolResult} from '@/lib/mcp-protocol';

export const dynamic = 'force-dynamic';
const MAX_BODY_BYTES = 16384;
const headers = {'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'};

const tools: McpTool[] = [
  {
    name: 'search_place',
    description: '서울 도로명·지번 주소를 검색합니다. 후보의 token을 get_place_history에 전달하세요. 후보가 여러 개면 사용자가 장소를 선택하도록 하세요.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {type: 'string', minLength: 2, maxLength: 100, description: '예: 신촌로 83'},
        page: {type: 'integer', minimum: 1, maximum: 100, default: 1},
      },
      required: ['query'],
      additionalProperties: false,
    },
    annotations: {readOnlyHint: true, destructiveHint: false, openWorldHint: true},
  },
  {
    name: 'get_place_history',
    description: 'search_place의 유효한 주소 token으로 동네의 역사·사진·원문 출처를 시간순 조회합니다. 현재 건물·부지와 직접 일치하는 기록은 미확인입니다. 동네 기록을 해당 건물의 역사로 단정하지 마세요.',
    inputSchema: {
      type: 'object',
      properties: {
        token: {type: 'string', minLength: 1, maxLength: 6000},
        offset: {type: 'integer', minimum: 0, maximum: 10000, default: 0},
        limit: {type: 'integer', minimum: 1, maximum: 12, default: 6},
      },
      required: ['token'],
      additionalProperties: false,
    },
    annotations: {readOnlyHint: true, destructiveHint: false, openWorldHint: false},
  },
  {
    name: 'generate_place_answer',
    description: '서버의 AI가 이 사이트의 역사·사진 기록만으로 도슨트 설명을 완성해 돌려줍니다. 질문 분류 → 관련 기록 선택 → 설명 작성 → 문단별 근거·숫자 검증 → D1 저장 순으로 처리하며, 같은 동네·질문·기록이면 저장된 설명을 바로 반환합니다. 결과의 paragraphs를 그대로 보여 주고 sources의 출처·사진 이용조건을 함께 안내하세요. held는 기록으로 확인되지 않아 답하지 않은 내용입니다. token(search_place 결과) 또는 address 중 하나가 필요합니다.',
    inputSchema: {
      type: 'object',
      properties: {
        token: {type: 'string', minLength: 1, maxLength: 6000, description: 'search_place 후보의 token'},
        address: {type: 'string', minLength: 2, maxLength: 100, description: 'token이 없을 때 주소. 후보가 하나일 때만 바로 진행합니다.'},
        question: {type: 'string', maxLength: 300, description: '예: 1960년대에는 어떤 모습이었나요? 비우면 동네 소개'},
      },
      additionalProperties: false,
    },
    annotations: {readOnlyHint: true, destructiveHint: false, openWorldHint: true},
  },
  {
    name: 'get_answer_stats',
    description: '서버 AI 설명 파이프라인의 KPI(요청 수, 저장 재사용률, 성공률, 평균 생성 시간, 검증에서 빠진 문단 비율, 질문 유형 분포)를 D1에서 집계합니다.',
    inputSchema: {type: 'object', properties: {days: {type: 'integer', minimum: 1, maximum: 365, default: 30}}, additionalProperties: false},
    annotations: {readOnlyHint: true, destructiveHint: false, openWorldHint: false},
  },
  {
    name: 'get_archive_stats',
    description: '연결된 D1 DB의 자료·본문·첨부·지역 분류 건수를 실제 조회합니다. 지역 분류 건수는 해당 지역의 역사 본문 확보 건수와 다릅니다.',
    inputSchema: {type: 'object', properties: {}, additionalProperties: false},
    annotations: {readOnlyHint: true, destructiveHint: false, openWorldHint: false},
  },
];

const searchInput = z.object({
  query: z.string().trim().min(2).max(100),
  page: z.number().int().min(1).max(100).default(1),
}).strict();
const historyInput = z.object({
  token: z.string().min(1).max(6000),
  offset: z.number().int().min(0).max(10000).default(0),
  limit: z.number().int().min(1).max(12).default(6),
}).strict();

const answerInput = z.object({
  token: z.string().min(1).max(6000).optional(),
  address: z.string().trim().min(2).max(100).optional(),
  question: z.string().trim().max(300).optional(),
}).strict().refine(v => v.token || v.address, {message: 'token 또는 address가 필요합니다'});
// Fresh generations spend the operator's API budget; stored answers are free and unlimited.
const generations = new Map<string, number[]>();
const PER_USER_PER_MINUTE = 6;
const ALL_PER_HOUR = 120;
function spend(user: string) {
  const now = Date.now();
  const mine = (generations.get(user) ?? []).filter(t => now - t < 60000);
  const all = [...generations.values()].flat().filter(t => now - t < 3600000);
  if (mine.length >= PER_USER_PER_MINUTE || all.length >= ALL_PER_HOUR) throw new ServiceError('ANSWER_RATE', '새 설명 요청이 많아 잠시 후 다시 시도해 주세요. 저장된 설명은 계속 받을 수 있어요.', 429);
  mine.push(now);
  generations.set(user, mine);
}

async function execute(name: string, args: Record<string, unknown>, user = 'anonymous'): Promise<McpToolResult> {
  try {
    switch (name) {
      case 'search_place': {
        const input = searchInput.parse(args);
        return textResult(await searchAddresses(input.query, input.page, env));
      }
      case 'get_place_history': {
        const input = historyInput.parse(args);
        const address = await verifyAddress(input.token, env);
        const story = getDocentStory(address.sggNm, address.emdNm, [address.bdNm].filter(Boolean));
        const scenes = story.scenes.slice(input.offset, input.offset + input.limit).map(scene => ({
          id: scene.id,
          kind: scene.kind,
          date: scene.date,
          year: scene.year,
          title: scene.title,
          text: scene.text,
          scope: scene.scope,
          cutCount: scene.cutCount,
          photos: scene.photos.slice(0, 1).map(photo => ({
            previewUrl: photoResearchThumbnail(photo),
            sourceUrl: photo.sourceUrl,
            provider: photo.provider,
            relation: photo.relation,
            note: '이미지 이용조건과 장소 관계는 제공기관 원문을 확인해 주세요.',
          })),
          evidence: scene.evidence,
        }));
        const nextOffset = input.offset + scenes.length;
        return textResult({
          address,
          place: {records: [], status: 'unverified', note: '이 건물·부지와 직접 연결된 역사 기록은 아직 확인하지 못했습니다.'},
          neighborhood: {
            district: story.district,
            dong: story.dong,
            scenes,
            total: story.total,
            offset: input.offset,
            nextOffset: nextOffset < story.total ? nextOffset : null,
            photoRecords: story.photoRecords,
            photoGroups: story.photoGroups,
            unpictured: story.unpictured,
          },
          note: '장면은 동네 또는 자치구 범위의 기록입니다. 입력한 건물·부지와의 동일성을 뜻하지 않습니다. 출처별 확인 범위를 함께 읽어 주세요.',
        });
      }
      case 'generate_place_answer': {
        const input = answerInput.parse(args);
        let token = input.token;
        if (!token) {
          const found = await searchAddresses(input.address!, 1, env);
          if (found.candidates.length !== 1) {
            return textResult({needsChoice: true, note: found.candidates.length ? '주소 후보가 여러 개예요. 사용자가 고른 후보의 token으로 다시 호출하세요.' : '서울 주소를 찾지 못했어요. 도로명과 건물번호를 확인해 주세요.', candidates: found.candidates.slice(0, 10).map(c => ({roadAddr: c.roadAddr, jibunAddr: c.jibunAddr, token: c.token}))});
          }
          token = found.candidates[0].token;
        }
        const address = await verifyAddress(token, env);
        const story = getFullDocentStory(address.sggNm, address.emdNm);
        return textResult(await generatePlaceAnswer({address, story, question: input.question}, env, {beforeRequest: () => spend(user)}));
      }
      case 'get_answer_stats': {
        const input = z.object({days: z.number().int().min(1).max(365).default(30)}).strict().parse(args);
        return textResult(await placeAnswerStats(env.DB, input.days));
      }
      case 'get_archive_stats': {
        z.object({}).strict().parse(args);
        const stats: Record<string, unknown> = await archiveStats(database(env));
        // Return public counts only. Import logs can contain internal operational notes.
        const {sources, districts, dongs, historicalAreas, passages, facts, assets, originalSources, rightsChecked, storage, coverageNote} = stats;
        return textResult({sources, districts, dongs, historicalAreas, passages, facts, assets, originalSources, rightsChecked, storage, coverageNote});
      }
      default:
        throw new Error('Unknown tool');
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {content: [{type: 'text', text: '도구 입력 형식을 확인해 주세요. ' + error.issues.map(issue => issue.path.join('.') + ': ' + issue.message).join(' / ')}], isError: true};
    }
    if (error instanceof ServiceError) {
      return {content: [{type: 'text', text: error.code + ': ' + error.message}], isError: true};
    }
    throw error;
  }
}

/** Bound streamed bodies as well as requests with Content-Length. */
export async function POST(request: Request) {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') ?? '')) {
    return Response.json(rpcError(null, -32600, 'Content-Type must be application/json'), {status: 415, headers});
  }
  const declaredLength = Number(request.headers.get('content-length'));
  if (declaredLength > MAX_BODY_BYTES) {
    return Response.json(rpcError(null, -32600, 'Request too large'), {status: 413, headers});
  }
  const reader = request.body?.getReader();
  let body = '';
  let size = 0;
  if (reader) {
    const decoder = new TextDecoder();
    try {
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_BODY_BYTES) {
          await reader.cancel();
          return Response.json(rpcError(null, -32600, 'Request too large'), {status: 413, headers});
        }
        body += decoder.decode(value, {stream: true});
      }
      body += decoder.decode();
    } catch {
      return Response.json(rpcError(null, -32700, 'Unable to read request'), {status: 400, headers});
    } finally {
      reader.releaseLock();
    }
  }
  let message: unknown;
  try {
    message = JSON.parse(body);
  } catch {
    return Response.json(rpcError(null, -32700, 'Parse error'), {status: 400, headers});
  }
  const user = request.headers.get('oai-authenticated-user-id') ?? 'anonymous';
  const response = await handleMcpMessage(message, tools, (name, args) => execute(name, args, user));
  if (response === undefined) return new Response(null, {status: 202, headers});
  return Response.json(response, {headers});
}
