<script lang="ts">
    import { RENDER_LOGGER } from '$lib/components/ComponentLoggers.js';
    import { tick } from "svelte"
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
        Box,
        BoolDisplay,
        LimitedDisplay,
        isActionTextBox,
        isNullOrUndefined, type ClientRectangle, UndefinedRectangle
    } from "@freon4dsl/core"
    import MultiLineTextComponent from '$lib/components/MultiLineTextComponent.svelte';
    import EmptyLineComponent from '$lib/components/EmptyLineComponent.svelte';
    import GridComponent from '$lib/components/GridComponent.svelte';
    import IndentComponent from '$lib/components/IndentComponent.svelte';
    import LabelComponent from '$lib/components/LabelComponent.svelte';
    import LayoutComponent from '$lib/components/LayoutComponent.svelte';
    import ListComponent from '$lib/components/ListComponent.svelte';
    import OptionalComponent from '$lib/components/OptionalComponent.svelte';
    import TableComponent from '$lib/components/TableComponent.svelte';
    import TextComponent from '$lib/components/TextComponent.svelte';
    import TextDropdownComponent from '$lib/components/TextDropdownComponent.svelte';
    import SvgComponent from '$lib/components/SvgComponent.svelte';
    import ElementComponent from '$lib/components//ElementComponent.svelte';
    import BooleanCheckboxComponent from '$lib/components/BooleanCheckboxComponent.svelte';
    import BooleanRadioComponent from '$lib/components/BooleanRadioComponent.svelte';
    import InnerSwitchComponent from '$lib/components/BooleanInnerSwitchComponent.svelte';
    import NumericSliderComponent from '$lib/components/NumericSliderComponent.svelte';
    import LimitedCheckboxComponent from '$lib/components/LimitedCheckboxComponent.svelte';
    import LimitedRadioComponent from '$lib/components/LimitedRadioComponent.svelte';
    import SwitchComponent from '$lib/components/BooleanSwitchComponent.svelte';
    import ButtonComponent from '$lib/components/ButtonComponent.svelte';
    import FragmentComponent from '$lib/components/FragmentComponent.svelte';
    import { componentId, findCustomComponent } from '$lib/index.js';

    import ErrorMarker from '$lib/components/ErrorMarker.svelte';
    import { selectedBoxes } from '$lib/components/stores/AllStores.svelte.js';
    import type { FreComponentProps } from '$lib/components/svelte-utils/FreComponentProps.js';
    import type { Component } from 'svelte';

    const LOGGER = RENDER_LOGGER;

    let { editor, box }: FreComponentProps<Box> = $props();

    let id: string = $state('');
    id = !isNullOrUndefined(box) ? `render-${componentId(box)}` : 'render-for-unknown-box';
    let element: HTMLElement | undefined = $state(undefined);

    // css class name for when the node is selected
    let selectedCls: string = $derived.by(() => {
        LOGGER.log(`Render derived: selectedCls ${box.id}`)
        // the following is done in the afterUpdate(), because then we are sure that all boxes are rendered by their respective components
        LOGGER.log(
          'setCurrentSelectedElement selectedBoxes: [' +
          selectedBoxes.value.map(
            (b) => b?.node?.freId() + '=' + b?.node?.freLanguageConcept() + '=' + b?.kind
          ) +
          ']'
        );
        let isSelected: boolean = selectedBoxes.value.includes(box);
        // Ensure that the internal textbox inside an Action/Select/Reference box is selected if its parent box is.
        if (isActionTextBox(box)) {
            isSelected = isSelected || selectedBoxes.value.includes(box.parent);
        }
        if (isActionBox(box) || isSelectBox(box) || isReferenceBox(box)) {
            isSelected = isSelected || selectedBoxes.value.includes(box._textBox);
        }
        if (isBooleanControlBox(box) || isLimitedControlBox(box)) {
            // do not set extra class, the control itself handles being selected
            return 'render-component-unselected';
        } else {
            return isSelected ? 'render-component-selected' : 'render-component-unselected';
        }
    });

    // css class name for when the node is erroneous
    let errorCls: string = $derived.by(() => {
        if (!isNullOrUndefined(box) && box.hasError) {
            return 'render-component-error';
        } else {
            return '';
        }
    });

    // error message to be shown when element is hovered
    let errMess: string[]  = $derived.by(() => {
        if (!isNullOrUndefined(box) && box.hasError) {
            return box.errorMessages;
        } else {
            return [];
        }
    });

    // the component to be rendered, if the box represents an external component
    let ExternalComponent: Component<FreComponentProps<any>> | undefined = $state(undefined);

    const onClick = (event: MouseEvent) => {
        LOGGER.log(
            'RenderComponent.onClick for box ' + box.role + ', selectable:' + box.selectable
        );
        // Note that click events on some components, like TextComponent, are already caught.
        // These components need to take care of setting the currently selected element themselves.
        editor.selectElementForBox(box);
        event.preventDefault();
        event.stopPropagation();
    };

    // Two separate effects, because they implement non-associated things
    $effect(() => {
        LOGGER.log(`Render effect1: set external component ${box.id}`)
        if (isExternalBox(box)) {
            ExternalComponent = findCustomComponent(box.externalComponentName);
        }
    });

    $effect(() => {
        LOGGER.log(`Render effect3: set client rectangle function ${box.id}`)
        if (!isNullOrUndefined(box) && !isTextBox(box) ) {
            box.getClientRectangle = (): ClientRectangle => {
                LOGGER.log(`Render clientRect ${box.id} `)
                return element?.getBoundingClientRect() || UndefinedRectangle
            }
        }
    });

</script>

<!-- TableRows are not included here, because they use the CSS grid and table cells, which must in HTML
     always be directly under the main grid.
-->
<!-- ElementBoxes are without span, because they are not shown themselves.
     Their children are, and each child gets its own surrounding RenderComponent.
-->
{#if isElementBox(box)}
    <ElementComponent {box} {editor} />
{:else}
    {#if errMess.length > 0 && !isNullOrUndefined(element)}
        <ErrorMarker {box} {editor} />
    {/if}
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions a11y_click_events_have_key_events -->
    <!--	svelte-ignore a11y_click_events_have_key_events -->
    <span
        {id}
        class="render-component {errorCls} {selectedCls} "
        onclick={onClick}
        bind:this={element}
        role="group"
    >
        {#if box === null || box === undefined}
            <p class="error">[BOX IS NULL OR UNDEFINED]</p>
        {:else if isBooleanControlBox(box) && box.showAs === BoolDisplay.CHECKBOX}
            <BooleanCheckboxComponent {box} {editor} />
        {:else if isBooleanControlBox(box) && box.showAs === BoolDisplay.RADIO_BUTTON}
            <BooleanRadioComponent {box} {editor} />
        {:else if isBooleanControlBox(box) && box.showAs === BoolDisplay.SWITCH}
            <SwitchComponent {box} {editor} />
        {:else if isBooleanControlBox(box) && box.showAs === BoolDisplay.INNER_SWITCH}
            <InnerSwitchComponent {box} {editor} />
        {:else if isNumberControlBox(box)}
            <NumericSliderComponent {box} {editor} />
        {:else if isLimitedControlBox(box) && box.showAs === LimitedDisplay.RADIO_BUTTON}
            <LimitedRadioComponent {box} {editor} />
        {:else if isLimitedControlBox(box) && box.showAs === LimitedDisplay.CHECKBOX}
            <LimitedCheckboxComponent {box} {editor} />
        {:else if isButtonBox(box)}
            <ButtonComponent {box} {editor} />
        {:else if isExternalBox(box)}
            {#if !isNullOrUndefined(ExternalComponent)}
                <ExternalComponent {box} {editor}></ExternalComponent>
            {:else}
                <p class="render-component-error">
                    [UNKNOWN EXTERNAL BOX TYPE: {box.externalComponentName}]
                </p>
            {/if}
        {:else if isFragmentBox(box)}
            <FragmentComponent {box} {editor} />
        {:else if isGridBox(box)}
            <GridComponent {box} {editor} />
        {:else if isIndentBox(box)}
            <IndentComponent {box} {editor} />
        {:else if isLabelBox(box)}
            <LabelComponent {box} {editor} />
        {:else if isLayoutBox(box)}
            <LayoutComponent {box} {editor} />
        {:else if isListBox(box)}
            <ListComponent {box} {editor} />
        {:else if isOptionalBox2(box)}
            <OptionalComponent {box} {editor} />
        {:else if isSvgBox(box)}
            <SvgComponent {box} {editor} />
        {:else if isTableBox(box)}
            <TableComponent {box} {editor} />
        {:else if isTextBox(box)}
            <TextComponent {box} {editor} partOfDropdown={false} text="" isEditing={false} toParent={() => {} } />
        {:else if isMultiLineTextBox(box)}
            <MultiLineTextComponent {box} {editor} />
        {:else if isActionBox(box) || isSelectBox(box) || isReferenceBox(box)}
            <TextDropdownComponent {box} {editor} />
        {:else if isEmptyLineBox(box)}
            <EmptyLineComponent {box} {editor} />
        {:else}
            <!-- we use box["kind"] here instead of box.kind to avoid an error from svelte check-->
            <p class="render-component-unknown-box">[UNKNOWN BOX TYPE: {box['kind']}]</p>
        {/if}
    </span>
{/if}
