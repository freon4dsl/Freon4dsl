<script lang="ts">
    import type { SvgBox } from "@projectit/core";
    import { componentId } from "./util";

    export let svgBox: SvgBox;

    let id: string = componentId(svgBox);
</script>

<!--TODO 500, 500 in viewbox is dependent on the SVG image !!-->
<svg width={svgBox.width} height={svgBox.height} viewBox={"0 0 500 500"} id="{id}">
        <path d={svgBox.svgPath}/>
</svg>

<style>

</style>
