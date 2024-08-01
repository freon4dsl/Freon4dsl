<script lang="ts">
    import {ButtonBox, FreEditor, FreLogger} from "@freon4dsl/core";
    import {afterUpdate, onMount} from "svelte";

    const LOGGER = new FreLogger("ButtonComponent"); //.mute();

    export let editor: FreEditor;
    export let box: ButtonBox;

    let id: string = box.id;
    let thisButton: HTMLButtonElement;

    /**
     * This function sets the focus on this element programmatically.
     * It is called from the box. Note that because focus can be set,
     * the html needs to have its tabindex set, and its needs to be bound
     * to a variable.
     */
    async function setFocus(): Promise<void> {
        thisButton.focus();
    }
    const refresh = (why?: string): void => {
        LOGGER.log("REFRESH ButtonBox: " + why);
    };
    onMount(() => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
    afterUpdate(() => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
    const onClick = (event: MouseEvent & {currentTarget: EventTarget & HTMLButtonElement; }) => {
        box.executeAction(editor);
        event.stopPropagation();
    }
</script>

<button class="ripple b {box.role}" class:empty="{box.text.length === 0}" id="{id}" on:click={onClick} bind:this={thisButton} >
    <span>{box.text}</span>
</button>


<style>
    /* Copied from https://svelte.dev/repl/hello-world?version=4.2.18 */
    /* Ripple effect */
    .ripple {
        background-position: center;
        transition: background 0.8s;
    }
    .ripple:hover {
        background: #47a7f5 radial-gradient(circle, transparent 1%, #47a7f5 1%) no-repeat center/15000%;
        background-color: var(--freon-button-ripple-color, var(--mdc-theme-background));
    }
    .ripple:active {
        background-color: var(--freon-button-ripple-color, var(--mdc-theme-background));
        background-size: 100%;
        transition: background 0s;
    }
    .empty {
        min-height: 1em;
        min-width: 1.5em;
        display: inline-block;
    }

    /* Button style */
    .b {
        border: none;
        border-radius: 2px;
        text-transform: uppercase;
        cursor: pointer;
        box-shadow: 0 0 4px #999;
        outline: none;
        font-size: var(--freon-button-font-size);
        font-style: var(--freon-button-font-style);
        font-weight: var(--freon-button-font-weight);
        font-family: var(--freon-button-font-family),sans-serif;
        margin: var(--freon-button-margin);
        padding: var(--freon-button-padding);
        padding-top: 2px;
        color: var(--freon-button-text-color, var(--mdc-theme-primary));
        background-color: var(--freon-button-background-color, var(--mdc-theme-background));
    }
</style>
