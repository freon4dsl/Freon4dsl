<script lang="ts">
    import type { PiEditor, SvgBox } from "@projectit/core";

    export let svgBox: SvgBox;
    export let editor: PiEditor;
    let id: string = `${svgBox.element.piId()}-${svgBox.role}`;
</script>

<!--TODO 500, 500 in viewbox is dependent on the SVG image !!-->
<svg width={svgBox.width} height={svgBox.height} viewBox={"0 0 500 500"} id="{id}">
        <path d={svgBox.svgPath}/>
</svg>

<style>

</style>
