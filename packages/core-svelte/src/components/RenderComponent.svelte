<script lang="ts">
    import TableRowComponent from "./TableRowComponent.svelte";
    import TableComponent from "./TableComponent.svelte";
    import ElementComponent from "./ElementComponent.svelte";
    import AliasComponent from "./AliasComponent.svelte";
    import GridComponent from "./GridComponent.svelte";
    import SvgComponent from "./SvgComponent.svelte";
    import IndentComponent from "./IndentComponent.svelte";
    import TextComponent from "./TextComponent.svelte";
    import SelectableComponent from "./SelectableComponent.svelte";
    import LabelComponent from "./LabelComponent.svelte";
    import ListComponent from "./ListComponent.svelte";
    import OptionalComponent from "./OptionalComponent.svelte";
    import EmptyLineComponent from "./EmptyLineComponent.svelte";
    import { afterUpdate, beforeUpdate } from "svelte";

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
        PiEditor, PiLogger, ElementBox, isElementBox, isTableBox, isTableRowBox,
    } from "@projectit/core";

    const LOGGER = new PiLogger("RenderComponent");

    export let box: Box = null;
    export let editor: PiEditor;

    let showBox: Box = null;
    let id: string = `render-${box?.element?.piId()}-${box?.role}`;

    export function setShowBox() {
        // console.log('setShowBox for element ' + box?.element?.piId());
        if (!!box) {
            showBox = box;
            id = `render-${box.element.piId()}-${box.role}`;
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

</script>


<!--    <svelte:component this={boxComponent(box)}/> -->
    {#if (showBox === null || showBox === undefined)}
        <p class="error">{"UNDEFINED BOX TYPE: " + (!!showBox ? showBox.kind : "NULL box")}"</p>
    {:else if isLabelBox(showBox)}
        <SelectableComponent box={showBox} editor={editor}>
            <LabelComponent box={showBox} editor={editor}/>
        </SelectableComponent>
    {:else if isHorizontalBox(showBox) || isVerticalBox(showBox) }
        <SelectableComponent box={showBox} editor={editor}>
        	<ListComponent box={showBox} editor={editor}/>
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
        <IndentComponent box={showBox} editor={editor}/>
    {:else if isGridBox(showBox) }
        <GridComponent box={showBox} editor={editor}/>
    {:else if isSvgBox(showBox) }
        <SvgComponent svgBox={showBox} editor={editor}/>
    {:else if isElementBox(showBox) }
        <ElementComponent box={showBox} editor={editor}/>
    {:else if isTableRowBox(showBox) }
        <TableRowComponent box={showBox} editor={editor}/>
    {:else if isOptionalBox(showBox) }
        <SelectableComponent box={showBox} editor={editor}>
            <OptionalComponent box={showBox} editor={editor}/>
        </SelectableComponent>
    {:else if isEmptyLineBox(showBox) }
        <EmptyLineComponent box={showBox} editor={editor}/>
    {:else if isTableBox(showBox) }
        <TableComponent box={showBox} editor={editor}/>
    {:else}
        <p class="error">{"UNKNOWN BOX TYPE: " + (!!showBox ? showBox.kind : "NULL box")}"</p>
    {/if}


<style>

</style>
