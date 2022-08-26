<script lang="ts">
    // This component renders any box from the box model.
    // Depending on its type the right component is used.
    // It also makes the rendered element selectable, including changing the style.
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

    export let box: Box;
    export let editor: PiEditor;

    let showBox: Box;
    let id: string = `render-${box.element.piId()}-${box.role}`;
    let isSelected: boolean = false;
    let className: string = '';

    const UNKNOWN = new LabelBox(null, "role", "UNKNOWN "+ (box == null ? "null": box.kind + "."+ box.role+ "." + isLabelBox(box)), {
        selectable: false,
    });

    const onClick = (event: MouseEvent) => {
        LOGGER.log("RenderComponent.onClick: " + event + " for box " + box.role);
        if (box.selectable) {
            // isSelected = !isSelected;
            console.log("RenderComponent selected box: " + box.role);
            editor.selectedBox = box;
            event.preventDefault();
            event.stopPropagation();
        } // else: let the parent element take care of selection
    };

    // TODO find out when and why the following three functions are used
    afterUpdate(() => {
        // LOGGER.log("<< RenderComponent.afterUpdate() " + box.element.piLanguageConcept() + "[" + box.kind + "." + box.role + "]");
        showBox = box;
    });
    beforeUpdate(() => {
        // LOGGER
        // .log(">> RenderComponent.beforeUpdate() " + box.element.piLanguageConcept() + "[" + box.kind + "." + box.role + "]");
        showBox = box;
    });
    onDestroy(() => {
        LOGGER.log("DESTROY for box: " + box.role);
    });

    autorun(() => {
        AUTO_LOGGER.log("RenderComponent: " + box.kind + " for element " + box.element.piLanguageConcept());
        showBox = box;
        isSelected = editor?.selectedBox === box;
        className = (isSelected ? "selectedComponent" : "unSelectedComponent");
    });

</script>

<span id="{id}" class={className} on:click={onClick}>
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
        <GridComponent gridBox={showBox} editor={editor} tabIndex={0}/>
    {:else if isSvgBox(showBox) }
        <SvgComponent svgBox={showBox} editor={editor}/>
    {:else if isOptionalBox(showBox) }
        <OptionalComponent optionalBox={showBox} editor={editor} tabIndex={0}/>
    {:else if isEmptyLineBox(showBox) }
        <EmptyLineComponent box={showBox} editor={editor}/>
    {:else}
        <LabelComponent label={UNKNOWN} editor={editor}/>
    {/if}
</span>

<style>
    .unSelectedComponent {
        background: transparent;
        border: none;
        display: inline-block;
        vertical-align: middle;
    }

    .selectedComponent {
        background-color: var(--freon-selected-background-color, rgba(211, 227, 253, 255));
        outline-color: var(--freon-selected-outline-color, darkblue);
        outline-style: var(--freon-selected-outline-style, solid);
        outline-width: var(--freon-selected-outline-width, 1px);
        box-sizing: border-box;
        display: inline-block;
        vertical-align: middle;
        /*border-radius: 3px;*/
    }
</style>
