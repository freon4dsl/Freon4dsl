<script lang="ts">
    import { AUTO_LOGGER } from "./ChangeNotifier";
    import GridComponent from "./GridComponent.svelte";
    import SvgComponent from "./SvgComponent.svelte";
    import IndentComponent from "./IndentComponent.svelte";
    import { autorun } from "mobx";
    import TextComponent from "./TextComponent.svelte";
    import LabelComponent from "./LabelComponent.svelte";
    import ListComponent from "./ListComponent.svelte";
    import OptionalComponent from "./OptionalComponent.svelte";
    import EmptyLineComponent from "./EmptyLineComponent.svelte";
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
        isEmptyLineBox,
        LabelBox, PiEditor, PiLogger
    } from "@projectit/core";
    import TextDropdownComponent from "./TextDropdownComponent.svelte";

    const LOGGER = new PiLogger("RenderComponent").mute();

    onDestroy(() => {
        LOGGER.log("DESTROY for box: " + box.role);
    });

    export let box: Box;
    export let editor: PiEditor;

    let showBox: Box;
    let id: string = `render-${box.element.piId()}-${box.role}`;

    const UNKNOWN = new LabelBox(null, "role", "UNKNOWN "+ (box == null ? "null": box.kind + "."+ box.role+ "." + isLabelBox(box)), {
        selectable: false,
    });

    afterUpdate(() => {
        // LOGGER.log("<< RenderComponent.afterUpdate() " + box.element.piLanguageConcept() + "[" + box.kind + "." + box.role + "]");
        showBox = box;
    });
    beforeUpdate(() => {
        // LOGGER
        // .log(">> RenderComponent.beforeUpdate() " + box.element.piLanguageConcept() + "[" + box.kind + "." + box.role + "]");
        showBox = box;
    });

    autorun(() => {
        AUTO_LOGGER.log("RenderComponent: " + box.kind + " for element " + box.element.piLanguageConcept());
        showBox = box;
    });
    // TODO add styling for selected box as in SelectableComponent
</script>

<span id="{id}">
<!--    <svelte:component this={boxComponent(box)}/> -->
    {#if isLabelBox(showBox)}
        <LabelComponent label={showBox} editor={editor}/>
    {:else if isHorizontalBox(showBox) || isVerticalBox(showBox) }
       	<ListComponent list={showBox} editor={editor}/>
    {:else if isAliasBox(showBox) }
        <TextDropdownComponent choiceBox={showBox} editor={editor}/>
    {:else if isSelectBox(showBox) }
        <TextDropdownComponent choiceBox={showBox} editor={editor}/>
    {:else if isTextBox(showBox) }
       	<TextComponent textBox={showBox} editor={editor} partOfAlias={false} isEditing={false} text=""/>
    {:else if isIndentBox(showBox) }
        <IndentComponent indentBox={showBox} editor={editor}/>
    {:else if isGridBox(showBox) }
        <GridComponent gridBox={showBox} editor={editor}/>
    {:else if isSvgBox(showBox) }
        <SvgComponent svgBox={showBox} editor={editor}/>
    {:else if isOptionalBox(showBox) }
        <OptionalComponent optionalBox={showBox} editor={editor}/>
    {:else if isEmptyLineBox(showBox) }
        <EmptyLineComponent box={showBox} editor={editor}/>
    {:else}
        <LabelComponent label={UNKNOWN} editor={editor}/>
    {/if}
</span>

<style>

</style>
