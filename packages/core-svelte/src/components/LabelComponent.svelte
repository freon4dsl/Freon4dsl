<script lang="ts">
    import { onDestroy, onMount, afterUpdate } from "svelte";
    import { autorun } from "mobx";
    import { conceptStyle, LabelBox, PiLogger, styleToCSS, type PiEditor } from "@projectit/core";
    import { AUTO_LOGGER, FOCUS_LOGGER } from "./ChangeNotifier";

    export let label;// = new LabelBox(null, "boxRole", "This is a box");
    export let editor: PiEditor;

    // console.log("LABEL COMPONENT - " + label?.role)
    const LOGGER = new PiLogger("LabelComponent");

    onDestroy(() => {
        LOGGER.log("DESTROY LABEL  COMPONENT ["+ text + "]")
    });

    let element: HTMLDivElement =null;
    const setFocus = async (): Promise<void> => {
        FOCUS_LOGGER.log("LabelComponent.setFocus for box " + label?.role);
        if (!!element) {
            element.focus();
        }
    };

    onMount( () => {
       label.setFocus = setFocus;
    });
    afterUpdate( () => {
        label.setFocus = setFocus;
    });

    let text: string;
    const onFocusHandler = (e: FocusEvent) => {
        FOCUS_LOGGER.log("onFocus for box " + label.role);
    }
    const onBlurHandler = (e: FocusEvent) => {
        FOCUS_LOGGER.log("onBlur for box " + label.role);
    }
    let style: string;

    autorun( () => {
        text = label.getLabel();
        console.log("LabelComponent ["+ text + "]");
        $: style = styleToCSS(conceptStyle(editor.style, editor.theme, label.element.piLanguageConcept(), "label", label.style));
    });
</script>

<div class="label {text}"
     style="{style}"
     tabIndex={0}
     on:focus={onFocusHandler}
     on:blur={onBlurHandler}
     bind:this={element}
>
    {text}
</div>

<style>
    .label:empty:before {
        content: attr(data-placeholdertext);
        margin: var(--freon-margin-label-component, 1px);
        padding: var(--freon-padding-label-component, 1px);
        background-color: var(--freon-colors-backgroundcolor_label_box, inherit);
    }

    .label {
        color: var(--freon-color-label-component);
        background-color: var(--freon-colors-backgroundcolor_label_box, inherit);
        font-weight: var(--freon-font-weight-label-component, normal);
        padding: var(--freon-padding-label-component, 1px);
        margin: var(--freon-margin-label-component, 1px);
        white-space: normal;
        display: inline-block;
    }
</style>
