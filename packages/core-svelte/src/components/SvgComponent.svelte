<script lang="ts">
    import type { SvgBox } from "@projectit/core";
    import { componentId } from "./svelte-utils";

    export let box: SvgBox;

    let id: string = componentId(box);
</script>

<!--TODO 500, 500 in viewbox is dependent on the SVG image !!-->
<svg width={box.width} height={box.height} viewBox={"0 0 500 500"} id="{id}">
        <path d={box.svgPath}/>
</svg>

<style>

</style>
