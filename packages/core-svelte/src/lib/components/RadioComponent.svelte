<script lang="ts">
    /**
     * This component shows a boolean value as checkbox.
     */
    import {BooleanControlBox, FreEditor} from "@freon4dsl/core";
    import {afterUpdate, onMount} from "svelte";
    import {selectedBoxes} from "$lib/index.js";

    export let editor: FreEditor;
    export let box: BooleanControlBox;

    let id: string = box.id;
    let inputElement1: HTMLInputElement;
    let inputElement2: HTMLInputElement;
    let style: string;
    let cssClass: string;
    let value = box.getBoolean();

    /**
     * This function sets the focus on this element programmatically.
     * It is called from the box. Note that because focus can be set,
     * the html needs to have its tabindex set, and its needs to be bound
     * to a variable.
     */
    async function setFocus(): Promise<void> {
        inputElement1.focus();
    }
    onMount(() => {
        value = box.getBoolean();
        box.setFocus = setFocus;
    });
    afterUpdate(() => {
        box.setFocus = setFocus;
    });
    const onChange = (event: MouseEvent & {currentTarget: EventTarget & HTMLInputElement; }) => {
        console.log("RadioComponent.onChange for box " + box.role + ", value:" + value);
        value = !value;
        box.setBoolean(!value);
        if (box.selectable) {
            editor.selectElementForBox(box);
        }
        event.stopPropagation();
    }
    const onClick = (event: MouseEvent & {currentTarget: EventTarget & HTMLInputElement; }) => {
        console.log("RadioComponent.onChange for box " + box.role + ", value:" + value);
        event.stopPropagation();
    }
    $: {
        console.log("value bool is " + value + ", box.value is " + box.getBoolean());
    }
</script>

<span class="radio {cssClass}"
      style="{style}"
      id="{id}"

>
    <input bind:this={inputElement1} checked={value===true} on:click={onClick} on:change={onChange} type="radio" name="trueOne" /> <label>{box.labels.yes} </label>
    <input checked={value===false} on:click={onClick} on:change={onChange} type="radio" name="falseOne" /> <label>{box.labels.no} </label>
</span>

<style>
    .radio {
        accent-color: var(--freon-boolean-accent-color, inherit);
        background-color: var(--freon-label-component-background-color, inherit);
        font-style: var(--freon-label-component-font-style, inherit);
        font-weight: var(--freon-label-component-font-weight, normal);
        font-size: var(--freon-label-component-font-size, inherit);
        font-family: var(--freon-label-component-font-family, "inherit");
        padding: var(--freon-label-component-padding, 1px);
        margin: var(--freon-label-component-margin, 1px);
        white-space: normal;
        display: inline-block;
    }
</style>

