import {env} from 'cloudflare:workers';
import {z} from 'zod';
import {archiveStats, database} from '@/lib/archive-db';
import {getDocentStory} from '@/lib/docent-data';
import {photoResearchThumbnail} from '@/lib/photo-research';
import {searchAddresses, ServiceError, verifyAddress} from '@/lib/providers';
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

async function execute(name: string, args: Record<string, unknown>): Promise<McpToolResult> {
  try {
    switch (name) {
      case 'search_place': {
        const input = searchInput.parse(args);
        return textResult(await searchAddresses(input.query, input.page, env));
      }
      case 'get_place_history': {
        const input = historyInput.parse(args);
        const address = await verifyAddress(input.token, env);
        const story = getDocentStory(address.sggNm, address.emdNm);
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
  const response = await handleMcpMessage(message, tools, execute);
  if (response === undefined) return new Response(null, {status: 202, headers});
  return Response.json(response, {headers});
}
