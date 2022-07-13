<input
        bind:this={element}

        on:input={(e) => valueUpdater(e)}
        on:change={changeHandler}
        on:blur
        on:focus
        type="text"
        {placeholder}
        {...valueProp}
        id="{id}"
/>

<script lang="ts">
    import { onMount } from 'svelte';
    import { PiEditor, TextBox } from "@projectit/core";
    import { componentId } from "../../components/util";
    import { FOCUS_LOGGER } from "../../components/ChangeNotifier";
    // import { get_current_component } from 'svelte/internal';
    // import type { ActionArray } from '@smui/common/internal';
    // import {
    //     forwardEventsBuilder,
    //     classMap,
    //     useActions,
    // } from '@smui/common/internal';

    // export let use: ActionArray = [];
    let className = '';
    export { className as class };
    export let dirty = false;
    export let invalid = false;
    export let updateInvalid = true;
    export let textBox: TextBox;
    export let editor: PiEditor;

    // Local variables
    let id: string = componentId(textBox);
    // Always having a placeholder fixes Safari's baseline alignment.
    // See: https://github.com/philipwalton/flexbugs/issues/270
    let placeholder = textBox?.placeHolder?.length > 0 ? textBox.placeHolder : ' ';

    // const forwardEvents = forwardEventsBuilder(get_current_component());
    interface UninitializedValue extends Function {}
    let uninitializedValue: UninitializedValue = () => {};
    function isUninitializedValue(value: any): value is UninitializedValue {
        return value === uninitializedValue;
    }
    // Some trickery to detect uninitialized values but also have the right types.
    export let value: string | null | undefined =
        uninitializedValue as unknown as undefined;
    const valueUninitialized = isUninitializedValue(value);
    if (valueUninitialized) {
        value = '';
    }
    // Done with the trickery.

    /** When the value of the input is "", set value prop to null. */
    export let emptyValueNull = value === null;
    if (valueUninitialized && emptyValueNull) {
        value = null;
    }

    let element: HTMLInputElement;

    let valueProp: { value?: string } = {};
    $: valueProp.value = value == null ? '' : value;

    onMount(() => {
        if (updateInvalid) {
            invalid = element.matches(':invalid');
        }
        textBox.setFocus = setFocus;
    });
    export const setFocus = () => {
        FOCUS_LOGGER.log("setFocus " + ": box[" + textBox.role + ", " + textBox.caretPosition + "]");
        if (document.activeElement === element) {
            FOCUS_LOGGER.log("    has focus already");
            return;
        }
        element.focus();
        // setCaretPosition(textBox.caretPosition);
    };
    function valueUpdater(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
        if (e.currentTarget.value === '' && emptyValueNull) {
            value = null;
        } else {
            value = e.currentTarget.value;
        }
    }
    function changeHandler( e: Event & { currentTarget: EventTarget & HTMLInputElement } ) {
        dirty = true;
        if (updateInvalid) {
            invalid = element.matches(':invalid');
        }
    }
    export function focus() {
        getElement().focus();
    }
    export function blur() {
        getElement().blur();
    }
    export function getElement() {
        return element;
    }
</script>
