<script lang="ts">
    import type { TreeNodeData } from "$lib/tree/TreeNodeData"
    import TreeView from "$lib/tree/TreeView.svelte"
    import { interpreterTrace, interpreterResultLoading } from "$lib/stores/InfoPanelStore.svelte"
    import { Spinner } from "flowbite-svelte"

    let treeData: TreeNodeData | undefined = $derived(interpreterTrace.value)

</script>

{#if interpreterResultLoading.value}
    <div class="freon-infopanel-loading">
        <Spinner class="me-3" size="4" />
        Data is being loaded...
    </div>
{:else}
    <div class="freon-infopanel-tree">
        {#if treeData}
            <TreeView dataList={treeData.children} title={treeData.name} />
        {:else}
            <div class="freon-infopanel-empty">
                No interpreter results found.
            </div>
        {/if}
    </div>
{/if}
