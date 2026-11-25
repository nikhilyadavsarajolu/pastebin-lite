
import { Suspense } from "react";
import { connection } from "next/server";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { consumePaste, getEffectiveNow } from "@/lib/paste";

interface PastePageProps {
  params: Promise<{ id: string }>;
}

export default function PastePage({ params }: PastePageProps) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-300">
          Loading paste...
        </main>
      }
    >
      <PasteContent params={params} />
    </Suspense>
  );
}

async function PasteContent({ params }: PastePageProps) {
  await connection();

  const { id } = await params;
  const requestHeaders = await headers();

  const request = new Request("https://pastebin-lite.internal", {
    headers: requestHeaders,
  });

  const now = getEffectiveNow(request);
  const result = await consumePaste(id, now);

  if (!result.ok) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Pastebin <span className="text-blue-400">Lite</span>
          </Link>
          <span className="rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-400">
            Shared paste
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-6">
          <p className="text-sm font-medium text-blue-400">
            PASTE VIEWER
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Your paste
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            View the shared text below.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900 shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="ml-3 text-sm text-gray-400">
                Paste content
              </span>
            </div>
            <span className="text-xs text-gray-500">
              Plain text
            </span>
          </div>

          <pre className="min-h-48 overflow-x-auto whitespace-pre-wrap break-words p-6 font-mono text-sm leading-7 text-gray-200">
            {result.content}
          </pre>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-800 px-5 py-4">
            <p className="text-sm text-gray-400">
              Remaining views:{" "}
              <span className="font-semibold text-white">
                {result.remaining_views == null
                  ? "Unlimited"
                  : result.remaining_views}
              </span>
            </p>
            <span className="text-xs text-gray-500">
              Pastebin Lite
            </span>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Shared text is displayed as plain text.
        </p>
      </section>
    </main>
  );
}
