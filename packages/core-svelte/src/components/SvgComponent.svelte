<script lang="ts">
    import type { SvgBox } from "@freon4dsl/core";
    import { afterUpdate, onMount } from "svelte";
    import { componentId } from "./svelte-utils";

    export let box: SvgBox;

    let id: string;
    let svgPath: string;
    let width: number;
    let height: number;

    onMount( () => {
        box.refreshComponent = refresh;
    });
    afterUpdate(() => {
        box.refreshComponent = refresh;
    });
    const refresh = (why?: string) => {
        id = !!box? componentId(box) : 'SVG-for-unknown-box';
        svgPath = box.svgPath;
        width = box.width;
        height = box.height;
    }

    refresh();
</script>

<!--TODO 500, 500 in viewbox is dependent on the SVG image !!-->
<svg width={width} height={height} viewBox={"0 0 500 500"} id="{id}">
        <path d={svgPath}/>
</svg>

<style>

</style>
