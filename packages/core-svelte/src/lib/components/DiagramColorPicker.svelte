<script lang="ts">
    import { Handle, Position, type NodeProps } from '@xyflow/svelte';
    import type { Writable } from 'svelte/store';

    type $$Props = NodeProps;
    $$restProps;

    export let data: { color: Writable<string> };

    const { color } = data;

    const onInput = (evt) => {
        console.log("Color inout")
        data.color.set(evt.target?.value)
    }
    const onClick = (evt) => {
        console.log("Color click")
    }
</script>

<div class="color-picker" on:click={onClick}>
    <Handle type="target" position={Position.Left} />
    <div>
        color: <strong>{$color}</strong>
    </div>
    <input
        class="nodrag"
        on:input={onInput}
        value={$color}
    />
    <Handle type="source" position={Position.Right} />
</div>
