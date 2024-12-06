<svelte:options immutable={true}/>
<script lang="ts">
    import { DIAGRAM_LOGGER } from "$lib/components/ComponentLoggers.js";
    import DiagramBoxComponent from "$lib/components/DiagramBoxComponent.svelte";
    import DiagramColorPicker from "$lib/components/DiagramColorPicker.svelte";
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

    const nodeTypes = {
      "color-picker": DiagramColorPicker,
      "box": DiagramBoxComponent
    }
    // 👇 this is important! You need to import the styles for Svelte Flow to work
    import '@xyflow/svelte/dist/style.css';

    // We are using writables for the nodes and edges to sync them easily. When a user drags a node for example, Svelte Flow updates its position.
    let x = 10
    let y = 10
    const childrenNodes = box.children.map(childBox => {
      x += 10
      y += 10
      return {
        id: childBox.node.freId(),
        type: 'box',
        position: { x: x, y: y },
        // data is used to store the current color value
        data: { box: childBox, editor: editor }
      }
    })
    const nodes = writable(childrenNodes)
    // const nodes = writable([
    //   {
    //     id: 'node-2',
    //     // this type needs to match the newly defined node type
    //     type: 'box',
    //     position: { x: 40, y: 60 },
    //     // data is used to store the current color value
    //     data: { box: box.children[0], editor: editor }
    //   }
    // ]);

    // same for edges
    console.log("nodes: " + childrenNodes.map(n => n.id))
    console.log("Diagram edges " + JSON.stringify(box.edges))
    const edges = writable([...box.edges
        // {
        //     id: '1-2',
        //     type: 'default',
        //     source: '1',
        //     target: '2',
        //     label: 'Edge Text'
        // }
    ]);

    const snapGrid = [25, 25];

    $: { // Evaluated and re-evaluated when the box changes.
        refresh("FROM DiagramComponent " + box?.id);
    }
</script>

<div
    style:height="500px"
    style:width="500px"
    bind:this={element}
    id="{id}">
  <SvelteFlow
      {nodeTypes}
      {nodes}
      {edges}
      {snapGrid}
      fitView
  >
    <Controls />
    <Background variant={BackgroundVariant.Dots} />
  </SvelteFlow>
</div>

