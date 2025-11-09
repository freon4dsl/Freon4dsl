<svelte:options immutable={true} />
<script lang="ts">
    import { DIAGRAM_LOGGER } from "$lib/components/ComponentLoggers.js";
    import CustomEdgeStartEndLabel from "$lib/components/diagrams/CustomEdgeStartEndLabel.svelte";
    import DiagramBoxComponent from "$lib/components/diagrams/DiagramBoxComponent.svelte";
    import DiagramColorPicker from "$lib/components/diagrams/DiagramColorPicker.svelte";
    import { useDnD } from "$lib/components/diagrams/dnd.js";
    import { getLayoutedElements } from "$lib/components/diagrams/ElkLayout.js";
    import { type NodeWithBox, PositionsHelper } from "$lib/components/diagrams/PositionsHelper.js";
    import Toolbar from "$lib/components/diagrams/Toolbar.svelte";
    import { DiagramPosition, Entity } from "@freon4dsl/samples-example/dist/language/gen/index.js";
    import {
        Background,
        BackgroundVariant, type Connection,
        Controls, type Edge, type EdgeTypes, MarkerType,
        SvelteFlow,
        useNodes, useSvelteFlow
    } from "@xyflow/svelte";
    // type NodeWithBox = NodeBase<{ box: Box, editor: FreEditor }>
    /**
     * This component shows to piece of non-editable text.
     */
    import { onMount, afterUpdate } from "svelte";
    import {
        AST,
        Box,
        DiagramBox,
        FreEditor,
        type FreNode,
        FreNodeReference,
        isNullOrUndefined
    } from "@freon4dsl/core";
    import { writable } from "svelte/store";
    import { componentId } from "../svelte-utils/index.js";

    export let box: DiagramBox;
    export let editor: FreEditor;

    const LOGGER = DIAGRAM_LOGGER;
    
    LOGGER.log("Initializing new DiagramComponent")
    // Ensure that node positions are stored in the model each time that they are changed
    const nodesStore = useNodes();
    nodesStore.subscribe(PositionsHelper.saveNodePositions);

    let id: string = !!box ? componentId(box) : "label-for-unknown-box";

    onMount(() => {
        if (!!box) {
            box.refreshComponent = refresh;
        }
        // AutoLayout
        // onLayout()
    });

    afterUpdate(() => {
        if (!!box) {
            box.refreshComponent = refresh;
        }
    });

    let first = true;
    const refresh = (why?: string) => {
        LOGGER.log("REFRESH DiagramComponent (" + why + ")");

        const newNodes = childNodes();
        // Add an arrow at the target side
        const newEdges = [...box.edges.map(e => {e["markerEnd"] = { type: MarkerType.Arrow, width: 20,
            height: 20 }; return e})]
        // Only refresh when there are new nodes or edges
        // Otherwise a change inside a box will trigger a refresh of the diagram and
        // as a result the HTML focus of the box will be lost
        if (newNodes.length !== $nodes.length) {
            $nodes = newNodes
        }
        if (newEdges.length !== $edges.length) {
            $edges = newEdges
        }
        LOGGER.log("nodes: " + $nodes?.map(n => n.id));
    };

    const nodeTypes = {
        "color-picker": DiagramColorPicker,
        "box": DiagramBoxComponent
    };
    const edgeTypes: EdgeTypes = {
        "start-end": CustomEdgeStartEndLabel
    };
    // 👇 this is important! You need to import the styles for Svelte Flow to work
    import "@xyflow/svelte/dist/style.css";

    // We are using writables for the nodes and edges to sync them easily.
    // When a user drags a node for example, Svelte Flow updates its position.
    let x = 10;
    let y = 10;

    const childNodes = (): NodeWithBox[] => {
        const childrenNodes: NodeWithBox[] = box.children.map(childBox => {
            const position = PositionsHelper.findOrCreatePosition(childBox.node, x + 20, y + 20);
            x = position.x;
            y = position.y;
            return {
                id: childBox.node.freId(),
                type: "box",
                position: { x: x, y: y },
                data: { box: childBox, editor: editor }
            } satisfies NodeWithBox;
        });
        return childrenNodes;
    };
    const nodes = writable<NodeWithBox[]>([]);
    $nodes.push(...childNodes());
    const edges = writable([...box.edges.map(e => {e["markerEnd"] = { type: MarkerType.Arrow, width: 20,
        height: 20 }; return e})]);

    const snapGrid = [20, 20];

    $: { // Evaluated and re-evaluated when the box changes.
        refresh("FROM DiagramComponent " + box?.id);
    }


    /**********************************************************
     * DRAG AND DROP
     **********************************************************/
    const { screenToFlowPosition } = useSvelteFlow();

    const type = useDnD();

    const onDragOver = (event: DragEvent) => {
        event.preventDefault();

        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = "move";
        }
    };

    const onDrop = (event: DragEvent) => {
        LOGGER.log("onDrop");
        event.preventDefault();

        if (!$type) {
            return;
        }
        LOGGER.log(`DROP type ${$type}`);

        const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY
        });

        const creator = box.findCreateActionForLabel($type);
        if (isNullOrUndefined(creator)) {
            LOGGER.log("Cannot call creator(), isNullOrUndefined");
            return;
        }
        AST.changeNamed("Diagram new box", () => {
            const newAstNode = creator();
            const newPosition = new DiagramPosition()
            newPosition.x = position.x
            newPosition.y = position.y
            newAstNode["annotations"].push(newPosition)
            box.node[box.propertyName].push(newAstNode);
        });
    };
    
    
    // Connection events
    const onedgecreate = (connection: Connection): Edge => {
        const sourceNode = $nodes.find(node => node.id === connection.source)?.data?.box?.node as Entity
        const targetNode = $nodes.find(node => node.id === connection.target)?.data?.box?.node as Entity
        LOGGER.log(`onedgecreate: ${JSON.stringify(connection)} spourceNode ${sourceNode?.freLanguageConcept()}.${sourceNode?.name} targetNode ${targetNode?.freLanguageConcept()}${targetNode?.name}`)
        LOGGER.log(`     sourceNode ${sourceNode instanceof Entity} targetNode ${targetNode  instanceof Entity} src ${sourceNode?.constructor?.name} tgt: src ${targetNode?.constructor?.name}`)
        if (sourceNode?.freLanguageConcept()  === "Entity" && targetNode?.freLanguageConcept() === "Entity") {
            LOGGER.log("Creating relationship")
            AST.changeNamed("Drop in diagram", () => {
                sourceNode.baseEntity = FreNodeReference.create(targetNode, "Entity")
            })
        }
    }
    const onconnectstart = (event: MouseEvent | TouchEvent, params: { nodeId?: string; handleId?: string; handleType?: 'source' | 'target'; }): void => {
        LOGGER.log(`onconnectstart: ${JSON.stringify(params)}`)

    }
    
    /********************************************************************
     * Auto layout
     * ******************************************************************/


    async function onLayout() {
        const ns = $nodes;
        const es = $edges;

        const layout = await getLayoutedElements(ns, es)
        $nodes = layout.nodes;
        $edges = layout.edges;

        // fitView();

        // window.requestAnimationFrame(() => fitView());
        // });
    }
</script>

<div
    style:height="650px"
    style:width="1000px"
    style:fontsize="12px"
    id="{id}">
    <Toolbar actions={box.createActions.map(a => a.label)} />
    <SvelteFlow on:dragover={onDragOver} on:drop={onDrop}
                {nodeTypes}
                {edgeTypes}
                {nodes}
                {edges}
                {snapGrid}
                ondelete={() => { LOGGER.log("ON:delete") } }
                onbeforedelete={() => { LOGGER.log("ON:beforedelete") } }
                onconnect={() => { LOGGER.log("ON:connect") } }
                onconnectstart={() => { LOGGER.log("ON:connectstart") } }
                onconnectend={() => { LOGGER.log("ON:connectend") } }
                onedgecreate={onedgecreate}
                connectionMode="loose"
    >
        <Controls />
        <Background variant={BackgroundVariant.Dots} />
    </SvelteFlow>
</div>

