<script lang="ts">
    import { BUTTON_LOGGER } from "$lib/components/ComponentLoggers.js";
    import { ButtonBox, FreEditor } from "@freon4dsl/core";
    import { afterUpdate, onMount } from "svelte";

    const LOGGER = BUTTON_LOGGER

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

<button class="button-component-ripple button-component {box.role}" class:button-component-empty="{box.text.length === 0}" id="{id}" on:click={onClick} bind:this={thisButton} >
    <span>{box.text}</span>
</button>


