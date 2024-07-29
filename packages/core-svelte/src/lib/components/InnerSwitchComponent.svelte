<script lang="ts">
    // adapted for Freon from https://svelte.dev/repl/d65a4e9f0ae74d1eb1b08d13e428af32?version=3.35.0

    // original comments:
    // based on suggestions from:
    // Inclusive Components by Heydon Pickering https://inclusive-components.design/toggle-button/
    // On Designing and Building Toggle Switches by Sara Soueidan https://www.sarasoueidan.com/blog/toggle-switch-design/
    // and this example by Scott O'hara https://codepen.io/scottohara/pen/zLZwNv

    import {BooleanControlBox, FreEditor, FreLogger} from "@freon4dsl/core";
    import {afterUpdate, onMount} from "svelte";

    const LOGGER = new FreLogger("SwitchComponent");

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

<span class="freon-inner-switch">
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

<style>
    .freon-inner-switch button {
        font-size: var(--freon-boolean-font-size);
        font-style: var(--freon-boolean-font-style);
        font-weight: var(--freon-boolean-font-weight);
        font-family: var(--freon-boolean-font-family),sans-serif;
        margin: var(--freon-boolean-margin);
        padding: var(--freon-boolean-padding);
        border: none;
        color: var(--freon-boolean-text-color, var(--mdc-theme-primary));
    }

    [role='switch'][aria-checked='true'] :first-child,
    [role='switch'][aria-checked='false'] :last-child {
        color: var(--freon-boolean-background-color, var(--mdc-theme-background));
        border-radius: 0.25em;
        background: var(--freon-boolean-color, var(--mdc-theme-primary));
        display: inline-block;
    }

    .freon-inner-switch button span {
        user-select: none;
        pointer-events:none;
        padding: 0.25em;
    }

    .freon-inner-switch button:hover,
    .freon-inner-switch button:focus {
        outline: var(--freon-boolean-color, var(--mdc-theme-primary)) solid 1px;
        box-shadow: 0 0 8px var(--freon-boolean-color, var(--mdc-theme-primary));
        border-radius: 0.1em;
    }
</style>
