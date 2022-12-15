<script lang="ts">
    import { onDestroy, onMount, afterUpdate } from "svelte";
    import { autorun } from "mobx";
    import { PiLogger, type PiEditor, LabelBox } from "@projectit/core";
    import { FOCUS_LOGGER } from "./ChangeNotifier";
    import { componentId } from "./util";

    export let box: LabelBox;// = new LabelBox(null, "boxRole", "This is a box");
    export let editor: PiEditor;

    const LOGGER = new PiLogger("LabelComponent");

    let id: string = componentId(box);

    let element: HTMLDivElement = null;
    const setFocus = async (): Promise<void> => {
        FOCUS_LOGGER.log("LabelComponent.setFocus for box " + box?.role);
        if (!!element) {
            element.focus();
        }
    };

    onMount( () => {
        if (!!box) {
            box.setFocus = setFocus;
            box.refreshComponent = refresh;
        }
    });
    afterUpdate( () => {
        if (!!box) {
            box.setFocus = setFocus;
            box.refreshComponent = refresh;
        }
    });

    const onFocusHandler = (e: FocusEvent) => {
        FOCUS_LOGGER.log("LabelComponent.onFocus for box " + box.role);
    }
    const onBlurHandler = (e: FocusEvent) => {
        FOCUS_LOGGER.log("LabelComponent.onBlur for box " + box.role);
    }
    let text: string;
    let style: string;
    let cssClass: string;

    const refresh = () => {
        if (!!box) {
            text = box.getLabel();
            style = box.cssStyle;
            cssClass = box.cssClass;
        }
    };
    refresh();
</script>

<div class="label {text} {cssClass}"
     style="{style}"
     tabIndex={0}
     on:focus={onFocusHandler}
     on:blur={onBlurHandler}
     bind:this={element}
     id="{id}"
>
    {text}
</div>

<style>
    .label:empty:before {
        content: attr(data-placeholdertext);
        margin: var(--freon-label-component-margin, 1px);
        padding: var(--freon-label-component-padding, 1px);
        background-color: var(--freon-label-component-background-color, inherit);
    }

    .label {
        color: var(--freon-label-component-color, inherit);
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
