import { spawn } from "node:child_process";

export type CliProvider = "antigravity" | "codex";

export type CliEvent =
  | { type: "delta"; text: string }
  | { type: "source"; url: string; title: string }
  | { type: "error"; message: string };

type RunOptions = {
  prompt: string;
  deep: boolean;
  cwd: string;
  signal?: AbortSignal;
  onEvent: (event: CliEvent) => void;
};

const URL_RE = /https?:\/\/[^\s<>)\]}"']+/g;

export function getCliProvider(): CliProvider {
  const value = (process.env["AI_CLI_PROVIDER"] ?? "antigravity").toLowerCase();
  if (value === "agy" || value === "antigravity") return "antigravity";
  if (value === "codex") return "codex";
  throw new Error(`Unsupported AI_CLI_PROVIDER: ${value}`);
}

export async function runCli(options: RunOptions) {
  const provider = getCliProvider();
  const command = provider === "antigravity" ? "agy" : "codex";
  const args =
    provider === "antigravity"
      ? [
          "-p",
          options.prompt,
          "--output-format",
          "stream-json",
          "--effort",
          options.deep ? "high" : "low",
          "--sandbox",
          "--disable-slash-commands",
        ]
      : [
          "exec",
          "--ephemeral",
          "--skip-git-repo-check",
          "--sandbox",
          "read-only",
          "--color",
          "never",
          "--json",
          "-",
        ];

  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: process.env,
      shell: false,
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdoutBuffer = "";
    let stderr = "";
    let emittedText = "";
    let finalText = "";

    const emitText = (text: string) => {
      if (!text) return;
      emittedText += text;
      options.onEvent({ type: "delta", text });
    };

    const parseLine = (line: string) => {
      if (!line.trim()) return;
      let event: Record<string, unknown>;
      try {
        event = JSON.parse(line) as Record<string, unknown>;
      } catch {
        return;
      }

      if (provider === "antigravity") {
        const update = event["step_update"] as { text_delta?: string } | undefined;
        if (event["event"] === "step_update" && update?.text_delta) emitText(update.text_delta);
        const result = event["result"] as { response?: string } | undefined;
        if (event["event"] === "result" && result?.response) finalText = result.response;
        return;
      }

      const item = event["item"] as { type?: string; text?: string } | undefined;
      if (event["type"] === "item.completed" && item?.type === "agent_message" && item.text) {
        finalText = item.text;
      }
    };

    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdoutBuffer += chunk;
      const lines = stdoutBuffer.split("\n");
      stdoutBuffer = lines.pop() ?? "";
      for (const line of lines) parseLine(line);
    });
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk: string) => {
      stderr = (stderr + chunk).slice(-4000);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      parseLine(stdoutBuffer);
      if (!emittedText && finalText) emitText(finalText);
      if (code !== 0) {
        reject(new Error(stderr.trim() || `${command} exited with status ${code}`));
        return;
      }
      for (const url of new Set(emittedText.match(URL_RE) ?? [])) {
        options.onEvent({ type: "source", url, title: url });
      }
      resolve();
    });

    if (provider === "codex") child.stdin.end(options.prompt);
    else child.stdin.end();

    options.signal?.addEventListener("abort", () => child.kill("SIGTERM"), { once: true });
  });
}
