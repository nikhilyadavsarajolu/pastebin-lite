
import { getRedis } from "@/lib/redis";


export async function GET() {
  try {
    const redis = getRedis();

    await redis.ping();

    return Response.json(
      { ok: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Health check failed:", error);

    return Response.json(
      { ok: false },
      { status: 503 }
    );
  }
}
