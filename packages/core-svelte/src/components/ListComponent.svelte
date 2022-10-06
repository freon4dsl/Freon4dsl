<script lang="ts">
    import {flip} from 'svelte/animate'; // TODO adjust rollup.config for svelte.animate
    import { Box, Language, ListBox, ListDirection, PiEditor, PiLogger } from "@projectit/core";
    import RenderComponent from "./RenderComponent.svelte";
    import { autorun, runInAction } from "mobx";
    import { dropListElement, moveListElement } from "./svelte-utils/dropHelpers";
    import {
        draggedElem,
        draggedFrom,
        activeElem,
        activeIn,
        ListElementInfo,
        selectedBoxes
    } from "./svelte-utils/DropAndSelectStore";
    import {contextMenu, contextMenuVisible, items} from "./svelte-utils/ContextMenuStore";
    import { afterUpdate } from "svelte";

    export let box: ListBox;	                // the accompanying ListBox
    export let editor: PiEditor;			    // the editor

    const LOGGER = new PiLogger("ListComponent"); //.mute();
    let id: string;                             // an id for the html element showing the list
    id = !!box ? box.id : 'list-with-unknown-box';
    let isHorizontal: boolean;                  // indicates whether the list should be shown horizontally or vertically
    $: isHorizontal = !!box ? (box.getDirection() === ListDirection.HORIZONTAL) : false;
    let hovering = -1;                          // determines the style of a list element, when nothing is being dragged
    let shownElements: Box[];                   // the parts of the list that are being shown
    $: shownElements = [...box.children];

    // determine the type of the elements in the list
    // this speeds up the check whether the element may be dropped in a certain drop-zone
    let elementType: string;
    $: elementType = Language.getInstance().classifierProperty(box.element.piLanguageConcept(), box.propertyName).type;

    const drop = (event: DragEvent, targetIndex) => {
        const data: ListElementInfo = $draggedElem;

        LOGGER.log('DROPPING item [' + data.element.piId() + '] from [' + data.componentId + '] in list [' + id + '] on position [' + targetIndex + ']');
        if (data.componentId === id) { // dropping in the same list
            // console.log('moving item within list');
            moveListElement(box.element, data.element, box.propertyName, targetIndex);
        } else { // dropping in another list
            // console.log('moving item to another list');
            if (data.elementType === elementType) { // check if item may be dropped here // TODO extend to include subtypes
                dropListElement(data, box.element, box.propertyName, targetIndex);
            } else {
                // TODO other way for error message
                alert("drop is not allowed here, types do not match [" + data.elementType + " != " + elementType + "]");
            }
        }
        // everything is done, so reset the variables
        $draggedElem = null;
        $draggedFrom = '';
        $activeElem = {row: - 1, column: -1 };
        $activeIn = '';
        hovering = -1;
        // Clear the drag data cache (for all formats/types)
        // event.dataTransfer.clearData(); // has problems in Firefox!
    }

    const dragstart = (event: DragEvent, listId: string, listIndex: number) => {
        LOGGER.log('ON DRAG START');
        // close any context menu
        $contextMenuVisible = false;

        // give the drag an effect
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.dropEffect = 'move';

        // See https://stackoverflow.com/questions/11927309/html5-dnd-datatransfer-setdata-or-getdata-not-working-in-every-browser-except-fi,
        // which explains why we cannot use event.dataTransfer.setData. We use a svelte store instead.
        // create the data to be transferred and notify the store that something is being dragged
        $draggedElem = new ListElementInfo(shownElements[listIndex].element, id);
        $draggedFrom = listId;
    }
    const dragenter= (event: DragEvent, index): boolean => {
        const data: ListElementInfo = $draggedElem;
        // only show this item as active when the type of the element to be dropped is the right one // TODO allow subtypes
        if (elementType === data.elementType) {
            $activeElem = {row: index, column: -1};
            $activeIn = id;
        }
        return false; // cancels 'normal' browser handling, more or less like preventDefault, present to avoid type error
    }
    const mouseover=(index): boolean => {
        hovering = index;
        return false; // cancels 'normal' browser handling, more or less like preventDefault, present to avoid type error
    }
    const mouseout=(): boolean => {
        hovering = -1;
        $activeElem = {row: -1, column: -1};
        $activeIn = '';
        return false; // cancels 'normal' browser handling, more or less like preventDefault, present to avoid type error
    }

    function showContextMenu(event, index: number) {
        if (index >= 0 && index <= shownElements.length) {
            const elemBox: Box = shownElements[index];
            editor.selectedBox = elemBox;
            $selectedBoxes = [elemBox];
            // todo determine the contents of the menu based on elemBox
            $contextMenu.items = items;
            $contextMenu.show(event); // this function sets $contextMenuVisible to true
        }
    }
    // afterUpdate(() => {
    //     LOGGER.log("afterUpdate [" + box.children.map(c => c.element.piId()) + "]")
    //     shownElements = [...box.children];
    // });
    // autorun(() => {
    //     LOGGER.log("Autorun [" + box.children.map(c => c.element.piId()) + "]")
    //     shownElements = [...box.children];
    // });

    // The mouseover fires when the mouse cursor is outside the element and then move to inside the boundaries of the element.
    // The mouseout fires when the mouse cursor is over an element and then moves another element.
    // The mouseenter fires when the mouse cursor is outside an element and then moves to inside the boundaries of the element.
    // The mouseleave fires when the mouse cursor is over an element and then moves to the outside of the element’s boundaries.
    // Both mouseenter and mouseleave do not bubble and do not fire when the mouse cursor moves over descendant elements.
</script>

<!-- on:focus is here to avoid a known bug in svelte 3.4*: "A11y: on:mouseover must be accompanied by on:focus with Svelte v3.40 #285" -->
<!-- Likewise on:blur is needed for on:mouseout -->
<span class="list" id="{id}"
      style:grid-template-columns="{!isHorizontal ? 1 : shownElements.length}"
      style:grid-template-rows="{isHorizontal ? 1 : shownElements.length}"
>
    {#each shownElements as box, index  (box.id)}
        <span
                class="list-item"
                class:hovering={hovering === index && !($activeElem?.row === index && $activeIn === id)}
                class:is-active={$activeElem?.row === index && $activeIn === id}
                class:dragged={$draggedElem?.row === index && $draggedFrom === id}
                style:grid-column="{!isHorizontal ? 1 : index+1}"
                style:grid-row="{isHorizontal ? 1 : index+1}"
                animate:flip
                draggable=true
                on:dragstart|stopPropagation={event => dragstart(event, id, index)}
                on:drop|stopPropagation={event => drop(event, index)}
                ondragover="return false"
                on:dragenter|stopPropagation={(event) => dragenter(event, index)}
                on:mouseover|stopPropagation={() => mouseover(index)}
                on:mouseout|stopPropagation={mouseout}
                on:focus={() => {}}
                on:blur={() => {}}
                on:contextmenu|stopPropagation|preventDefault={(event) => showContextMenu(event, index)}
        >
            <RenderComponent box={box} editor={editor}/>
		</span>
    {/each}
</span>

<style>
    .list {
        display: inline-grid;
        grid-gap: 2px;
        align-items: center; /* place-items is an abbreviation for align-items and justify-items */
        justify-items: center;
        align-content: center;
        border-color: var(--freon-grid-component-border-color, darkgreen);
        border-width: var(--freon-grid-component-border-width, 1pt);
        border-style: var(--freon-grid-component-border-style, solid);
        border-radius: 4px;
        /*box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);*/
        background: transparent;
        box-sizing: border-box;
        width: 100%;
    }
    .list-item {
        display: block;
        padding: 1px;
        box-sizing: border-box;
        align-self: center;
        justify-self: var(--freon-gridcell-component-justify-left, stretch);
    }
    .list-item.is-active {
        outline: solid 1px red; /* TODO adjust the colors to freon colors */
        /*border-top: solid 10px transparent; !* move the element a little down to show where the drop can take place *!*/
    }
    .list-item.hovering {
        cursor: grab;
    }
    .list-item.dragged {
        opacity:0.5;
        cursor: grabbing;
    }
</style>
