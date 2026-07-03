import { relative, resolve, sep } from "node:path";

export interface Workspace {
  path: string;
  active: boolean;
}

export function activeWorkspaces(env: NodeJS.ProcessEnv = process.env): Workspace[] {
  const explicitMany = parseWorkspaceList(env.AI_PROVIDER_LAB_WORKSPACES);
  const explicitOne = env.AI_PROVIDER_LAB_WORKSPACE?.trim();
  const paths = explicitMany.length ? explicitMany : explicitOne ? [explicitOne] : [process.cwd()];
  return unique(paths.map((path) => resolve(path))).map((path, index) => ({ path, active: index === 0 }));
}

export function resolveInsideWorkspace(relativePath: string, workspaces: Workspace[], requestedWorkspace?: string): string {
  const workspace = selectWorkspace(workspaces, requestedWorkspace);
  const root = resolve(workspace.path);
  const target = resolve(root, relativePath);
  const rel = relative(root, target);
  if (rel.startsWith("..") || rel === ".." || rel.includes(`..${sep}`)) {
    throw new Error(`Path escapes workspace: ${relativePath}`);
  }
  return target;
}

function selectWorkspace(workspaces: Workspace[], requestedWorkspace?: string): Workspace {
  if (requestedWorkspace) {
    const resolved = resolve(requestedWorkspace);
    const workspace = workspaces.find((candidate) => resolve(candidate.path) === resolved);
    if (!workspace) throw new Error(`Workspace is not active: ${requestedWorkspace}`);
    return workspace;
  }
  const workspace = workspaces[0];
  if (!workspace) throw new Error("No active workspace is configured.");
  return workspace;
}

function parseWorkspaceList(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
  } catch {
    return value.split(";").map((item) => item.trim()).filter(Boolean);
  }
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
