<svelte:options immutable={true}/>
<script lang="ts">
    /**
     * This component shows to piece of non-editable text.
     */
    import { onMount, afterUpdate } from "svelte";
    import { FreLogger, LabelBox } from "@freon4dsl/core";
    import { componentId } from "./svelte-utils";

    export let box: LabelBox;

    const LOGGER = new FreLogger("LabelComponent");

    let id: string = !!box ? componentId(box) : 'label-for-unknown-box';
    let element: HTMLDivElement = null;
    let style: string;
    let cssClass: string;
    let text: string;

    onMount( () => {
        if (!!box) {
            box.refreshComponent = refresh;
        }
    });

    afterUpdate( () => {
        if (!!box) {
            box.refreshComponent = refresh;
        }
    });

    const refresh = (why?: string) => {
        LOGGER.log("REFRESH LabelComponent (" + why + ")");
        if (!!box) {
            text = box.getLabel();
            style = box.cssStyle;
            cssClass = box.cssClass;
        }
    };

    $: { // Evaluated and re-evaluated when the box changes.
        refresh("FROM component " + box?.id);
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
