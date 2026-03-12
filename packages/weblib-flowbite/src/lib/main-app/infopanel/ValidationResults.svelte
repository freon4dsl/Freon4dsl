<script lang="ts">
    import { Spinner} from "flowbite-svelte"
    import { type FreError } from "@freon4dsl/core"
    import { errorsLoading, modelErrors } from "$lib/stores/InfoPanelStore.svelte.js"
    import { goToNode } from "$lib/ts-utils/CommonFunctions.js"
    import { ArrowRightOutline } from 'flowbite-svelte-icons';

    // let items: FreError[] = $derived(modelErrors.list.filter(err => {
    //     err.severity === FreErrorSeverity.Error
    // }));
    let items: FreError[] = $derived(modelErrors.list);
</script>


{#if errorsLoading.value}
    <div class="freon-infopanel-loading">
        <Spinner class="me-3" size="4" />
        Data is being loaded...
    </div>
{:else}
    {#if items && items.length > 0}
        <div class="freon-infopanel-list">
            <table class="freon-infopanel-table">
                <tbody>
                {#each items as it, index (index)}
                    <tr class="freon-infopanel-row">
                        <td class="freon-infopanel-cell freon-infopanel-cell-hover">
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
        </div>
    {:else}
        <div class="freon-infopanel-empty">
            No errors found.
        </div>
    {/if}
{/if}

