<script lang="ts">
    import { Spinner} from "flowbite-svelte"
    import { goToNode } from "$lib/ts-utils/CommonFunctions.js"
    import { ArrowRightOutline } from 'flowbite-svelte-icons';
    import { deltaResultLoading } from "$lib"
    import { deltaList, type ProcessedDelta } from "$lib/delta-mock/ProcessedDeltaList"
    import type { DeltaEvent } from "$lib/delta-mock/types"
    import { Popover, Button } from "flowbite-svelte"
    import DeltaDetails from "$lib/main-app/DeltaDetails.svelte"

    let items: ProcessedDelta[] = $derived(deltaList.deltas);

    function deltaAsString(d: DeltaEvent): string {
        return d.messageKind.toString();
    }
</script>


{#if deltaResultLoading.value}
    <div class="p-2">
        <Spinner class="me-3" size="4" />
        Data is being loaded...
    </div>
{:else }
    {#if items && items.length > 0}
        <table class="text-left text-sm text-light-base-500 dark:text-dark-base-40 w-full">
            <tbody class="divide-y">
            {#each items as it, i (it.delta.sequenceNumber)}
                <tr class="border-b last:border-b-0 bg-light-base-50 dark:bg-dark-base-800 dark:border-dark-base-700 hover:bg-light-base-50 dark:hover:bg-light-base-600 odd:bg-light-base-50 even:bg-light-base-50 odd:dark:bg-dark-base-800 even:dark:bg-dark-base-700">
                    <td class="whitespace-nowrap font-medium text-light-base-900 dark:text-dark-base-50 hover:bg-light-accent-100 dark:hover:bg-dark-accent-100 p-1.5">
                        <div class="flex items-center justify-between">
                            <Button
                                type="button"
                                id={`popoversource-${i}`}
                                class="inline-flex border-0 shadow-none ring-0 focus:ring-0 focus:outline-none bg-transparent px-0 py-0 underline font-medium text-light-base-900 dark:text-dark-base-500"
                            >
                            {deltaAsString(it.delta)}
                            </Button>
                            <Popover class="w-64 text-sm font-light " title="Details" triggeredBy={`#popoversource-${i}`} trigger="hover">
                                <DeltaDetails it={it} />
                            </Popover>
                            {#if it.changedNode}
                                <button class="bg-transparent border-2 border-light-base-600 hover:border-light-base-600 h-7 w-7 rounded-full inline-flex items-center ml-auto mr-1"
                                        onclick={() => goToNode(it.changedNode)}>
                                    <ArrowRightOutline class="h-5 w-5 ms-0.5 text-light-accent-900 dark:text-dark-accent-50"/>
                                </button>
                            {/if}
                        </div>
                    </td>
                </tr>
            {/each}
            </tbody>
        </table>
        <hr class="my-4 border-gray-200 dark:border-gray-700" />
    {:else}
        No deltas found.
    {/if }
{/if}

<!--class="inline bg-transparent p-0 underline font-medium text-light-base-900  dark:text-dark-base-500"-->

