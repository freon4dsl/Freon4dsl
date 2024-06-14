<svelte:options immutable={true}/>
<script lang="ts">
    /**
     * This component expands/collapses the child of its (Expandable)Box.
     * Every indent is 8px wide.
     */
    import { Box, FreLogger } from "@freon4dsl/core";
    import { afterUpdate, onMount } from "svelte";
    import RenderComponent from "./RenderComponent.svelte";
    import type {ExpandableBox, FreEditor} from "@freon4dsl/core";
    import { componentId } from "./svelte-utils";

    // Parameters
    export let box: ExpandableBox;
    export let editor: FreEditor;

    const LOGGER = new FreLogger("ExpandableComponent");

    // const indentWidth: number = 8;
    // let style: string = `margin-left: ${box?.indent * indentWidth}px;`;
    let id: string = !!box ? componentId(box) : 'expand-for-unknown-box';
    let child: Box;

    onMount( () => {
        box.refreshComponent = refresh;
    });
    afterUpdate( () => {
        box.refreshComponent = refresh;
    })

    let htmlElement: HTMLElement;
    async function setFocus(): Promise<void> {
        htmlElement.focus();
    }

    const refresh = (why?: string): void => {
        LOGGER.log("REFRESH Expand for box (" + why + ") " + box?.role + " child " + box?.child?.role);
        child = box?.child;
        // style = `margin-left: ${box?.indent * indentWidth}px;`
    };
    $: { // Evaluated and re-evaluated when the box changes.
        refresh(box?.$id);
    }
</script>

<details id="{id}">
    <summary>
      What is the meaning of life?
      <span class="icon">👇</span>
    </summary>
    <RenderComponent box={child} editor={editor}/>
  </details>

<style>
    details {
  user-select: none;
}

details>summary span.icon {
  width: 24px;
  height: 24px;
  transition: all 0.3s;
  margin-left: auto;
}

details[open] summary span.icon {
  transform: rotate(180deg);
}

summary {
  display: flex;
  cursor: pointer;
}

summary::-webkit-details-marker {
  display: none;
}
</style>