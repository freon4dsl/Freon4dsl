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
    let style: string;
    let cssClass: string ='';
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
        cssClass = !!box ? box.cssClass : '';
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

<span id="{id}" class="checkbox {cssClass}" style="{style}">
    <input on:click={onClick} bind:this={inputElement} bind:checked={value} type="checkbox"/>
</span>
