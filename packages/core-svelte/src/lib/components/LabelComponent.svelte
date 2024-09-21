<svelte:options immutable={true}/>
<script lang="ts">
    /**
     * This component shows to piece of non-editable text.
     */
    import { onMount, afterUpdate } from "svelte";
    import { FreLogger, LabelBox } from "@freon4dsl/core";
    import { componentId } from "./svelte-utils/index.js";
    import ErrorTooltip from "$lib/components/ErrorTooltip.svelte";

    export let box: LabelBox;

    const LOGGER = new FreLogger("LabelComponent");

    let id: string = !!box ? componentId(box) : 'label-for-unknown-box';
    let element: HTMLSpanElement = null;
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

<span class="label-component {text} {cssClass}"
      style="{style}"
      bind:this={element}
      id="{id}"
>
    {text}
</span>

