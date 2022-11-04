<script lang="ts">
    import ElementComponent from "./ElementComponent.svelte";
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
        LabelBox, PiEditor, PiLogger, ElementBox, isElementBox, isTableBox, isTableCellBox
    } from "@projectit/core";
    import TableComponent from "./TableComponent.svelte";

    const LOGGER = new PiLogger("RenderComponent"); //.mute();

    onDestroy(() => {
        LOGGER.log("DESTROY for box: " + box.role);
    });

    export let box: Box;
    export let editor: PiEditor;

    let showBox: Box;
    let id: string = `render-${box.element.piId()}-${box.role}`;

    // const UNKNOWN = new LabelBox(null, "role", "UNKNOWN "+ (box == null ? "null": box.kind + "."+ box.role+ "." + isLabelBox(box)), {
    //     selectable: false,
    // });

    function setShowBox() {
        LOGGER.log('setShowBox for element ' + box.element?.piId() )
        showBox = box;
        id = `render-${box.element.piId()}-${box.role}`;
    }

    /**
     * Because the type ElementBox should not be rendered, this function returns the first child in
     * the box tree that is renderable.
     * @param b
     */
    function getRenderContent(b: Box): Box {
        if (isElementBox(b)) {
            // console.log('found ElementBox, content for element: ' + showBox?.element?.piId() + '' + showBox?.kind);
            return getRenderContent((b as ElementBox).content);
        } else {
            return b;
        }
    }

    afterUpdate(() => {
        // LOGGER.log("<< RenderComponent.afterUpdate() " + box.element.piLanguageConcept() + "[" + box.kind + "." + box.role + "]");
        setShowBox();
    });
    beforeUpdate(() => {
        // LOGGER
        // .log(">> RenderComponent.beforeUpdate() " + box.element.piLanguageConcept() + "[" + box.kind + "." + box.role + "]");
        setShowBox();
    });

    autorun(() => {
        AUTO_LOGGER.log("RenderComponent: " + box.kind + " for element " + box.element.piLanguageConcept());
        setShowBox();
    });
</script>

<span id="{id}">
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
    {:else if isElementBox(showBox) }
        <ElementComponent elementBox={showBox} editor={editor}/>
    {:else if isOptionalBox(showBox) }
        <SelectableComponent box={showBox} editor={editor}>
            <OptionalComponent optionalBox={showBox} editor={editor}/>
        </SelectableComponent>
    {:else if isEmptyLineBox(showBox) }
        <EmptyLineComponent box={showBox} editor={editor}/>
    {:else if isTableBox(showBox) }
        <TableComponent box={showBox} editor={editor}/>
    {:else}
        <p class="error">[UNKNOWN BOX TYPE: {showBox.kind}]</p>
    {/if}
</span>

<style>

</style>
