import {AwsClient} from 'aws4fetch';

type Config = {accountId: string; bucket: string; accessKeyId: string; secretAccessKey: string};
type PutOptions = {httpMetadata?: {contentType?: string; contentDisposition?: string}; customMetadata?: Record<string, string>};

/** The subset of the R2 binding used by archive uploads and AI caches. */
export function createR2Http(config: Config, fetcher: typeof fetch = fetch): R2Bucket {
  const client = new AwsClient({accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey, service: 's3', region: 'auto'});
  function objectUrl(key: string) {
    // Preserve literal key segments; URL normalization must never change an object key.
    if (key.split('/').some(part => part === '.' || part === '..')) throw new Error('Invalid R2 object key');
    return `https://${config.accountId}.r2.cloudflarestorage.com/${encodeURIComponent(config.bucket)}/${key.split('/').map(encodeURIComponent).join('/')}`;
  }
  async function request(key: string, method: string, body?: BodyInit, headers?: Headers) {
    const signed = await client.sign(objectUrl(key), {method, headers, body});
    return fetcher(signed, {cache: 'no-store', signal: AbortSignal.timeout(25000)});
  }
  return {
    async get(key: string) {
      const response = await request(key, 'GET');
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`R2 read failed (${response.status})`);
      return {body: response.body, json: <T>() => response.json() as Promise<T>, text: () => response.text(), arrayBuffer: () => response.arrayBuffer()};
    },
    async put(key: string, value: string | ArrayBuffer | ArrayBufferView | Blob | ReadableStream, options?: PutOptions) {
      const headers = new Headers();
      if (options?.httpMetadata?.contentType) headers.set('Content-Type', options.httpMetadata.contentType);
      if (options?.httpMetadata?.contentDisposition) headers.set('Content-Disposition', options.httpMetadata.contentDisposition);
      for (const [name, content] of Object.entries(options?.customMetadata || {})) headers.set('x-amz-meta-' + name, content);
      // Buffer streaming uploads so SigV4 can hash the exact bytes.
      const body = await new Response(value as BodyInit).arrayBuffer();
      const response = await request(key, 'PUT', body, headers);
      if (!response.ok) throw new Error(`R2 write failed (${response.status})`);
      return {key};
    },
    async delete(key: string | string[]) {
      for (const item of Array.isArray(key) ? key : [key]) {
        const response = await request(item, 'DELETE');
        if (!response.ok && response.status !== 404) throw new Error(`R2 delete failed (${response.status})`);
      }
    },
  } as unknown as R2Bucket;
}
