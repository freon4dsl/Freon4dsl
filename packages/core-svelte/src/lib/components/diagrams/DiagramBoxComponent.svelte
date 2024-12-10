<script lang="ts">
    /**
     * General node component that renders a node with its projection and a box around it.
     * It adds four handles (for connecting edges), one at each side of the box.
     */
    import RenderComponent from "../RenderComponent.svelte";
    import { Box, FreEditor } from "@freon4dsl/core";
    import { Handle, NodeToolbar, Position, type NodeProps } from '@xyflow/svelte';

    type $$Props = NodeProps;
    $$restProps;

    export let data: { box: Box, editor: FreEditor };
    const { box, editor } = data;

    const onInput = (evt) => {
        console.log("Color inout")
    }
    const onClick = (evt) => {
        console.log("Color click")
    }

    const LEFT_HANDLE_STYLE = 'width: 5px; height: 5px; left: -2px;';
    const RIGHT_HANDLE_STYLE = 'width: 5px; height: 5px; right: -2px;';
    const TOP_HANDLE_STYLE = 'width: 5px; height: 5px; top: -3px;';
    const BOTTOM_HANDLE_STYLE = 'width: 5px; height: 5px; bottom: -3px;';
</script>

<NodeToolbar>
    <button>delete</button>
    <button>copy</button>
    <button>expand</button>
</NodeToolbar>
<div class="box">
    <Handle 
        type="target"
        id="black"
        position={Position.Left}
        style="{LEFT_HANDLE_STYLE}; background: black;"
    />
    <Handle
        type="source"
        id="red"
        position={Position.Top}
        style="{TOP_HANDLE_STYLE}; background: red;"
    />
    <Handle
        type="source"
        id="green"
        position={Position.Bottom}
        style="{BOTTOM_HANDLE_STYLE}; background: green;"
    />
    <RenderComponent box={box} editor={editor} />
    <Handle
        type="source"
        id="blue"
        position={Position.Right}
        style="{RIGHT_HANDLE_STYLE}; background: blue;"
    />
</div>
