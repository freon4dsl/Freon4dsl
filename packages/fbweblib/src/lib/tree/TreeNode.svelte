<script lang="ts">
    import TreeView from "./TreeView.svelte"
    import { type TreeNodeProps } from '$lib/tree/TreeNodeData';
    import { AngleDownOutline, AngleRightOutline, ArrowRightOutline } from "flowbite-svelte-icons"
    import { goToNode } from "$lib/ts-utils/CommonFunctions"

    let { data }: TreeNodeProps = $props();

    // State to track expansion
    let expanded: boolean = $state(false);

    function toggle() {
        expanded = !expanded;
    }
</script>

<li>
    <div class="flex flex-end p-0 m-0 w-full border-b border-gray-300 dark:border-gray-800">
    <button onclick={toggle} style="cursor: pointer;" tabindex="0">
        {#if data.children}
            {#if expanded}
                <AngleDownOutline class="ms-0 inline h-3 w-3 dark:text-white" />
            {:else}
                <AngleRightOutline class="ms-0 inline h-3 w-3 dark:text-white" />
            {/if}
            {data.name}
        {:else}
            <span class="pl-[1rem]">{data.name}</span>
        {/if}
    </button>
    {#if data.aboutNode}
        <button class="bg-transparent border-2 border-primary-600 hover:border-secondary-600 h-7 w-7 rounded-full inline-flex items-center ml-auto mr-1"
                onclick={() => goToNode(data.aboutNode)}>
            <ArrowRightOutline class="h-5 w-5 ms-0.5 text-black dark:text-white"/>
        </button>
    {/if}
    </div>

    {#if expanded && data.children}
        <TreeView dataList={data.children} />
    {/if}
</li>

<style>
    li {
        text-align: -webkit-match-parent;
        padding-left: 1rem;
    }

</style>
