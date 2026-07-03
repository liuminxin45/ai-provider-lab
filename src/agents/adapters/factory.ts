import { targetId } from "../../core/ids.js";
import { DEFAULT_CAPABILITIES } from "../../core/types.js";
import type { AiRunRequest } from "../../core/types.js";
import type { CliAgentAdapter, CliAgentDefinition } from "../types.js";
import { findExecutable, versionForBinary } from "../runtime/binary.js";
import { runCliAgentProcess } from "../runtime/process.js";

export function createCliAgentAdapter(definition: CliAgentDefinition): CliAgentAdapter {
  return {
    id: targetId("agent", definition.id),
    kind: "agent",
    label: definition.label,
    shortLabel: definition.shortLabel,
    capabilities: {
      ...DEFAULT_CAPABILITIES,
      streaming: true,
      tools: true,
    },
    docs: `${definition.docs}\n\nSafe: ${definition.permissionSemantics.safe}\nPower user: ${definition.permissionSemantics.power_user}`,
    detect: async () => {
      const binary = await findExecutable(definition.binaryNames);
      if (definition.maturity === "template") {
        return {
          installed: Boolean(binary),
          status: "template",
          version: binary ? await versionForBinary(binary) : undefined,
          reason: `${definition.label} is a template adapter; verify the real CLI contract before enabling run().`,
        };
      }
      if (!binary) return { installed: false, status: "missing", reason: `${definition.label} not found on PATH.` };
      return { installed: true, status: "ready", version: await versionForBinary(binary) };
    },
    buildConfig: (request?: AiRunRequest) => {
      const permissionMode = request?.permissionMode ?? "safe";
      return {
        binaryNames: definition.binaryNames,
        maturity: definition.maturity,
        permissionMode,
        permissionSemantics: definition.permissionSemantics[permissionMode],
        verificationNotes: definition.verificationNotes,
        env: definition.buildEnv?.(request ?? { message: "" }),
      };
    },
    run: async (request, emit) => {
      if (definition.maturity === "template") {
        throw new Error(`${definition.label} adapter is a template. Verify binary args, event format, and permission flags before enabling run().`);
      }
      await runCliAgentProcess(definition, request, emit);
    },
  };
}
