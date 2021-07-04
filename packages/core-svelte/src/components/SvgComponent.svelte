<script lang="ts">
    import type { PiEditor, SvgBox } from "@projectit/core";

    export let svgBox: SvgBox;
    export let editor: PiEditor;
</script>

<!--TODO 500, 500 in viewbox is dependent on the SVG image !!-->
<svg width={svgBox.width} height={svgBox.height} viewBox={"0 0 500 500"}>
        <path d={svgBox.svgPath}/>
</svg>

<style>

</style>
