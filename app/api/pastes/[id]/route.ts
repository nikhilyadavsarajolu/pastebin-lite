
import { consumePaste, getEffectiveNow } from "@/lib/paste";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return Response.json(
        { error: "Paste ID is required" },
        { status: 400 }
      );
    }

    const now = getEffectiveNow(request);
    const result = await consumePaste(id, now);

    if (!result.ok) {
      return Response.json(
        { error: "Paste not found or unavailable" },
        { status: 404 }
      );
    }

    return Response.json({
      content: result.content,
      remaining_views: result.remaining_views,
      expires_at:
        result.expires_at === null || result.expires_at === undefined
          ? null
          : new Date(result.expires_at).toISOString(),
    });
  } catch (error) {
    console.error("Paste retrieval failed:", error);

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
