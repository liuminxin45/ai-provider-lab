import { AiProviderLabError, asErrorMessage } from "./errors.js";
import type { AiRunRequest, AiStreamEmitter, AiTargetAdapter, AiTargetInspection, AiTargetSummary } from "./types.js";

export class AdapterRegistry {
  private readonly adapters = new Map<string, AiTargetAdapter>();

  register(adapter: AiTargetAdapter): void {
    if (this.adapters.has(adapter.id)) {
      throw new AiProviderLabError(`Duplicate AI target adapter: ${adapter.id}`, "duplicate_adapter");
    }
    this.adapters.set(adapter.id, adapter);
  }

  get(targetId: string): AiTargetAdapter {
    const adapter = this.adapters.get(targetId);
    if (!adapter) {
      throw new AiProviderLabError(`Unknown AI target: ${targetId}`, "unknown_target");
    }
    return adapter;
  }

  list(): AiTargetSummary[] {
    return [...this.adapters.values()].map((adapter) => ({
      id: adapter.id,
      kind: adapter.kind,
      label: adapter.label,
      shortLabel: adapter.shortLabel,
      capabilities: adapter.capabilities,
    }));
  }

  async inspectTargets(request: AiRunRequest = { message: "inspect target" }): Promise<AiTargetInspection[]> {
    return Promise.all(
      [...this.adapters.values()].map(async (adapter) => ({
        id: adapter.id,
        kind: adapter.kind,
        label: adapter.label,
        shortLabel: adapter.shortLabel,
        capabilities: adapter.capabilities,
        detection: await adapter.detect(),
        config: adapter.buildConfig(request),
        docs: adapter.docs,
      })),
    );
  }

  async runTarget(targetId: string, request: AiRunRequest, emit: AiStreamEmitter): Promise<void> {
    try {
      await this.get(targetId).run(request, emit);
    } catch (error) {
      emit({ kind: "error", message: asErrorMessage(error) });
      emit({ kind: "done" });
    }
  }
}
