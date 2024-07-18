<script lang="ts">
    /**
     * This component shows a boolean value as checkbox.
     */
    import {FreEditor, FreLogger, BooleanControlBox} from "@freon4dsl/core";
    import { componentId } from "$lib/index.js";
    import {afterUpdate, onMount} from "svelte";

    export let box: BooleanControlBox;
    export let editor: FreEditor;			// the editor

    const LOGGER = new FreLogger("CheckBoxComponent");

    let id: string = !!box ? componentId(box) : 'checkbox-for-unknown-box';
    let inputElement: HTMLInputElement;
    let value = box.getBoolean();

    /**
     * This function sets the focus on this element programmatically.
     * It is called from the box. Note that because focus can be set,
     * the html needs to have its tabindex set, and its needs to be bound
     * to a variable.
     */
    async function setFocus(): Promise<void> {
        inputElement.focus();
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
    const onClick = (event: MouseEvent) => {
        LOGGER.log("CheckBoxComponent.onClick for box " + box.role + ", value:" + value);
        box.setBoolean(!value);
        editor.selectElementForBox(box);
        event.stopPropagation();
    }
</script>

<div id="{id}" class="mdc-checkbox fre-checkbox">
    <input
            type="checkbox"
            class="mdc-checkbox__native-control"
            on:click={onClick}
            bind:this={inputElement}
            bind:checked={value}
    >
    <div class="mdc-checkbox__background">
        <svg
                class="mdc-checkbox__checkmark"
                viewBox="0 0 24 24"
        >
            <path
                    class="mdc-checkbox__checkmark-path"
                    fill="none"
                    d="M1.73,12.91 8.1,19.28 22.79,4.59"
            />
        </svg>
        <div class="mdc-checkbox__mixedmark" />
    </div>
</div>

<style>
    .fre-checkbox {
        --mdc-theme-secondary: var(--checkbox-color);
    }
</style>

