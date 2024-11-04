<script lang="ts">
    import RenderComponent from "$lib/components/RenderComponent.svelte";
    import { Box, FreEditor } from "@freon4dsl/core";
    import { Handle, Position, type NodeProps } from '@xyflow/svelte';

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
</script>

<div class="box">
    <Handle type="target" position={Position.Left} />
    <RenderComponent box={box} editor={editor} />
    <Handle type="source" position={Position.Right} />
</div>
