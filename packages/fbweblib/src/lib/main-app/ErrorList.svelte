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
        <table class="text-left text-sm text-gray-500 dark:text-gray-40 w-full">
            <tbody class="divide-y">
            {#each items as it}
                <tr class="border-b last:border-b-0 bg-white dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 odd:bg-white even:bg-gray-50 odd:dark:bg-gray-800 even:dark:bg-gray-700">
                    <td class="whitespace-nowrap font-medium text-gray-900 dark:text-white p-1.5">
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

