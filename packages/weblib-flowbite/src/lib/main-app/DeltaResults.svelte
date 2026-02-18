<script lang="ts">
    import { Spinner} from "flowbite-svelte"
    import { deltaResultLoading, WebappConfigurator } from "$lib"
    import { deltaList, type ProcessedDelta } from "$lib/delta-mock/ProcessedDeltaList"
    import type { DeltaEvent } from "$lib/delta-mock/types"
    import DeltaDetails from "$lib/main-app/DeltaDetails.svelte"
    import { goToNode } from "$lib/ts-utils/CommonFunctions"
    import { ArrowRightOutline } from "flowbite-svelte-icons"

    let items: ProcessedDelta[] = deltaList.deltas;

    function deltaAsString(d: DeltaEvent): string {
        return d.messageKind.toString();
    }

    // one-open-at-a-time
    let openIndex = $state<number | null>(null);

    function toggle(idx: number) {
        openIndex = (openIndex === idx) ? null : idx;
    }

    // because we have an extra button to show the changed node in the editor panel,
    // we need to stop the native <details> toggle, and have our own
    function toggleNoDefault(ev: Event, idx: number) {
        ev.preventDefault(); // stop native <details> toggle
        toggle(idx);         // do our own toggle
    }

    function onKeydown(ev: KeyboardEvent, idx: number) {
        if (ev.key === "Enter" || ev.key === " ") {
            toggleNoDefault(ev, idx)
        }
    }

    // mock node to go to in the editor panel
    let changedNode = WebappConfigurator.getInstance().langEnv?.editor.selectedElement
</script>


{#if deltaResultLoading.value}
    <div class="p-2">
        <Spinner class="me-3" size="4" />
        Data is being loaded...
    </div>
{:else }
    <div class="relative" id="delta-results">
        {#if items && items.length > 0}
            <!-- table-like container -->
            <div class="text-left text-sm text-light-base-900 dark:text-dark-base-50 w-full">
                <div class="divide-y w-full">
                    {#each items as it, idx (it.delta.sequenceNumber)}
                        <details
                            open={openIndex === idx}
                            class="w-full border-b last:border-b-0 bg-light-base-50 dark:bg-dark-base-800 dark:border-dark-base-700 hover:bg-light-base-50 dark:hover:bg-dark-base-900
                                    odd:bg-light-base-50 even:bg-light-base-50 odd:dark:bg-dark-base-800 even:dark:bg-dark-base-700"
                        >
                            <summary
                                class="w-full whitespace-nowrap font-medium  p-1.5 list-none cursor-pointer
                                        flex items-center justify-between"
                                id={"delta-summary-" + idx}
                                onclick={(ev) => toggleNoDefault(ev, idx)}
                                onkeydown={(ev) => onKeydown(ev, idx)}
                            >
                                    <span class="font-medium ">
                                      {deltaAsString(it.delta)}
                                    </span>

                                {#if changedNode}
                                    <button
                                        class="bg-transparent border-2 border-light-base-600 hover:border-light-base-600
                                               h-7 w-7 rounded-full inline-flex items-center ml-auto mr-1"
                                        onclick={(ev) => {
                                          ev.stopPropagation();
                                          if (openIndex !== idx) {
                                            toggleNoDefault(ev, idx)
                                          }
                                          goToNode(changedNode);
                                        }}
                                    >
                                        <ArrowRightOutline
                                            class="h-5 w-5 ms-0.5 text-light-accent-900 dark:text-dark-accent-50"
                                        />
                                    </button>
                                {/if}
                            </summary>

                            <div class="p-1.5" id={"delta-details-" + idx}>
                                <DeltaDetails it={it} />
                            </div>
                        </details>
                    {/each}
                </div>
            </div>
        {:else}
            No elements found.
        {/if}
    </div>
{/if}

<style>
    /* Optional but handy: hide the default marker so it looks like a table row */
    summary::-webkit-details-marker { display: none; }
</style>


