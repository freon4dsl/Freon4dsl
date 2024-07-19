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
        const state = target.getAttribute('aria-checked');
        value = state === 'true' ? false : true;
        box.setBoolean(value);
        if (box.selectable) {
            editor.selectElementForBox(box);
        }
        event.stopPropagation();
    }
</script>

<div class="s s--inner">
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

<style>
    :root {
        /*--accent-color: CornflowerBlue;*/
        --gray: #ccc;
    }
    /* Inner Design Option */
    .s--inner button {
        padding: 0.5em;
        background-color: #fff;
        border: 1px solid var(--gray);
    }
    [role='switch'][aria-checked='true'] :first-child,
    [role='switch'][aria-checked='false'] :last-child {
        display: none;
        color: #fff;
    }

    .s--inner button span {
        user-select: none;
        pointer-events:none;
        padding: 0.25em;
    }

    .s--inner button:focus {
        outline: var(--freon-boolean-accent-color) solid 1px;
    }

    /* Slider Design Option */

    .s--slider {
        display: flex;
        align-items: center;
    }

    .s--slider button {
        width: 2.4em;
        height: 1.2em;
        position: relative;
        margin: 0 0 0 0.5em;
        background: var(--gray);
        border: none;
    }

    .s--slider button::before {
        content: '';
        position: absolute;
        width: 0.9em;
        height: 0.9em;
        background: #fff;
        top: 0.13em;
        right: 1.4em;
        transition: transform 0.3s;
    }

    .s--slider button[aria-checked='true']{
        background-color: var(--freon-boolean-accent-color)
    }

    .s--slider button[aria-checked='true']::before{
        transform: translateX(1.2em);
        transition: transform 0.3s;
    }

    .s--slider button:focus {
        /*box-shadow: 0 0px 0px 1px var(--freon-boolean-accent-color);*/
    }

    /* Inner Design Option */
    [role='switch'][aria-checked='true'] :first-child,
    [role='switch'][aria-checked='false'] :last-child {
        border-radius: 0.25em;
        background: var(--freon-boolean-accent-color);
        display: inline-block;
    }

    .s--inner button:focus {
        /*box-shadow: 0 0px 8px var(--freon-boolean-accent-color);*/
        border-radius: 0.1em;
    }

    /* Slider Design Option */
    .s--slider button {
        border-radius: 1.5em;
    }

    .s--slider button::before {
        border-radius: 100%;
    }

    .s--slider button:focus {
        /*box-shadow: 0 0px 8px var(--freon-boolean-accent-color);*/
        border-radius: 1.5em;
    }
</style>
