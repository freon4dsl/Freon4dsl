<textarea
        bind:this={element}
        class="{textBox.role} text-box-{boxType} text"
        on:change={changeHandler}
        on:blur={onBlur}
        on:focus
        on:click={onClick}
        bind:value={value}
        placeholder="{placeholder}"
        id="{id}"
/>


<script lang="ts">
    import { onMount } from 'svelte';
    import { PiEditor, PiLogger, TextBox } from "@projectit/core";
    import { FOCUS_LOGGER } from "../../components/ChangeNotifier";
    import { componentId } from "../../components/util";

    const LOGGER = new PiLogger("TextComponent").mute();
    type BoxType = "alias" | "select" | "text"; // indication of how is this text component used

    // Parameters
    export let dirty = false;                       // set if the user has touched the textfield
    export let textBox: TextBox;
    export let editor: PiEditor;

    // Local variables
    let id: string = componentId(textBox);
    let value: string = null;                       // the text to be displayed
    let boxType: BoxType = "text";                  // indication of how is this text component used
    let element: HTMLTextAreaElement;               // the element that shows the text value
    let placeholder: string = textBox.placeHolder;  // the placeholder when value of text component is not present
    let originalText: string;                       // variable to remember the text that was in the box previously

    onMount(() => {
        textBox.setFocus = setFocus;
        // textBox.setCaret = setCaret;
        if (!!textBox.getText() && textBox.getText().length > 0) {
            value = textBox.getText();
        }
        originalText = textBox.getText();
    });
    function changeHandler() {
        dirty = true;
    }
    export function setFocus() {
        FOCUS_LOGGER.log("setFocus " + ": box[" + textBox.role + ", " + textBox.caretPosition + "]");
        if (document.activeElement === element) {
            FOCUS_LOGGER.log(" has focus already");
            return;
        }
        element.focus();
        setCaretPosition(textBox.caretPosition);
    }
    function onClick(event: MouseEvent) {
        console.log("onClick " + componentId(textBox)+ ", " + dirty + ", " + value + ", " + originalText);
        setFocus();
        event.preventDefault();
        event.stopPropagation();
    }
    function onBlur() {
        console.log("blur " + componentId(textBox) + ", " + dirty + ", " + value + ", " + originalText);
        if (dirty && value !== originalText) {
            console.log("setting text to " + value);
            textBox.setText(value);
        }
        element.blur();
    }

    const setCaretPosition = (position: number) => {
        if (position === -1) {
            return;
        }
        try {
            if (position > value?.length) {
                // position already has the new length, while currentLength still has the old length
                // TODO Fix the error below
                console.error("ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR \n" +
                    "SimpleTextComponent.setCaretPosition position: " + position + " length: " + value?.length);
                position = value?.length;
            }
            // addRange(position);
            LOGGER.log("New position is: " + position);
            textBox.caretPosition = position;
        } catch (e) {
            console.error("TextComponent.setCaretPosition ERROR: " + e.toString());
        }
    };
</script>

<style>
    .placeholder {
        content: attr(data-placeholdertext);
        color: var(--freon-text-component-color, blue);
        background-color: var(--freon-text-component-background-color, inherit);
        font-family: var(--freon-text-component-font-family, "Arial");
        font-size: var(--freon-text-component-font-size, 14pt);
        font-weight: var(--freon-text-component-font-weight, inherit);
        font-style: var(--freon-text-component-font-style, inherit);
        padding: var(--freon-text-component-padding, 1px);
        margin: var(--freon-text-component-margin, 1px);
        display: inherit;
        white-space: inherit;
        border: inherit;
        opacity: 0.5;
    }

    .text {
        content: attr(data-placeholdertext);
        color: var(--freon-text-component-color, blue);
        background-color: var(--freon-text-component-background-color, inherit);
        font-family: var(--freon-text-component-font-family, "Arial");
        font-size: var(--freon-text-component-font-size, 14pt);
        font-weight: var(--freon-text-component-font-weight, inherit);
        font-style: var(--freon-text-component-font-style, inherit);
        padding: var(--freon-text-component-padding, 1px);
        margin: var(--freon-text-component-margin, 1px);
        white-space: normal;
        display: inline-block;
    }
</style>
