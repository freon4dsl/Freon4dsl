<svelte:options immutable={true}/>
<script lang="ts">
    // This component renders any box from the box model.
    // Depending on the box type the right component is used.
    // It also makes the rendered element selectable, including changing the style.
    // Note that all boxes are rendered as flex-items within a RenderComponent,
    // which is the flex-container.
    // Note also that this component has no 'setFocus' method because it is not
    // strongly coupled to a box. Each box is coupled to the corresponding
    // component in the if-statement.
    import {
        isActionBox,
        isEmptyLineBox,
        isGridBox,
        isTableBox,
        isIndentBox,
        isLabelBox,
        isLayoutBox,
        isListBox,
        isOptionalBox,
        isSelectBox,
        isTextBox,
        isSvgBox,
        FreEditor,
        FreLogger,
        Box,
        BoolDisplay, isBooleanControlBox,
        isNumberControlBox,
        isElementBox, isOptionalBox2, isMultiLineTextBox,
        isLimitedControlBox, LimitedDisplay
    } from "@freon4dsl/core";
    import MultiLineTextComponent from "./MultiLineTextComponent.svelte";
    import EmptyLineComponent from "./EmptyLineComponent.svelte";
    import GridComponent from "./GridComponent.svelte";
    import IndentComponent from "./IndentComponent.svelte";
    import LabelComponent from "./LabelComponent.svelte";
    import LayoutComponent from "./LayoutComponent.svelte";
    import ListComponent from "./ListComponent.svelte";
    import OptionalComponent from "./OptionalComponent.svelte";
    import OptionalComponentNew from "./OptionalComponentNew.svelte";
    import TableComponent from "./TableComponent.svelte";
    import TextComponent from "./TextComponent.svelte";
    import TextDropdownComponent from "./TextDropdownComponent.svelte";
    import SvgComponent from "./SvgComponent.svelte";
    import { afterUpdate } from "svelte";
    import { selectedBoxes } from "$lib/index.js";
    import { componentId, setBoxSizes } from "$lib/index.js";
    import ElementComponent from "./ElementComponent.svelte";
    import BooleanCheckboxComponent from "$lib/components/BooleanCheckboxComponent.svelte";
    import BooleanRadioComponent from "$lib/components/BooleanRadioComponent.svelte";
    // import MaterialSwitchComponent from "$lib/components/MaterialSwitchComponent.svelte";
    import InnerSwitchComponent from "$lib/components/InnerSwitchComponent.svelte";
    import NumericSliderComponent from "$lib/components/NumericSliderComponent.svelte";
    import LimitedCheckboxComponent from "$lib/components/LimitedCheckboxComponent.svelte";
    import LimitedRadioComponent from "$lib/components/LimitedRadioComponent.svelte";
    import SwitchComponent from "$lib/components/SwitchComponent.svelte";

    const LOGGER = new FreLogger("RenderComponent");

    export let box: Box = null;
    export let editor: FreEditor;

    let id: string;
    let className: string = '';
    let element: HTMLElement;

    const onClick = (event: MouseEvent) => {
        LOGGER.log("RenderComponent.onClick for box " + box.role + ", selectable:" + box.selectable);
        // Note that click events on some components, like TextComponent, are already caught.
        // These components need to take care of setting the currently selected element themselves.
        editor.selectElementForBox(box);
        event.preventDefault();
        event.stopPropagation();
    };

    afterUpdate(() => {
        // the following is done in the afterUpdate(), because then we are sure that all boxes are rendered by their respective components
        LOGGER.log('afterUpdate selectedBoxes: [' + $selectedBoxes.map(b => b?.element?.freId() + '=' + b?.element?.freLanguageConcept() + '=' + b?.kind) + "]");
        let isSelected: boolean = $selectedBoxes.includes(box);
        if (isBooleanControlBox(box) || isLimitedControlBox(box)) {
            // do not set extra class, the control itself handles being selected
        } else {
            className = (isSelected ? "selected" : "unSelected");
        }
        if (!!element) { // upon initialization the element might be null
            setBoxSizes(box, element.getBoundingClientRect());
        } else {
            LOGGER.log('No element for ' + box?.id + ' ' + box?.kind);
        }
    });
    // todo test GridComponent
    const refresh = (why?: string): void => {
        LOGGER.log("REFRESH RenderComponent (" + why + ")");
        id = !!box? `render-${componentId(box)}` : 'render-for-unknown-box';
    };

    let first = true;
    // $: { // Evaluated and re-evaluated when the box changes.
        refresh((first ? "first" : "later") + "   " + box?.id);
        first = false;
    // }

</script>

<!-- TableRows are not included here, because they use the CSS grid and table cells must in HTML
     always be directly under the main grid.
-->
<!-- ElementBoxes are without span, because they are not shown themselves.
     Their children are, and each child gets its own surrounding RenderComponent.
-->
{#if isElementBox(box) }
    <ElementComponent box={box} editor={editor}/>
{:else}
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions a11y-click-events-have-key-events -->
    <span id={id}
          class="render-component {className}"
          on:click={onClick}
          bind:this={element}
          role="group"
    >
        {#if box === null || box === undefined }
            <p class="error">[BOX IS NULL OR UNDEFINED]</p>
        {:else if isBooleanControlBox(box) && box.showAs === BoolDisplay.CHECKBOX}
            <BooleanCheckboxComponent box={box} editor={editor}/>
        {:else if isBooleanControlBox(box) && box.showAs === BoolDisplay.RADIO_BUTTON}
            <BooleanRadioComponent box={box} editor={editor}/>
        {:else if isBooleanControlBox(box) && box.showAs === BoolDisplay.SWITCH}
            <SwitchComponent box={box} editor={editor}/>
        {:else if isBooleanControlBox(box) && box.showAs === BoolDisplay.INNER_SWITCH}
            <InnerSwitchComponent box={box} editor={editor}/>
        {:else if isNumberControlBox(box) }
            <NumericSliderComponent box={box} editor={editor}/>
        {:else if isLimitedControlBox(box) && box.showAs === LimitedDisplay.RADIO_BUTTON}
            <LimitedRadioComponent box={box} editor={editor}/>
        {:else if isLimitedControlBox(box) && box.showAs === LimitedDisplay.CHECKBOX}
            <LimitedCheckboxComponent box={box} editor={editor}/>
        {:else if isEmptyLineBox(box) }
            <EmptyLineComponent box={box}/>
        {:else if isGridBox(box) }
            <GridComponent box={box} editor={editor} />
        {:else if isIndentBox(box) }
            <IndentComponent box={box} editor={editor}/>
        {:else if isLabelBox(box)}
            <LabelComponent box={box}/>
        {:else if isLayoutBox(box) }
            <LayoutComponent box={box} editor={editor}/>
        {:else if isListBox(box) }
            <ListComponent box={box} editor={editor}/>
        {:else if isOptionalBox(box) }
            <OptionalComponent box={box} editor={editor}/>
        {:else if isOptionalBox2(box) }
            <OptionalComponentNew box={box} editor={editor}/>
        {:else if isSvgBox(box) }
            <SvgComponent box={box}/>
        {:else if isTableBox(box) }
            <TableComponent box={box} editor={editor} />
        {:else if isTextBox(box) }
            <TextComponent box={box} editor={editor} partOfActionBox={false} text="" isEditing={false}/>
        {:else if isMultiLineTextBox(box) }
            <MultiLineTextComponent box={box} editor={editor} text=""/>
        {:else if isActionBox(box) || isSelectBox(box)}
            <TextDropdownComponent box={box} editor={editor}/>
        {:else}
            <!-- we use box["kind"] here instead of box.kind to avoid an error from svelte check-->
            <p class="error">[UNKNOWN BOX TYPE: {box["kind"]}]</p>
        {/if}
    </span>
{/if}

<style>
    .render-component {
        box-sizing: border-box;
        display: flex;
    }
    .error {
        color: var(--freon-dropdownitem-component-error-bg-color, red);
    }
    .unSelected {
        background: transparent;
        border: none;
    }
    .selected {
        /*background-color: var(--freon-selected-background-color, rgba(211, 227, 253, 255));*/
        outline-color: var(--freon-selected-outline-color, darkblue);
        outline-style: var(--freon-selected-outline-style, solid);
        outline-width: var(--freon-selected-outline-width, 1px);
    }
</style>
