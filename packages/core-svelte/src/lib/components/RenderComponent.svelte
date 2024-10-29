<svelte:options immutable={true}/>
<script lang="ts">
    import { RENDER_LOGGER } from "$lib/components/ComponentLoggers.js";

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
        isBooleanControlBox,
        isNumberControlBox,
        isElementBox,
        isOptionalBox2,
        isMultiLineTextBox,
        isLimitedControlBox,
        isButtonBox,
        isExternalBox,
        isFragmentBox,
        isReferenceBox,
        FreEditor,
        Box,
        BoolDisplay,
        LimitedDisplay, isActionTextBox, AbstractChoiceBox
    } from "@freon4dsl/core";
    import MultiLineTextComponent from "$lib/components/MultiLineTextComponent.svelte";
    import EmptyLineComponent from "$lib/components/EmptyLineComponent.svelte";
    import GridComponent from "$lib/components/GridComponent.svelte";
    import IndentComponent from "$lib/components/IndentComponent.svelte";
    import LabelComponent from "$lib/components/LabelComponent.svelte";
    import LayoutComponent from "$lib/components/LayoutComponent.svelte";
    import ListComponent from "$lib/components/ListComponent.svelte";
    import OptionalComponent from "$lib/components/OptionalComponent.svelte";
    import OptionalComponentNew from "$lib/components/OptionalComponentNew.svelte";
    import TableComponent from "$lib/components/TableComponent.svelte";
    import TextComponent from "$lib/components/TextComponent.svelte";
    import TextDropdownComponent from "$lib/components/TextDropdownComponent.svelte";
    import SvgComponent from "$lib/components/SvgComponent.svelte";
    import ElementComponent from "$lib/components//ElementComponent.svelte";
    import BooleanCheckboxComponent from "$lib/components/BooleanCheckboxComponent.svelte";
    import BooleanRadioComponent from "$lib/components/BooleanRadioComponent.svelte";
    import InnerSwitchComponent from "$lib/components/InnerSwitchComponent.svelte";
    import NumericSliderComponent from "$lib/components/NumericSliderComponent.svelte";
    import LimitedCheckboxComponent from "$lib/components/LimitedCheckboxComponent.svelte";
    import LimitedRadioComponent from "$lib/components/LimitedRadioComponent.svelte";
    import SwitchComponent from "$lib/components/SwitchComponent.svelte";
    import ButtonComponent from "$lib/components/ButtonComponent.svelte";
    import FragmentComponent from "$lib/components/FragmentComponent.svelte";
    import { selectedBoxes, componentId, setBoxSizes, findCustomComponent} from "$lib/index.js";

    import {afterUpdate} from "svelte";
    import ErrorMarker from "$lib/components/ErrorMarker.svelte";

    const LOGGER = RENDER_LOGGER

    export let box: Box = null;
    export let editor: FreEditor;

    let id: string;
    let element: HTMLElement;
    let selectedCls: string = '';   // css class name for when the node is selected
    let errorCls: string = '';      // css class name for when the node is erroneous
    let errMess: string[] = [];     // error message to be shown when element is hovered

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
        LOGGER.log('afterUpdate selectedBoxes: [' + $selectedBoxes.map(b => b?.node?.freId() + '=' + b?.node?.freLanguageConcept() + '=' + b?.kind) + "]");
        let isSelected: boolean = $selectedBoxes.includes(box);
        // Ensure that the internal textbox inside an Action/Select/Reference box is selected if its parent box is.
        if (isActionTextBox(box) ) {
            isSelected = isSelected || $selectedBoxes.includes(box.parent)
        }
        if ( isActionBox(box) || isSelectBox(box) || isReferenceBox(box)) {
            isSelected = isSelected || $selectedBoxes.includes(box._textBox)
        }
        if (isBooleanControlBox(box) || isLimitedControlBox(box)) {
            // do not set extra class, the control itself handles being selected
        } else {
            selectedCls = (isSelected ? "render-component-selected" : "render-component-unselected");
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
        if (box.hasError) {
            errorCls = "render-component-error";
            errMess = box.errorMessages;
        } else {
            errorCls = "";
            errMess = [];
        }
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
    {#if errMess.length > 0}
        <ErrorMarker element={element} {box}/>
    {/if}
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions a11y-click-events-have-key-events -->
    <span id={id}
          class="render-component {errorCls} {selectedCls} "
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
        {:else if isButtonBox(box) }
            <ButtonComponent box={box} editor={editor}/>
        {:else if isExternalBox(box)}
            {#if !!findCustomComponent(box.externalComponentName)}
                <svelte:component this={findCustomComponent(box.externalComponentName)} box={box} editor={editor}/>
            {:else}
                <p class="render-component-error">[UNKNOWN EXTERNAL BOX TYPE: {box.externalComponentName}]</p>
            {/if}
        {:else if isFragmentBox(box) }
            <FragmentComponent box={box} editor={editor} />
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
            <TextComponent box={box} editor={editor} partOfDropdown={false} text="" isEditing={false}/>
        {:else if isMultiLineTextBox(box) }
            <MultiLineTextComponent box={box} editor={editor} text=""/>
        {:else if isActionBox(box) || isSelectBox(box) || isReferenceBox(box) }
            <TextDropdownComponent box={box} editor={editor}/>
        {:else if isEmptyLineBox(box) }
            <EmptyLineComponent box={box}/>
        {:else}
            <!-- we use box["kind"] here instead of box.kind to avoid an error from svelte check-->
            <p class="render-component-unknown-box">[UNKNOWN BOX TYPE: {box["kind"]}]</p>
        {/if}
    </span>
{/if}

