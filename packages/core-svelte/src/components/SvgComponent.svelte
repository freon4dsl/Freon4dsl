<script lang="ts">
    /**
     * This component shows an SVG image.
     */
    import type { SvgBox } from "@projectit/core";

    export let box: SvgBox;
</script>

<!--TODO 500, 500 in viewbox is dependent on the SVG image !!-->
<svg width={box.width} height={box.height} viewBox={"0 0 500 500"} id="{box.id}">
    <path d={box.svgPath}/>
</svg>

<style>

</style>
