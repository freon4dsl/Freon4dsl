<script lang="ts">
    import TreeNode from "./TreeNode.svelte"
    import type { TreeViewProps } from "$lib/tree/TreeNodeType"

    let { title, data }: TreeViewProps = $props();
</script>

{#if title}
    <h4>{title}</h4>
{/if}
{#if data}
    <ul class="max-w-md space-y-1 text-gray-500 dark:text-gray-400">
        {#each data as node}
            <TreeNode node={node}/>
        {/each}
    </ul>
{/if}

<style>
    ul {
        list-style-type: none;
    }
</style>
