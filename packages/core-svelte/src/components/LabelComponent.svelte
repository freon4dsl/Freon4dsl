<script lang="ts">
    /**
     * This component shows to piece of non-editable text.
     */
    import { onMount, afterUpdate } from "svelte";
    import { PiLogger, LabelBox } from "@projectit/core";
    import { componentId } from "./util";
    import { setBoxSizes } from "./svelte-utils";

    export let box: LabelBox;

    const LOGGER = new PiLogger("LabelComponent");

    let id: string = componentId(box);
    let element: HTMLDivElement = null;
    let style: string;
    let cssClass: string;
    let text: string;
    $: text = box.getLabel();

    // todo do we need a setFocus here?
    const setFocus = async (): Promise<void> => {
        LOGGER.log("LabelComponent.setFocus for box " + box?.role);
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
            setBoxSizes(box, element.getBoundingClientRect()); // see todo in RenderComponent
        }
    });

    const refresh = (why?: string) => {
        if (!!box) {
            text = box.getLabel();
            style = box.cssStyle;
            cssClass = box.cssClass;
        }
    };

    $: { // Evaluated and re-evaluated when the box changes.
        refresh(box?.$id);
    }
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
