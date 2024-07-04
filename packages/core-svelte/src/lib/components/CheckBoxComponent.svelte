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
    let cssClass: string;
    let value
        $: value = box.getBoolean();

    /**
     * This function sets the focus on this element programmatically.
     * It is called from the box. Note that because focus can be set,
     * the html needs to have its tabindex set, and its needs to be bound
     * to a variable.
     */
    async function setFocus(): Promise<void> {
        inputElement.focus();
    }
    onMount(() => {
        value = box.getBoolean();
        box.setFocus = setFocus;
    });
    afterUpdate(() => {
        box.setFocus = setFocus;
    });
    const onClick = (event: MouseEvent) => {
        LOGGER.log("CheckBoxComponent.onClick for box " + box.role + ", value:" + value);
        // value = !value;
        box.setBoolean(!value);
        editor.selectElementForBox(box);
        event.stopPropagation();
    }
    $: {
        console.log("value bool is " + value + ", box.value is " + box.getBoolean());
    }
</script>

<span class="checkbox {cssClass}"
      style="{style}"
      id="{id}"

>
    <input on:click={onClick} bind:this={inputElement} bind:checked={value} type="checkbox"/>
</span>

