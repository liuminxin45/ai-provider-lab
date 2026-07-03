import { access } from "node:fs/promises";
import { delimiter, join } from "node:path";
import { constants } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function findExecutable(binaryNames: string[], env: NodeJS.ProcessEnv = process.env): Promise<string | undefined> {
  const pathEntries = (env.PATH ?? "").split(delimiter).filter(Boolean);
  const candidates = pathEntries.flatMap((entry) => binaryNames.map((binary) => join(entry, binary)));
  for (const candidate of candidates) {
    if (await isExecutable(candidate)) return candidate;
  }
  return undefined;
}

export async function versionForBinary(binary: string): Promise<string | undefined> {
  try {
    const { stdout } = await execFileAsync(binary, ["--version"], { timeout: 1500 });
    return stdout.trim() || undefined;
  } catch {
    return undefined;
  }
}

async function isExecutable(path: string): Promise<boolean> {
  try {
    await access(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}
