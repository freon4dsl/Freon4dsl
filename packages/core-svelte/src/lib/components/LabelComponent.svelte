<svelte:options immutable={true}/>
<script lang="ts">
    import { LABEL_LOGGER } from "$lib/components/ComponentLoggers.js";

    /**
     * This component shows to piece of non-editable text.
     */
    import { onMount, afterUpdate } from "svelte";
    import { LabelBox } from "@freon4dsl/core";
    import { componentId } from "./svelte-utils/index.js";

    export let box: LabelBox;

    const LOGGER = LABEL_LOGGER

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

