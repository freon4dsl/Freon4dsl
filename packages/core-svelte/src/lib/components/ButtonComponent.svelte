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
        event.stopPropagation();
        box.executeAction();
    }
</script>


<button class="ripple" id="{id}" on:click={onClick} bind:this={thisButton}>{box.text}</button>


<style>
    /* Copied from https://svelte.dev/repl/hello-world?version=4.2.18 */
    /* Ripple effect */
    .ripple {
        background-position: center;
        transition: background 0.8s;
    }
    .ripple:hover {
        background: #47a7f5 radial-gradient(circle, transparent 1%, #47a7f5 1%) center/15000%;
    }
    .ripple:active {
        background-color: #6eb9f7;
        background-size: 100%;
        transition: background 0s;
    }

    /* Button style */
    button {
        border: none;
        border-radius: 2px;
        padding: 12px 18px;
        font-size: 16px;
        text-transform: uppercase;
        cursor: pointer;
        color: white;
        background-color: #2196f3;
        box-shadow: 0 0 4px #999;
        outline: none;
    }
</style>
