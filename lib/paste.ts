
import { getRedis } from "@/lib/redis";

export interface PasteRecord {
  content: string;
  createdAt: number;
  expiresAt: number | null;
  maxViews: number | null;
  views: number;
}

interface ConsumePasteResult {
  ok: boolean;
  content?: string;
  remaining_views?: number | null;
  expires_at?: number | null;
}



export function getEffectiveNow(request: Request): number {
  if (process.env.TEST_MODE === "1") {
    const testNow = request.headers.get("x-test-now-ms");

    if (testNow !== null) {
      const parsedTime = Number(testNow);

      if (Number.isFinite(parsedTime)) {
        return parsedTime;
      }
    }
  }

  return Date.now();
}



const consumePasteScript = `
local value = redis.call("GET", KEYS[1])

if not value then
  return cjson.encode({ ok = false })
end

local paste = cjson.decode(value)
local now = tonumber(ARGV[1])

if paste.expiresAt ~= cjson.null
  and now >= tonumber(paste.expiresAt) then
  return cjson.encode({ ok = false })
end

if paste.maxViews ~= cjson.null
  and tonumber(paste.views) >= tonumber(paste.maxViews) then
  return cjson.encode({ ok = false })
end

paste.views = tonumber(paste.views) + 1

redis.call("SET", KEYS[1], cjson.encode(paste))

local remaining = cjson.null

if paste.maxViews ~= cjson.null then
  remaining = tonumber(paste.maxViews) - paste.views
end

return cjson.encode({
  ok = true,
  content = paste.content,
  remaining_views = remaining,
  expires_at = paste.expiresAt
})
`;


export async function consumePaste(
  id: string,
  now: number
): Promise<ConsumePasteResult> {
  const redis = getRedis();

  const result = await redis.eval(
    consumePasteScript,
    [`paste:${id}`],
    [String(now)]
  );

  return result as unknown as ConsumePasteResult;
}
