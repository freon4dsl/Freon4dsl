<script lang="ts">
    import type { TreeNodeType } from "$lib/tree/TreeNodeType"
    import TreeView from "$lib/tree/TreeView.svelte"
    import { interpreterTrace } from "$lib/stores/InfoPanelStore.svelte"

    let treeData: TreeNodeType | undefined = $derived(interpreterTrace.value)
    // const treeData: TreeNodeType = { name: "TITLE", children:  [
    //     {
    //         name: "Parent 1",
    //         children: [
    //             { name: "Child 1.1" },
    //             {
    //                 name: "Child 1.2",
    //                 children: [{ name: "Grandchild 1.2.1" }]
    //             }
    //         ]
    //     },
    //     {
    //         name: "Parent 2",
    //         children: [
    //             { name: "Child 2.1" },
    //             {
    //                 name: "Child 2.2",
    //                 children: [{ name: "Grandchild 2.2.1",
    //                     children: [
    //                         { name: "GrandGrandChild 2.2.1.1" },
    //                         {
    //                             name: "GrandGrandChild 2.2.1.2",
    //                             children: [{ name: "GrandGrandGrandchild 2.2.1.2.1" }]
    //                         }
    //                     ] }]
    //             }
    //         ]
    //     }
    // ]};

</script>

{#if treeData}
    <TreeView data={treeData.children} title={treeData.name}/>
{/if}
