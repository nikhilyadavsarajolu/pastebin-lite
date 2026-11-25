
import { randomUUID } from "node:crypto";
import { getRedis } from "@/lib/redis";
import { getEffectiveNow, type PasteRecord } from "@/lib/paste";

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return Response.json(
        { error: "Request body must be a JSON object" },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;

    if (
      typeof data.content !== "string" ||
      data.content.length === 0
    ) {
      return Response.json(
        { error: "Content must be a non-empty string" },
        { status: 400 }
      );
    }

    if (
      "ttl_seconds" in data &&
      (!Number.isInteger(data.ttl_seconds) ||
        (data.ttl_seconds as number) < 1)
    ) {
      return Response.json(
        { error: "ttl_seconds must be an integer >= 1" },
        { status: 400 }
      );
    }

    if (
      "max_views" in data &&
      (!Number.isInteger(data.max_views) ||
        (data.max_views as number) < 1)
    ) {
      return Response.json(
        { error: "max_views must be an integer >= 1" },
        { status: 400 }
      );
    }

    const now = getEffectiveNow(request);
    const id = randomUUID();

    const ttlSeconds =
      data.ttl_seconds as number | undefined;

    const maxViews =
      data.max_views as number | undefined;

    const paste: PasteRecord = {
      content: data.content,
      createdAt: now,
      expiresAt:
        ttlSeconds !== undefined
          ? now + ttlSeconds * 1000
          : null,
      maxViews: maxViews ?? null,
      views: 0,
    };

    const redis = getRedis();

    await redis.set(
      `paste:${id}`,
      JSON.stringify(paste)
    );

    const origin = new URL(request.url).origin;

    return Response.json(
      {
        id,
        url: `${origin}/p/${id}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Paste creation failed:", error);

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
