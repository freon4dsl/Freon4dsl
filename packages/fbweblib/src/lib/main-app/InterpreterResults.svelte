<script lang="ts">
    import type { TreeNodeType } from "$lib/tree/TreeNodeType"
    import TreeView from "$lib/tree/TreeView.svelte"
    import { interpreterTrace, interpreterResultLoading } from "$lib/stores/InfoPanelStore.svelte"
    import { Spinner } from "flowbite-svelte"

    let treeData: TreeNodeType | undefined = $derived(interpreterTrace.value)

</script>

{#if interpreterResultLoading.value}
    <div class="p-2">
        <Spinner class="me-3" size="4" />
        Data is being loaded...
    </div>
{:else }
    <div class="relative overflow-x-auto">
        {#if treeData}
            <TreeView data={treeData.children} title={treeData.name}/>
        {/if}
    </div>
{/if}
