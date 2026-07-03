import type { AiRunRequest } from "../../core/types.js";
import type { CliAgentDefinition } from "../types.js";

function promptArg(request: AiRunRequest): string {
  return [request.systemPrompt && `System instructions:\n${request.systemPrompt}`, `User request:\n${request.message}`]
    .filter(Boolean)
    .join("\n\n");
}

function workspaceEnv(request: AiRunRequest): Record<string, string> {
  const env: Record<string, string> = {};
  if (request.workspacePath) env.AI_PROVIDER_LAB_WORKSPACE = request.workspacePath;
  if (request.workspacePaths?.length) env.AI_PROVIDER_LAB_WORKSPACES = JSON.stringify(request.workspacePaths);
  return env;
}

function claudePermissionArgs(request: AiRunRequest): string[] {
  return ["--permission-mode", request.permissionMode === "power_user" ? "dontAsk" : "acceptEdits"];
}

function codexPermissionArgs(request: AiRunRequest): string[] {
  return ["--sandbox", "workspace-write", "--ask-for-approval", "never", ...(request.workspacePath ? ["--cd", request.workspacePath] : [])];
}

export const CLI_AGENT_DEFINITIONS: readonly CliAgentDefinition[] = [
  {
    id: "claude_code",
    label: "Claude Code",
    shortLabel: "Claude",
    binaryNames: ["claude", "claude.cmd", "claude.exe"],
    installUrl: "https://docs.anthropic.com/en/docs/claude-code",
    eventFormat: "jsonl",
    maturity: "verified",
    verificationNotes: "Verified against Claude Code help: --print and --output-format stream-json are supported.",
    docs: "Claude Code adapter. Safe mode should prefer workspace-scoped MCP/tool configuration.",
    buildArgs: (request) => ["--print", "--output-format", "stream-json", ...claudePermissionArgs(request), promptArg(request)],
    buildEnv: workspaceEnv,
    permissionSemantics: {
      safe: "Use workspace-scoped tools and avoid broad shell access.",
      power_user: "May enable broader local commands, but do not use dangerous permission bypass flags.",
    },
  },
  {
    id: "codex",
    label: "Codex",
    shortLabel: "Codex",
    binaryNames: ["codex", "codex.cmd", "codex.exe"],
    installUrl: "https://developers.openai.com/codex/cli",
    eventFormat: "jsonl",
    maturity: "verified",
    verificationNotes: "Verified against Codex CLI help: exec --json, --sandbox, --ask-for-approval, and --cd are supported.",
    docs: "Codex CLI adapter. Keep sandboxing explicit and pass the prompt as the final argument.",
    buildArgs: (request) => ["exec", "--json", ...codexPermissionArgs(request), promptArg(request)],
    buildEnv: workspaceEnv,
    permissionSemantics: {
      safe: "Use workspace-write semantics for the active workspace.",
      power_user: "Keep approval disabled only for scripted runs; do not expand outside the workspace by default.",
    },
  },
  {
    id: "opencode",
    label: "OpenCode",
    shortLabel: "OpenCode",
    binaryNames: ["opencode", "opencode.cmd", "opencode.exe"],
    installUrl: "https://opencode.ai/docs/",
    eventFormat: "jsonl",
    maturity: "verified",
    verificationNotes: "Verified against OpenCode help: run --format json is supported.",
    docs: "OpenCode adapter. Use transient config content for per-run MCP and permission settings.",
    buildArgs: (request) => ["run", "--format", "json", promptArg(request)],
    buildEnv: workspaceEnv,
    permissionSemantics: {
      safe: "Deny bash and external directories in transient config.",
      power_user: "Allow bash but keep external directories denied unless the caller opts in.",
    },
  },
  {
    id: "copilot",
    label: "GitHub Copilot CLI",
    shortLabel: "Copilot",
    binaryNames: ["gh", "gh.cmd", "gh.exe"],
    installUrl: "https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/install-copilot-cli",
    eventFormat: "line",
    maturity: "template",
    verificationNotes: "Template only; verify the current gh copilot non-interactive contract before enabling run().",
    docs: "GitHub Copilot CLI adapter via `gh copilot`.",
    buildArgs: (request) => ["copilot", "suggest", promptArg(request)],
    buildEnv: workspaceEnv,
    permissionSemantics: {
      safe: "Suggest commands only; do not execute generated commands.",
      power_user: "Still suggest-only in this lab unless an explicit executor is added.",
    },
  },
  {
    id: "antigravity",
    label: "Gemini / Antigravity CLI",
    shortLabel: "Antigravity",
    binaryNames: ["antigravity", "antigravity.cmd", "antigravity.exe", "gemini", "gemini.cmd", "gemini.exe"],
    installUrl: "https://antigravity.google/docs/cli/install",
    eventFormat: "line",
    maturity: "template",
    verificationNotes: "Template only; verify the current Gemini/Antigravity CLI contract before enabling run().",
    docs: "Gemini/Antigravity local CLI adapter. Kept as an agent target, not a direct Gemini provider.",
    buildArgs: (request) => ["--prompt", promptArg(request)],
    buildEnv: workspaceEnv,
    permissionSemantics: {
      safe: "Use read/write only within the selected workspace.",
      power_user: "May allow broader local command features when the CLI supports them.",
    },
  },
  {
    id: "pi",
    label: "Pi",
    shortLabel: "Pi",
    binaryNames: ["pi", "pi.cmd", "pi.exe"],
    installUrl: "https://pi.dev",
    eventFormat: "jsonl",
    maturity: "template",
    verificationNotes: "Template only; verify the current Pi CLI contract before enabling run().",
    docs: "Pi CLI adapter template.",
    buildArgs: (request) => ["run", "--json", promptArg(request)],
    buildEnv: workspaceEnv,
    permissionSemantics: {
      safe: "Use the same conservative workspace-scoped config as power_user until Pi exposes finer controls.",
      power_user: "Currently equivalent to safe in this lab.",
    },
  },
  {
    id: "kiro",
    label: "Kiro",
    shortLabel: "Kiro",
    binaryNames: ["kiro", "kiro.cmd", "kiro.exe"],
    installUrl: "https://kiro.dev/docs/cli",
    eventFormat: "line",
    maturity: "template",
    verificationNotes: "Template only; verify the current Kiro CLI contract before enabling run().",
    docs: "Kiro CLI adapter template.",
    buildArgs: (request) => ["run", promptArg(request)],
    buildEnv: workspaceEnv,
    permissionSemantics: {
      safe: "Prefer non-destructive workspace-scoped operations.",
      power_user: "Allow broader local operations only through documented CLI flags.",
    },
  },
  {
    id: "hermes",
    label: "Hermes Agent",
    shortLabel: "Hermes",
    binaryNames: ["hermes", "hermes.cmd", "hermes.exe"],
    installUrl: "https://hermes-agent.nousresearch.com/docs/getting-started/quickstart",
    eventFormat: "line",
    maturity: "verified",
    verificationNotes: "Verified against Hermes help: chat --query and --quiet are supported for non-interactive output.",
    docs: "Hermes Agent adapter template.",
    buildArgs: (request) => ["chat", "--query", promptArg(request), "--quiet"],
    buildEnv: workspaceEnv,
    permissionSemantics: {
      safe: "Stay inside the active workspace and avoid shell escape hatches.",
      power_user: "May enable documented power-user flags without dangerous bypass defaults.",
    },
  },
];
