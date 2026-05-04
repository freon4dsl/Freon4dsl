<script lang="ts">
    import { RenderComponent } from "@freon4dsl/core-svelte"
    import { inDevelopment, WebappConfigurator } from "$lib"
    import { type Box, FreEditor, notNullOrUndefined, type ProcessedDelta } from "@freon4dsl/core"
    import TreeView from "$lib/tree/TreeView.svelte"
    import type { TreeNodeData } from "$lib/tree/TreeNodeData"
    import { deltaEventToTreeNodeData } from "$lib/delta-helpers/Delta2TreeTransformer"

    const { pDelta, open }: { pDelta: ProcessedDelta, open: number | null } = $props();

    let editor = WebappConfigurator.getInstance().langEnv?.editor
    let originalNode = $derived(pDelta.originalNode)
    let newEditor: FreEditor | undefined = notNullOrUndefined(editor) ? new FreEditor(editor.projection, editor.environment) : undefined
    let originalBox: Box | undefined = notNullOrUndefined(originalNode) ? newEditor?.projection.getBox(originalNode) : undefined
    let originalNodeEl: HTMLDivElement | null = null

    // TODO Check using 'derived' for these vars instead of the effect
    // $effect(() => {
    //     if (notNullOrUndefined(originalNode)) {
    //         newEditor = new FreEditor(editor!.projection, editor!.environment)
    //         originalBox = newEditor?.projection.getBox(originalNode);
    //     }
    // })


    // $effect( () => {
    //     console.log(`DeltaDetail.$effect ${pDelta?.changedNode?.freId()}.${pDelta?.propertyName}`)
    //     if (open !== null) {
    //         // give changed property a "changed" style 
    //         const newbox = editor?.findBoxForNode(pDelta.changedNode!, pDelta.propertyName)
    //         const origbox = newEditor!.findBoxForNode2(pDelta.originalNode!, pDelta.propertyName)
    //         if (notNullOrUndefined(origbox)) {
    //             newEditor!.selectElement(pDelta.originalNode!, pDelta.propertyName)
    //             origbox.cssClass = "changed"
    //         }
    //     }
    // })
    // $effect( () => {
    //     console.log(`DeltaDetail.$effect ${pDelta?.changedNode?.freId()}.${pDelta?.propertyName}`)
    //     if (open !== null) {
    //         // give changed property a "changed" style 
    //         const newbox = editor?.findBoxForNode(pDelta.changedNode!, pDelta.propertyName)
    //         const origbox = newEditor!.findBoxForNode2(pDelta.originalNode!, pDelta.propertyName)
    //         console.log(`ORIG BOX ${origbox?.kind} NEW BOX ${newbox?.kind}`)
    //             if (notNullOrUndefined(origbox)) {
    //                 newEditor!.selectElement(pDelta.originalNode!, pDelta.propertyName)
    //                 origbox.cssClass = "changed"
    //             }
    //             if (notNullOrUndefined(newbox)) {
    //                 // newEditor!.selectElement(pDelta.originalNode!, pDelta.propertyName)
    //                 // newbox.cssClass = "changed"
    //             }
    //     }
    // })

    let nodeId = $derived(originalNode? originalNode.freId() : "unknown")

    let treeData: TreeNodeData | undefined = $derived(deltaEventToTreeNodeData(pDelta.delta))
    let showDeltaTree = $state(false)

    function toggleDeltaTree() {
        showDeltaTree = !showDeltaTree
    }
</script>

<div class="space-y-2 overflow-x-auto text-light-base-900 dark:text-dark-base-100">
    <div class="inline-block min-w-max">
        <div id="original-node-{nodeId}">
            Original node:
            <div class="bg-light-base-100 dark:bg-dark-base-800 p-2 rounded" bind:this={originalNodeEl}>
                {#if notNullOrUndefined(originalBox) && notNullOrUndefined(newEditor)}
                    <RenderComponent box={originalBox} editor={newEditor} readonly={true} />
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
