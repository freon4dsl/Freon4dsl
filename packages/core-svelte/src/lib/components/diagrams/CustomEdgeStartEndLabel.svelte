<script lang="ts">
    /**
     * This component implements an Edge type that supports labels at the start and end of an edge
     * Start and end label should be in the _data_ object with names _startLabel_ and _endLabel_
     * 
     * TODO Positioning works only at specific locations of the edge, needs to be generalized.
     */
    import { type EdgeProps, getBezierPath, BaseEdge, EdgeLabelRenderer } from '@xyflow/svelte';

    type $$Props = EdgeProps;

    export let sourceX: $$Props['sourceX'];
    export let sourceY: $$Props['sourceY'];
    export let sourcePosition: $$Props['sourcePosition'];
    export let targetX: $$Props['targetX'];
    export let targetY: $$Props['targetY'];
    export let targetPosition: $$Props['targetPosition'];
    export let data: $$Props['data'] = undefined;

    console.log(`source position ${sourcePosition} target position ${targetPosition}`)
    console.log(`sourceX ${sourceX} sourceY ${sourceY}`)
    console.log(`targetX ${targetX} targetY ${targetY}`)

    $: [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition
    });
</script>

<BaseEdge path={edgePath} />
<EdgeLabelRenderer>
    <EdgeLabelRenderer>
        {#if data.startLabel}
            <div
                style:transform={`translate(-40%, -80%) translate(${sourceX}px,${sourceY}px)`}
                class="edge-label nodrag nopan"
            >
                {data.startLabel}
            </div>
        {/if}
        {#if data.endLabel}
            <div
                style:transform={`translate(-100%, -80%) translate(${targetX}px,${targetY}px)`}
                class="edge-label nodrag nopan"
            >
                {data.endLabel}
            </div>
        {/if}
    </EdgeLabelRenderer>
</EdgeLabelRenderer>

<style>
    .edge-label {
        position: absolute;
        background: rgba(255, 255, 255, 0.75);
        padding: 4px 10px;
        border-radius: 5px;
        font-size: 12px;
    }
</style>
