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
        isTableBox,
        isIndentBox,
        isLabelBox,
        isLayoutBox,
        isListBox,
        isOptionalBox,
        isSelectBox,
        isTextBox,
        isSvgBox,
        PiEditor,
        PiLogger,
        Box
    } from "@projectit/core";
    import EmptyLineComponent from "./EmptyLineComponent.svelte";
    import IndentComponent from "./IndentComponent.svelte";
    import LabelComponent from "./LabelComponent.svelte";
    import LayoutComponent from "./LayoutComponent.svelte";
    import ListComponent from "./ListComponent.svelte";
    import OptionalComponent from "./OptionalComponent.svelte";
    import TextComponent from "./TextComponent.svelte";
    import TextDropdownComponent from "./TextDropdownComponent.svelte";
    import SvgComponent from "./SvgComponent.svelte";
    import { afterUpdate } from "svelte";
    import { selectedBoxes } from "./svelte-utils/DropAndSelectStore";
    import TableComponent from "./TableComponent.svelte";
    import { setBoxSizes } from "./svelte-utils";

    const LOGGER = new PiLogger("RenderComponent"); //.mute();

    export let box: Box;
    export let editor: PiEditor;

    let id: string = `render-${box.id}`;
    let className: string = '';
    let element: HTMLElement;

    const onClick = (event: MouseEvent) => {
        LOGGER.log("RenderComponent.onClick for box " + box.role + ", selectable:" + box.selectable);
        // Note that click events on some components, like TextComponent, are already caught.
        // These components need to take care of setting the currently selected element themselves.
        if (box.selectable) {
            editor.selectedBox = box;
            $selectedBoxes = [box];
            event.preventDefault();
            event.stopPropagation();
        } // else: let the parent element take care of selection
    };

    afterUpdate(() => {
        // the following is done in the afterUpdate(), because then we are sure that all boxes are rendered by their respective components
        LOGGER.log('afterUpdate selectedBoxes: [' + $selectedBoxes.map(b => b?.element.piId()) + "]");
        let isSelected: boolean = $selectedBoxes.includes(box);
        className = (isSelected ? "selected" : "unSelected");
        if (isSelected) {
            LOGGER.log("RenderComponent.afterUpdate for box " + box.role + ", isSelected:" + isSelected);
            // TODO adjust for multiple selection
            box.setFocus();
        }
        // todo check whether setBoxSizes is used correctly => maybe only here, not in other components?
        setBoxSizes(box, element.getBoundingClientRect());
    });

</script>

<span id="render-${box?.id}"
      class="render-component {className}"
      on:click={onClick}
      bind:this={element}
>
    {#if box === null || box === undefined }
        <p class="error">[BOX IS NULL OR UNDEFINED]</p>
    {:else if isEmptyLineBox(box) }
        <EmptyLineComponent box={box}/>
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
    {:else if isSvgBox(box) }
        <SvgComponent box={box}/>
    {:else if isTableBox(box) }
        <TableComponent box={box} editor={editor} />
    {:else if isTextBox(box) }
       	<TextComponent box={box} editor={editor} partOfActionBox={false} text="" isEditing={false}/>
    {:else if isActionBox(box) || isSelectBox(box)}
        <TextDropdownComponent box={box} editor={editor}/>
    {:else}
        <p class="error">[UNKNOWN BOX TYPE: {box.kind}]</p>
    {/if}
</span>

<style>
    .render-component {
        box-sizing: border-box;
        display: flex;
    }
    .error {
        /* todo use projectit variable */
        color: red;
    }
    .unSelected {
        background: transparent;
        border: none;
    }
    .selected {
        background-color: var(--freon-selected-background-color, rgba(211, 227, 253, 255));
        outline-color: var(--freon-selected-outline-color, darkblue);
        outline-style: var(--freon-selected-outline-style, solid);
        outline-width: var(--freon-selected-outline-width, 1px);
    }
</style>
