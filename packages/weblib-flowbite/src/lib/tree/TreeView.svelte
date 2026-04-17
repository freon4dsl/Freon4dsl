<script lang="ts">
    import TreeNode from "./TreeNode.svelte"
    import { type TreeViewProps } from '$lib/tree/TreeNodeData';

    let { title, dataList }: TreeViewProps = $props();
</script>

{#if title}
    <h4 class="freon-infopanel-tree-title">{title}</h4>
{/if}

{#if dataList}
    <ul class="freon-infopanel-tree-list">
        {#each dataList as node, idx (idx)}
            <TreeNode data={node} />
        {/each}
    </ul>
{/if}
