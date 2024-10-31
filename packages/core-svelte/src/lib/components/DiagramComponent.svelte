<svelte:options immutable={true}/>
<script lang="ts">
    import { DIAGRAM_LOGGER } from "$lib/components/ComponentLoggers.js";
    import { Background, BackgroundVariant, Controls, MiniMap, SvelteFlow } from "@xyflow/svelte";

    /**
     * This component shows to piece of non-editable text.
     */
    import { onMount, afterUpdate } from "svelte";
    import { DiagramBox, FreEditor } from "@freon4dsl/core";
    import { writable } from "svelte/store";
    import { componentId } from "./svelte-utils/index.js";

    export let box: DiagramBox;
    export let editor: FreEditor

    const LOGGER = DIAGRAM_LOGGER

    let id: string = !!box ? componentId(box) : 'label-for-unknown-box';
    let element: HTMLSpanElement = null;
    let style: string;
    let cssClass: string;

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
        LOGGER.log("REFRESH DiagramComponent (" + why + ")");
        if (!!box) {
            style = box.cssStyle;
            cssClass = box.cssClass;
        }
    };

    // 👇 this is important! You need to import the styles for Svelte Flow to work
    import '@xyflow/svelte/dist/style.css';

    // We are using writables for the nodes and edges to sync them easily. When a user drags a node for example, Svelte Flow updates its position.
    const nodes = writable([
        {
            id: '1',
            type: 'input',
            data: { label: 'Input Node' },
            position: { x: 0, y: 0 }
        },
        {
            id: '2',
            type: 'default',
            data: { label: 'Node' },
            position: { x: 0, y: 150 }
        }
    ]);

    // same for edges
    const edges = writable([
        {
            id: '1-2',
            type: 'default',
            source: '1',
            target: '2',
            label: 'Edge Text'
        }
    ]);

    const snapGrid = [25, 25];

    $: { // Evaluated and re-evaluated when the box changes.
        refresh("FROM component " + box?.id);
    }
</script>

<div
    style:height="500px"
    style:width="500px"
    bind:this={element}
    id="{id}">
  <SvelteFlow
      {nodes}
      {edges}
      {snapGrid}
      fitView
      on:nodeclick={(event) => console.log('on node click', event.detail.node)}
  >
    <Controls />
    <Background variant={BackgroundVariant.Dots} />
  </SvelteFlow>
</div>

