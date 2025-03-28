<script lang="ts">
    import TreeView from "./TreeView.svelte"
    import { FreTreeNodeType, type TreeNodeProps } from "$lib/tree/TreeNodeType"
    import { AngleDownOutline, AngleRightOutline, ArrowRightOutline } from "flowbite-svelte-icons"
    import { goToNode } from "$lib/ts-utils/CommonFunctions"
    import { Button } from "flowbite-svelte"

    let { node }: TreeNodeProps<FreTreeNodeType> = $props();

    // State to track expansion
    let expanded: boolean = $state(false);

    function toggle() {
        expanded = !expanded;
    }
</script>

<li>
    <div class="flex flex-end p-0 m-0 w-full border-b border-gray-300 dark:border-gray-800">
    <button onclick={toggle} style="cursor: pointer;" tabindex="0">
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
    {#if node.location}
        <button class="bg-transparent border-2 border-primary-600 hover:border-secondary-600 h-7 w-7 rounded-full inline-flex items-center ml-auto mr-1" onclick={() => goToNode(node.location)}>
            <ArrowRightOutline class="h-5 w-5 ms-0.5 text-black dark:text-white"/>
        </button>
    {/if}
    </div>

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
