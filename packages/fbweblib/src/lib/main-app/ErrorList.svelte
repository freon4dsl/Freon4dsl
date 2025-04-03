<script lang="ts">
    import { Spinner, Table, TableBody, TableBodyCell, TableBodyRow } from "flowbite-svelte"
    import { type FreError } from "@freon4dsl/core"
    import { errorsLoading, modelErrors } from "$lib/stores/InfoPanelStore.svelte.js"
    import { goToNode } from "$lib/ts-utils/CommonFunctions.js"

    // let items: FreError[] = $derived(modelErrors.list.filter(err => {
    //     err.severity === FreErrorSeverity.Error
    // }));
    let items: FreError[] = $derived(modelErrors.list);
</script>


{#if errorsLoading.value}
    <div class="p-2">
        <Spinner class="me-3" size="4" />
        Data is being loaded...
    </div>
{:else }
    {#if items && items.length > 0}
        <table class="text-left text-sm text-secondary-500 dark:text-secondary-40 w-full">
            <tbody class="divide-y">
            {#each items as it}
                <tr class="border-b last:border-b-0 bg-white dark:bg-secondary-800 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-600 odd:bg-white even:bg-secondary-50 odd:dark:bg-secondary-800 even:dark:bg-secondary-700">
                    <td class="whitespace-nowrap font-medium text-secondary-900 dark:text-primary-50 p-1.5">
                        <button class="font-medium text-primary-900 hover:underline dark:text-primary-500"onclick={() => goToNode(it.reportedOn)}>{it.message}
                        </button>
                    </td>
                </tr>
            {/each}
            </tbody>
        </table>
    {:else}
        No errors found.
    {/if }
{/if}

