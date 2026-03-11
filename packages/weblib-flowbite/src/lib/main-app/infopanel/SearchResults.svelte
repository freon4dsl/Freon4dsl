<script lang="ts">
    import { Spinner } from "flowbite-svelte";
    import { type FreError } from "@freon4dsl/core";
    import { searchResultLoading, searchResults } from "$lib/stores/InfoPanelStore.svelte";
    import { goToNode } from "$lib/ts-utils/CommonFunctions.js";
    import { ArrowRightOutline } from "flowbite-svelte-icons";

    let items: FreError[] = $derived(searchResults.list);
</script>

{#if searchResultLoading.value}
    <div class="freon-infopanel-loading">
        <Spinner class="me-3" size="4" />
        Data is being loaded...
    </div>
{:else}
    <div class="freon-infopanel-list">
        {#if items && items.length > 0}
            <table class="freon-infopanel-table">
                <tbody>
                {#each items as it, idx (idx)}
                    <tr class="freon-infopanel-row">
                        <td class="freon-infopanel-cell">
                            <div class="flex items-center justify-between gap-2">
                                    <span class="freon-infopanel-message">
                                        {it.message}
                                    </span>

                                {#if it.reportedOn}
                                    <button
                                        class="freon-infopanel-action"
                                        onclick={() => goToNode(it.reportedOn)}
                                    >
                                        <ArrowRightOutline class="freon-infopanel-action-icon" />
                                    </button>
                                {/if}
                            </div>
                        </td>
                    </tr>
                {/each}
                </tbody>
            </table>
        {:else}
            <div class="freon-infopanel-empty">
                No elements found.
            </div>
        {/if}
    </div>
{/if}
