
"use client";

import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [pasteUrl, setPasteUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function createPaste(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setPasteUrl("");
    setCopied(false);

    if (!content.trim()) {
      setError("Please enter some text before creating a paste.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/pastes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          ...(ttl !== "" && { ttl_seconds: Number(ttl) }),
          ...(maxViews !== "" && { max_views: Number(maxViews) }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create paste.");
      }

      setPasteUrl(data.url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(pasteUrl);
      setCopied(true);
    } catch {
      setError("Unable to copy automatically. Please copy the URL manually.");
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <h1 className="text-xl font-bold tracking-tight">
            Pastebin <span className="text-blue-400">Lite</span>
          </h1>

          <span className="rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-400">
            Simple text sharing
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-400">
            SHARE TEXT INSTANTLY
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Create a new paste
          </h2>

          <p className="mt-3 text-gray-400">
            Paste your text, create a link, and share it with anyone.
          </p>
        </div>

        <form onSubmit={createPaste}>
          <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
              <span className="text-sm font-medium text-gray-300">
                Paste content
              </span>

              <span className="text-xs text-gray-500">
                Plain text
              </span>
            </div>

            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Enter or paste your text here..."
              rows={12}
              className="w-full resize-y bg-gray-900 p-6 font-mono text-sm leading-7 text-gray-200 outline-none placeholder:text-gray-600"
            />

            <div className="grid gap-5 border-t border-gray-800 p-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Expiry time (seconds)
                </label>

                <input
                  type="number"
                  min="1"
                  value={ttl}
                  onChange={(event) => setTtl(event.target.value)}
                  placeholder="Leave empty for no expiry"
                  className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Maximum views
                </label>

                <input
                  type="number"
                  min="1"
                  value={maxViews}
                  onChange={(event) => setMaxViews(event.target.value)}
                  placeholder="Leave empty for unlimited"
                  className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="border-t border-gray-800 p-5">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {loading ? "Creating paste..." : "Create Paste"}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-5 rounded-lg border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {pasteUrl && (
          <div className="mt-6 rounded-xl border border-green-800 bg-green-950/30 p-5">
            <h3 className="font-semibold text-green-400">
              Your paste was created successfully!
            </h3>

            <p className="mt-2 text-sm text-gray-400">
              Share this link with anyone:
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                readOnly
                value={pasteUrl}
                className="min-w-0 flex-1 rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-gray-200"
              />

              <button
                type="button"
                onClick={copyUrl}
                className="rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-500"
              >
                {copied ? "Copied!" : "Copy link"}
              </button>
            </div>

            <a
              href={pasteUrl}
              className="mt-4 inline-block text-sm text-blue-400 hover:text-blue-300"
            >
              Open your paste →
            </a>
          </div>
        )}
      </section>
    </main>
  );
}
