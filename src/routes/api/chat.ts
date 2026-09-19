import { createFileRoute } from "@tanstack/react-router";

import { buildSystemPrompt } from "@/lib/expert-prompt.server";
import { getCliProvider, runCli } from "@/lib/cli-provider.server";

type InMsg = { role: "user" | "assistant"; content: string };

type Body = {
  messages?: InMsg[];
  sectionFocus?: string;
  deep?: boolean;
  savedFacts?: string;
};

function send(controller: ReadableStreamDefaultController, obj: unknown) {
  controller.enqueue(new TextEncoder().encode(JSON.stringify(obj) + "\n"));
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        const messages = (body.messages ?? []).slice(-24);
        if (messages.length === 0) return new Response("No messages", { status: 400 });

        const transcript = messages
          .map(
            (message) => `${message.role === "user" ? "المستخدم" : "المساعد"}: ${message.content}`,
          )
          .join("\n\n");
        const prompt = `${buildSystemPrompt({
          sectionFocus: body.sectionFocus,
          deep: body.deep,
          savedFacts: body.savedFacts,
        })}\n\n## المحادثة\n${transcript}\n\nأجب عن رسالة المستخدم الأخيرة فقط.`;

        const stream = new ReadableStream({
          async start(controller) {
            try {
              await runCli({
                prompt,
                deep: Boolean(body.deep),
                cwd: process.cwd(),
                signal: request.signal,
                onEvent: (event) => send(controller, event),
              });
              send(controller, { type: "done" });
            } catch (error) {
              console.error(error);
              const provider = getCliProvider() === "codex" ? "Codex CLI" : "Antigravity CLI";
              send(controller, {
                type: "error",
                message: `تعذّر تشغيل ${provider}. تحقق من التثبيت وتسجيل الدخول وإعدادات الخادم.`,
              });
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "content-type": "application/x-ndjson; charset=utf-8",
            "cache-control": "no-cache",
          },
        });
      },
    },
  },
});
