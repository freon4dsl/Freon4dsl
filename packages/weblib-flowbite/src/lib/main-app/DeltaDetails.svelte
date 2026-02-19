<script lang="ts">
    import type { ProcessedDelta } from "$lib/delta-mock/ProcessedDeltaList"
    import { RenderComponent } from "@freon4dsl/core-svelte"
    import { inDevelopment, WebappConfigurator } from "$lib"
    import { type Box, notNullOrUndefined } from "@freon4dsl/core"
    import TreeView from "$lib/tree/TreeView.svelte"
    import type { TreeNodeData } from "$lib/tree/TreeNodeData"
    import { deltaEventToTreeNodeData } from "$lib/delta-helpers/Delta2TreeTransformer"

    const { it } = $props<{ it: ProcessedDelta }>();

    let editor = WebappConfigurator.getInstance().langEnv?.editor
    let originalNode = WebappConfigurator.getInstance().langEnv?.editor.copiedElement
    let originalBox: Box | undefined = undefined
    if (notNullOrUndefined(originalNode)) {
        originalBox = editor?.projection.getBox(originalNode);
    }

    let nodeId = originalNode? originalNode.freId() : "unknown";

    let treeData: TreeNodeData | undefined = deltaEventToTreeNodeData(it.delta)
    let showDeltaTree = $state(false)

    function toggleDeltaTree() {
        showDeltaTree = !showDeltaTree
    }
</script>

<div class="space-y-2 overflow-x-auto text-light-base-900 dark:text-dark-base-100">
    <div class="inline-block min-w-max">
        <div id="original-node-{nodeId}">
            Original node:
            <div class="bg-light-base-100 dark:bg-dark-base-800 p-2 rounded">
                {#if notNullOrUndefined(originalBox)}
                    <RenderComponent box={originalBox} editor={editor} readonly={true} />
                {:else}
                    <div>No box found: {nodeId}</div>
                {/if}
            </div>
        </div>
        {#if inDevelopment.value}
            <div>
                <!-- Debug toggle -->
                <div class="mt-2">
                    <button
                        type="button"
                        class="px-3 py-1.5 rounded bg-light-base-200 hover:bg-light-base-300 dark:bg-dark-base-700 dark:hover:bg-dark-base-600"
                        aria-expanded={showDeltaTree}
                        onclick={toggleDeltaTree}
                    >
                        {showDeltaTree ? "Hide delta details" : "Show delta details"}
                    </button>
                </div>

                <!-- Tree view -->
                {#if showDeltaTree}
                    <div class="mt-2 bg-light-base-100 dark:bg-dark-base-800 p-2 rounded">
                        {#if treeData}
                            <TreeView dataList={treeData.children} title={treeData.name} />
                        {:else}
                            <div class="text-sm opacity-70">No delta details available</div>
                        {/if}
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>
