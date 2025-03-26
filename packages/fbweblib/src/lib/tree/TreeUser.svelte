<script lang="ts">
    import TreeView from "./TreeView.svelte";
    import type { TreeNodeType } from "$lib/tree/TreeNodeType"

    const treeData: TreeNodeType[] = [
        {
            name: "Parent 1",
            children: [
                { name: "Child 1.1" },
                {
                    name: "Child 1.2",
                    children: [{ name: "Grandchild 1.2.1" }]
                }
            ]
        },
        {
            name: "Parent 2",
            children: [
                { name: "Child 2.1" },
                {
                    name: "Child 2.2",
                    children: [{ name: "Grandchild 2.2.1",
                        children: [
                            { name: "GrandGrandChild 2.2.1.1" },
                            {
                                name: "GrandGrandChild 2.2.1.2",
                                children: [{ name: "GrandGrandGrandchild 2.2.1.2.1" }]
                            }
                        ] }]
                }
            ]
        }
    ];

</script>

<TreeView data={treeData} title={"TITLE TITLE"}/>

