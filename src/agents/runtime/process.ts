import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import type { AiRunRequest, AiStreamEmitter } from "../../core/types.js";
import { asErrorMessage } from "../../core/errors.js";
import type { CliAgentDefinition, CliEventMapper, CliRunOptions } from "../types.js";
import { findExecutable } from "./binary.js";
import { mapJsonLineEvent, mapPlainLineEvent } from "./events.js";

export async function runCliAgentProcess(
  definition: CliAgentDefinition,
  request: AiRunRequest,
  emit: AiStreamEmitter,
  options: CliRunOptions = {},
): Promise<void> {
  const binary = await findExecutable(definition.binaryNames, options.env);
  if (!binary) throw new Error(`${definition.label} CLI not found. Install it: ${definition.installUrl}`);

  const mapper = definition.eventFormat === "jsonl" ? mapJsonLineEvent : mapPlainLineEvent;
  await spawnAndStream({
    binary,
    args: definition.buildArgs(request),
    cwd: request.workspacePath ?? options.cwd,
    env: { ...process.env, ...options.env, ...definition.buildEnv?.(request) },
    abortSignal: request.abortSignal,
    mapper,
    emit,
  });
}

interface SpawnAndStreamOptions {
  binary: string;
  args: string[];
  cwd?: string;
  env: NodeJS.ProcessEnv;
  abortSignal?: AbortSignal;
  mapper: CliEventMapper;
  emit: AiStreamEmitter;
}

async function spawnAndStream(options: SpawnAndStreamOptions): Promise<void> {
  emitInit(options.emit);
  const child = spawn(options.binary, options.args, {
    cwd: options.cwd,
    env: options.env,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });

  const abort = () => child.kill();
  options.abortSignal?.addEventListener("abort", abort, { once: true });
  const stderr: string[] = [];
  const stdoutLines = createInterface({ input: child.stdout });
  const stderrLines = createInterface({ input: child.stderr });

  stdoutLines.on("line", (line) => {
    const event = options.mapper(`${line}\n`);
    if (event) options.emit(event);
  });
  stderrLines.on("line", (line) => stderr.push(line));

  await new Promise<void>((resolve, reject) => {
    child.on("error", reject);
    child.on("close", (code) => {
      options.abortSignal?.removeEventListener("abort", abort);
      if (code && code !== 0) {
        reject(new Error(`CLI agent exited with ${code}: ${stderr.slice(0, 3).join("\n")}`));
        return;
      }
      resolve();
    });
  }).catch((error) => {
    options.emit({ kind: "error", message: asErrorMessage(error) });
  });
  options.emit({ kind: "done" });
}

function emitInit(emit: AiStreamEmitter): void {
  emit({ kind: "init", sessionId: `cli-${Date.now()}` });
}
