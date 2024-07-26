<script lang="ts">
    // adapted for Freon from https://svelte.dev/repl/d65a4e9f0ae74d1eb1b08d13e428af32?version=3.35.0

    // original comments
    // based on suggestions from:
    // Inclusive Components by Heydon Pickering https://inclusive-components.design/toggle-button/
    // On Designing and Building Toggle Switches by Sara Soueidan https://www.sarasoueidan.com/blog/toggle-switch-design/
    // and this example by Scott O'hara https://codepen.io/scottohara/pen/zLZwNv

    import {BooleanControlBox, FreEditor, FreLogger} from "@freon4dsl/core";
    import {componentId} from "$lib/index.js";
    import {afterUpdate, onMount} from "svelte";

    const LOGGER = new FreLogger("SwitchComponent");
    
    export let box: BooleanControlBox;
    export let editor: FreEditor;			// the editor

    let id: string = !!box ? componentId(box) : 'switch-for-unknown-box';
    let value = box.getBoolean();
    let switchElement: HTMLButtonElement;

    /**
     * This function sets the focus on this element programmatically.
     * It is called from the box. Note that because focus can be set,
     * the html needs to have its tabindex set, and its needs to be bound
     * to a variable.
     */
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
        console.log("SwitchComponent.onChange for box " + box.role + ", box value: " + box.getBoolean());
    }
</script>


<span class="freon-switch">
    <button
            id="{id}"
            bind:this={switchElement}
            role="switch"
            aria-checked={value}
            aria-labelledby={`switch-${id}`}
            on:click={handleClick}>
    </button>
</span>

<style>
    .freon-switch {
        margin: var(--freon-boolean-margin);
        padding: var(--freon-boolean-padding);
        display: inline-flex;
        width: max-content;
    }
    .freon-switch button {
        width: 3em;
        height: 1.6em;
        position: relative;
        background: var(--freon-boolean-unselected-track, var(--mdc-theme-on-surface));
        border: none;
    }

    .freon-switch button::before { /* defines the knob */
        content: '';
        position: absolute;
        width: 1.3em;
        height: 1.3em;
        background: var(--freon-boolean-background-color, var(--mdc-theme-background));
        top: 0.13em;
        right: 1.5em;
        transition: transform 0.3s;
    }

    .freon-switch button[aria-checked='true']{
        background-color: var(--freon-boolean-color, var(--mdc-theme-primary))
    }

    .freon-switch button[aria-checked='true']::before{
        transform: translateX(1.3em);
        transition: transform 0.3s;
    }

    .freon-switch button:hover,
    .freon-switch button:focus {
        box-shadow: 0 0px 8px var(--freon-boolean-color, var(--mdc-theme-primary));
        border-radius: 1.5em;
    }

    .freon-switch button {
        border-radius: 1.5em;
    }

    .freon-switch button::before {
        border-radius: 100%;
    }</style>
