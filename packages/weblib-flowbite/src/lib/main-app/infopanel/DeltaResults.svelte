<script lang="ts">
    import { Spinner} from "flowbite-svelte"
    import { deltaResultLoading } from "$lib"
    import { deltaList, type ProcessedDelta, processedDeltaAsString } from "@freon4dsl/core"
    import DeltaDetails from "$lib/main-app/infopanel/DeltaDetails.svelte"
    import { goToNode } from "$lib/ts-utils/CommonFunctions"
    import { ArrowRightOutline } from "flowbite-svelte-icons"

    let deltas: ProcessedDelta[] = $state([...deltaList.deltas])
    
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

    deltaList.deltaProcessed = (_p: ProcessedDelta) => {
        console.log(`deltaList.deltaProcessed ${deltaList.deltas.length}`)
            deltas = deltaList.deltas
    }    
    // mock node to go to in the editor panel
    // let changedNode = WebappConfigurator.getInstance().langEnv?.editor.selectedElement
</script>


{#if deltaResultLoading.value}
    <div class="freon-infopanel-loading">
        <Spinner class="me-3" size="4" />
        Data is being loaded...
    </div>
{:else}
    <div class="freon-infopanel-deltas" id="delta-results">
        {#if deltas && deltas.length > 0}
            <div class="freon-infopanel-table">
                <div class="w-full">
                    {#each deltas as pDelta, idx (pDelta.delta.sequenceNumber)}
                        <details
                            open={openIndex === idx}
                            class="freon-infopanel-delta-row"
                        >
                            <summary
                                class="freon-infopanel-delta-summary"
                                id={"delta-summary-" + idx}
                                onclick={(ev) => toggleNoDefault(ev, idx)}
                                onkeydown={(ev) => onKeydown(ev, idx)}
                            >
                                <span class="freon-infopanel-delta-message">
                                    {processedDeltaAsString(pDelta)}
                                </span>

                                {#if pDelta.changedNode}
                                    <button
                                        class="freon-infopanel-action"
                                        onclick={(ev) => {
                                            ev.stopPropagation();
                                            if (openIndex !== idx) {
                                                toggleNoDefault(ev, idx);
                                            }
                                            goToNode(pDelta.changedNode);
                                        }}
                                    >
                                        <ArrowRightOutline class="freon-infopanel-action-icon" />
                                    </button>
                                {/if}
                            </summary>

                            <div class="freon-infopanel-delta-details" id={"delta-details-" + idx}>
                                <DeltaDetails pDelta={pDelta} open={openIndex} />
                            </div>
                        </details>
                    {/each}
                </div>
            </div>
        {:else}
            <div class="freon-infopanel-empty">
                No elements found.
            </div>
        {/if}
    </div>
{/if}


