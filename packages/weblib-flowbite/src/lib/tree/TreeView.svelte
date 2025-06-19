<script lang="ts">
    import TreeNode from "./TreeNode.svelte"
    import { type TreeViewProps } from '$lib/tree/TreeNodeData';

    let { title, dataList }: TreeViewProps = $props();
</script>

{#if title}
    <h4>{title}</h4>
{/if}
{#if dataList}
    <ul class="max-w-md space-y-1 text-light-base-500 dark:text-dark-base-400">
        {#each dataList as node}
            <TreeNode data={node}/>
        {/each}
    </ul>
{/if}

<style>
    ul {
        list-style-type: none;
    }
</style>
