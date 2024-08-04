<script lang="ts">
    import type { SvgBox } from "@freon4dsl/core";
    import { afterUpdate, onMount } from "svelte";
    import { componentId } from "./svelte-utils/index.js";

    export let box: SvgBox;

    let id: string;
    let svgPath: string;
    let portWidth: number;
    let portHeight: number;
    let viewBoxWidth: number;
    let viewBoxHeight: number;
    let css: string = "";

    onMount( () => {
        box.refreshComponent = refresh;
    });
    afterUpdate(() => {
        box.refreshComponent = refresh;
    });
    const refresh = (why?: string) => {
        id = !!box? componentId(box) : 'SVG-for-unknown-box';
        svgPath = box.svgPath;
        portWidth = box.viewPortWidth;
        portHeight = box.viewPortHeight;
        viewBoxWidth = box.viewBoxWidth;
        viewBoxHeight = box.viewBoxHeight;
        css = box.cssClass;
    }

    refresh();
</script>

<!-- Note that width and height in the svg tag set the size of the viewport, -->
<!-- whereas, the width and height in the viewBox set the size of the svg itself, -->
<!-- which means that it might, or might not fit in the viewport. -->
<svg class={css} width={portWidth} height={portHeight} viewBox="0 0 {viewBoxWidth} {viewBoxHeight}" id="{id}">
        <path d={svgPath}/>
</svg>
