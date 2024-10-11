<script lang="ts">
    // adapted for Freon from https://svelte.dev/repl/d65a4e9f0ae74d1eb1b08d13e428af32?version=3.35.0

    // original comments:
    // based on suggestions from:
    // Inclusive Components by Heydon Pickering https://inclusive-components.design/toggle-button/
    // On Designing and Building Toggle Switches by Sara Soueidan https://www.sarasoueidan.com/blog/toggle-switch-design/
    // and this example by Scott O'hara https://codepen.io/scottohara/pen/zLZwNv

    import { INNERSWITCH_LOGGER } from "$lib/components/ComponentLoggers.js";
    import { BooleanControlBox, FreEditor } from "@freon4dsl/core";
    import { afterUpdate, onMount } from "svelte";

    const LOGGER = INNERSWITCH_LOGGER

    export let editor: FreEditor;
    export let box: BooleanControlBox;

    let value = box.getBoolean();
    let id: string = box.id;
    let switchElement: HTMLButtonElement;

    async function setFocus(): Promise<void> {
        switchElement.focus();
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
        value = target.getAttribute('aria-checked') !== 'true';
        box.setBoolean(value);
        if (box.selectable) {
            editor.selectElementForBox(box);
        }
        event.stopPropagation();
    }
</script>

<span class="inner-switch-component">
    <button
            id="{id}"
            bind:this={switchElement}
            role="switch"
            aria-checked={value}
            aria-labelledby={`switch-${id}`}
            on:click={handleClick}>
        <span>{box.labels.yes}</span>
        <span>{box.labels.no}</span>
    </button>
</span>
