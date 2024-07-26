<script lang="ts">
    // adapted for Freon from https://svelte.dev/repl/d65a4e9f0ae74d1eb1b08d13e428af32?version=3.35.0

    // original comments
    // based on suggestions from:
    // Inclusive Components by Heydon Pickering https://inclusive-components.design/toggle-button/
    // On Designing and Building Toggle Switches by Sara Soueidan https://www.sarasoueidan.com/blog/toggle-switch-design/
    // and this example by Scott O'hara https://codepen.io/scottohara/pen/zLZwNv

    import {BooleanControlBox, FreEditor, FreLogger} from "@freon4dsl/core";
    import {selectedBoxes} from "$lib/index.js";
    import {afterUpdate, onMount} from "svelte";

    const LOGGER = new FreLogger("SwitchComponent");

    export let editor: FreEditor;
    export let box: BooleanControlBox;
    export let design: string = 'slider'; // only two options: 'inner' or 'slider'

    let value = box.getBoolean();
    let id: string = box.id;
    let switchElement: HTMLButtonElement;
    let sliderElement: HTMLButtonElement;

    async function setFocus(): Promise<void> {
        if (design === 'inner') {
            switchElement.focus();
        } else if (design === 'slider') {
            sliderElement.focus();
        }
    }
    const refresh = (why?: string): void => {
        LOGGER.log("REFRESH BooleanControlBox: " + why);
        value = box.getBoolean();
    };
    onMount(() => {
        value = box.getBoolean();
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
    afterUpdate(() => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
    function handleClick(event){
        const target = event.target;
        const state = target.getAttribute('aria-checked');
        value = state === 'true' ? false : true;
        box.setBoolean(value);
        if (box.selectable) {
            editor.selectElementForBox(box);
        }
        event.stopPropagation();
    }
</script>

{#if design == 'inner'}
    <div class="switchcomponent--inner">
        <button
                bind:this={switchElement}
                role="switch"
                aria-checked={value}
                aria-labelledby={`switch-${id}`}
                on:click={handleClick}>
            <span>{box.labels.yes}</span>
            <span>{box.labels.no}</span>
        </button>
    </div>
{:else if design == 'slider'}
    <div class="switchcomponent--slider" >
        <button
                bind:this={sliderElement}
                role="switch"
                aria-checked={value}
                aria-labelledby={`switch-${id}`}
                on:click={handleClick}>
        </button>
    </div>
{/if}

<style>
</style>
