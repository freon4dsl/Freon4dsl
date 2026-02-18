<script lang="ts">
    import type { ProcessedDelta } from "$lib/delta-mock/ProcessedDeltaList"
    import { RenderComponent } from "@freon4dsl/core-svelte"
    import { WebappConfigurator } from "$lib"
    import { type Box, notNullOrUndefined } from "@freon4dsl/core"

    const { it } = $props<{ it: ProcessedDelta }>();

    let editor = WebappConfigurator.getInstance().langEnv?.editor
    let originalNode = WebappConfigurator.getInstance().langEnv?.editor.copiedElement
    let originalBox: Box | undefined = undefined
    if (notNullOrUndefined(originalNode)) {
        originalBox = editor?.projection.getBox(originalNode);
    }

    let nodeId = originalNode? originalNode.freId() : "unknown";
</script>

<div class="space-y-2 overflow-x-auto text-light-base-900">
    <div>
        Delta:
        <pre class="bg-gray-100 dark:bg-gray-800 p-2 rounded">
            {JSON.stringify(it.delta, null, 2)}
        </pre>
    </div>
    <div id="original-node-{nodeId}">
        Original node:
        <div class="bg-gray-100 dark:bg-gray-800 p-2 rounded">
            {#if notNullOrUndefined(originalBox)}
                <RenderComponent box={originalBox} editor={editor} readonly={true} />
            {:else}
                <div>No box found: {nodeId}</div>
            {/if}
        </div>
    </div>
</div>
