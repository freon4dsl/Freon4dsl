<script lang="ts">
    import TreeView from "./TreeView.svelte"
    import type { TreeNodeProps } from "$lib/tree/TreeNodeType"
    import { AngleDownOutline, AngleRightOutline } from "flowbite-svelte-icons"

    let { node }: TreeNodeProps = $props();

    // State to track expansion
    let expanded: boolean = $state(false);

    function toggle() {
        expanded = !expanded;
    }
</script>

<li>
    <button onclick={toggle} style="cursor: pointer;" tabindex="0" role="button">
        {#if node.children}
            {#if expanded}
                <AngleDownOutline class="ms-0 inline h-3 w-3 dark:text-white" />
            {:else}
                <AngleRightOutline class="ms-0 inline h-3 w-3 dark:text-white" />
            {/if}
            {node.name}
        {:else}
            <span class="pl-[1rem]">{node.name}</span>
        {/if}

    </button>

    {#if expanded && node.children}
        <TreeView data={node.children} />
    {/if}
</li>

<style>
    li {
        text-align: -webkit-match-parent;
        padding-left: 1rem;
    }

</style>
