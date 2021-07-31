<script lang="ts">
    import AliasComponent from "./AliasComponent.svelte";
    import { AUTO_LOGGER } from "./ChangeNotifier";
    import GridComponent from "./GridComponent.svelte";
    import SvgComponent from "./SvgComponent.svelte";
    import IndentComponent from "./IndentComponent.svelte";
    import { autorun } from "mobx";
    import TextComponent from "./TextComponent.svelte";
    import SelectableComponent from "./SelectableComponent.svelte";
    import LabelComponent from "./LabelComponent.svelte";
    import ListComponent from "./ListComponent.svelte";
    import OptionalComponent from "./OptionalComponent.svelte";
    import { afterUpdate, beforeUpdate, onDestroy } from "svelte";

    import type { Box } from "@projectit/core";
    import {
        isAliasBox,
        isGridBox,
        isIndentBox,
        isLabelBox,
        isSelectBox,
        isOptionalBox,
        isTextBox,
        isVerticalBox,
        isHorizontalBox,
        isSvgBox,
        LabelBox, PiEditor
    } from "@projectit/core";

    onDestroy(() => {
        console.log("DESTROY RENDER  COMPONENT");
    });

    export let box: Box;
    export let editor: PiEditor;

    const UNKNOWN = new LabelBox(null, "role", "UNKNOWN "+ (box == null ? "null": box.kind + "."+ box.role+ "." + isLabelBox(box)));

    afterUpdate(() => {
        // console.log("<< RenderComponent.afterUpdate() " + box.element.piLanguageConcept() + "[" + box.kind + "." + box.role + "]");
        showBox = box;
    })
    beforeUpdate(() => {
        // console.log(">> RenderComponent.beforeUpdate() " + box.element.piLanguageConcept() + "[" + box.kind + "." + box.role + "]");
        showBox = box;
    })

    let showBox;
    autorun(() => {
        AUTO_LOGGER.log("AUTO UPDATE Rendering: " + box.kind + " for element " + box.element.piLanguageConcept());
        showBox = box;
        if (isVerticalBox(showBox) || isHorizontalBox(showBox)) {
            // console.log("    children " + showBox.children.length);
            // showBox.children.forEach(box => box.name);
        }
    });
</script>

<span>
<!--    <svelte:component this={boxComponent(box)}/> -->
    {#if isLabelBox(showBox)}
        <SelectableComponent box={showBox} editor={editor}>
            <LabelComponent label={showBox} editor={editor}/>
        </SelectableComponent>
    {:else if isHorizontalBox(showBox) || isVerticalBox(showBox) }
        <SelectableComponent box={showBox} editor={editor}>
        	<ListComponent list={showBox} editor={editor}/>
        </SelectableComponent>
    {:else if isAliasBox(showBox) }
        <SelectableComponent box={showBox} editor={editor}>
        	<AliasComponent choiceBox={showBox} editor={editor}/>
        </SelectableComponent>
    {:else if isSelectBox(showBox) }
        <SelectableComponent box={showBox} editor={editor}>
        	<AliasComponent choiceBox={showBox} editor={editor}/>
        </SelectableComponent>
    {:else if isTextBox(showBox) }
        <SelectableComponent box={showBox} editor={editor}>
        	<TextComponent textBox={showBox} editor={editor}/>
        </SelectableComponent>
    {:else if isIndentBox(showBox) }
        <IndentComponent indentBox={showBox} editor={editor}/>
    {:else if isGridBox(showBox) }
        <GridComponent gridBox={showBox} editor={editor}/>
    {:else if isSvgBox(showBox) }
        <SvgComponent svgBox={showBox} editor={editor}/>
    {:else if isOptionalBox(showBox) }
        <OptionalComponent optionalBox={showBox} editor={editor}/>
    {:else}
	    <LabelComponent label={UNKNOWN} editor={editor}/>
    {/if}
</span>

<style>

</style>
