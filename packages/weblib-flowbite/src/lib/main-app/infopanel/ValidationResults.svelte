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
    <div class="p-2">
        <Spinner class="me-3" size="4" />
        Data is being loaded...
    </div>
{:else }
    {#if items && items.length > 0}
        <table class="text-left text-sm text-light-base-500 dark:text-dark-base-40 w-full">
            <tbody class="divide-y">
            {#each items as it}
                <tr class="border-b last:border-b-0 bg-light-base-50 dark:bg-dark-base-800 dark:border-dark-base-700 hover:bg-light-base-50 dark:hover:bg-light-base-600 odd:bg-light-base-50 even:bg-light-base-50 odd:dark:bg-dark-base-800 even:dark:bg-dark-base-700">
                    <td class="whitespace-nowrap font-medium text-light-base-900 dark:text-dark-base-50 hover:bg-light-accent-100 dark:hover:bg-dark-accent-100 p-1.5">
                        <div class="flex items-center justify-between">
                        <span class="font-medium text-light-base-900  dark:text-dark-base-500">
                            {it.message}
                        </span>
                        {#if it.reportedOn}
                            <button class="bg-transparent border-2 border-light-base-600 hover:border-light-base-600 h-7 w-7 rounded-full inline-flex items-center ml-auto mr-1"
                                    onclick={() => goToNode(it.reportedOn)}>
                                <ArrowRightOutline class="h-5 w-5 ms-0.5 text-light-accent-900 dark:text-dark-accent-50"/>
                            </button>
                        {/if}
                        </div>
                    </td>
                </tr>
            {/each}
            </tbody>
        </table>
    {:else}
        No errors found.
    {/if }
{/if}

