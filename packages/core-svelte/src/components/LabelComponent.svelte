<script lang="ts">
    import { onDestroy, onMount, afterUpdate } from "svelte";
    import { autorun } from "mobx";
    import { PiLogger, type PiEditor, LabelBox } from "@projectit/core";
    import { componentId, setBoxSizes } from "./svelte-utils";

    export let box: LabelBox;

    const LOGGER = new PiLogger("LabelComponent").mute();

    let id: string = !!box ? componentId(box) : "unknown-label-id";
    let element: HTMLDivElement = null;
    let style: string;
    let cssClass: string;
    let text: string;
    $: text = box.getLabel();

    const setFocus = async (): Promise<void> => {
        LOGGER.log("LabelComponent.setFocus for box " + box?.role);
        if (!!element) {
            element.focus();
        }
    };

    onMount( () => {
       box.setFocus = setFocus;
    });

    afterUpdate( () => {
        box.setFocus = setFocus;
        setBoxSizes(box, element.getBoundingClientRect());
    });

    // autorun( () => {
    //     text = box.getLabel();
    //     style = box.cssStyle;
    //     cssClass = box.cssClass;
    // });
</script>

<span class="label {text} {cssClass}"
     style="{style}"
     bind:this={element}
     id="{id}"
>
    {text}
</span>

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
