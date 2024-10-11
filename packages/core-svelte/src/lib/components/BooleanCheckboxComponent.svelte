<script lang="ts">
    import { CHECKBOX_LOGGER } from "$lib/components/ComponentLoggers.js";

    /**
     * This component shows a boolean value as checkbox.
     */
    import {FreEditor, BooleanControlBox} from "@freon4dsl/core";
    import { componentId } from "$lib/index.js";
    import {afterUpdate, onMount} from "svelte";
    import '@material/web/checkbox/checkbox.js';
    import {MdCheckbox} from "@material/web/checkbox/checkbox.js";

    export let box: BooleanControlBox;
    export let editor: FreEditor;			// the editor

    const LOGGER = CHECKBOX_LOGGER

    let id: string = !!box ? componentId(box) : 'checkbox-for-unknown-box';
    let inputElement: MdCheckbox;
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
        event.stopPropagation();
        LOGGER.log("CheckBoxComponent.onClick for box " + box.role + ", box value: " + box.getBoolean());
    }
    const onChange = (event: MouseEvent) => {
        value = inputElement.checked;
        box.setBoolean(value);
        if (box.selectable) {
            editor.selectElementForBox(box);
        }
        event.stopPropagation();
        LOGGER.log("CheckBoxComponent.onClick for box " + box.role + ", box value: " + box.getBoolean());
    }
</script>

<span id="{id}" class="boolean-checkbox-component">
    <md-checkbox
            aria-label="{id}"
            on:click={onClick}
            on:change={onChange}
            bind:this={inputElement}
            checked={value}
    ></md-checkbox>
</span>



