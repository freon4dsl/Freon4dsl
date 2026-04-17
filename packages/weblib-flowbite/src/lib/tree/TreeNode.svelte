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

<li class="freon-infopanel-tree-node">
    <div class="freon-infopanel-tree-row">
        <button
            onclick={toggle}
            tabindex="0"
            class="freon-infopanel-tree-toggle"
        >
            {#if data.children}
                {#if expanded}
                    <AngleDownOutline class="freon-infopanel-tree-chevron" />
                {:else}
                    <AngleRightOutline class="freon-infopanel-tree-chevron" />
                {/if}

                <span>{data.name}</span>
            {:else}
                <span class="freon-infopanel-tree-leaf">{data.name}</span>
            {/if}
        </button>

        {#if data.aboutNode}
            <button
                class="freon-infopanel-action"
                onclick={() => goToNode(data.aboutNode)}
            >
                <ArrowRightOutline class="freon-infopanel-action-icon" />
            </button>
        {/if}
    </div>

    {#if expanded && data.children}
        <TreeView dataList={data.children} />
    {/if}
</li>
