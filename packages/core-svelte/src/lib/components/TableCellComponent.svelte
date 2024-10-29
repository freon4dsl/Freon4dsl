<svelte:options immutable={true}/>
<script lang="ts">
    import { TABLECELL_LOGGER } from "$lib/components/ComponentLoggers.js";

    /**
     * This component show a single cell in a TableComponent. It supports drag and drop,
     * in so far that when dragged, the model element, that is the parent of the part that is
     * shown in this table cell, is the element being dragged, not the part displayed in the cell.
     * When used as drop zone, a custom event is dispatched to the parent table, which then
     * handles the drop.
     */
    import {
        isMetaKey,
        ENTER,
        type FreEditor,
        FreLogger,
        TableCellBox,
        FreLanguage,
        TableDirection,
        Box,
        isActionBox,
        ListElementInfo,
        MenuOptionsType,
        FreUtils,
        isTableRowBox,
        TableRowBox
    } from "@freon4dsl/core";
    import { onMount, createEventDispatcher, afterUpdate } from "svelte";
    import RenderComponent from "./RenderComponent.svelte";
    import { componentId } from "$lib/index.js";
    import {
        activeElem,
        activeIn,
        draggedElem,
        draggedFrom,
        selectedBoxes
    } from "$lib/index.js";
    import { contextMenu, contextMenuVisible } from "$lib/index.js";

    // properties
    export let box: TableCellBox;
    export let editor: FreEditor;
    export let parentComponentId: string;
    export let parentOrientation: string;
    // the type of the elements in the cell, this speeds up the check whether an element may be dropped here
    export let myMetaType: string;

    type BoxTypeName = "gridcellNeutral" | "gridcellOdd" | "gridcellEven";

    // local variables
    const LOGGER = TABLECELL_LOGGER
    const dispatcher = createEventDispatcher();
    let id: string = !!box ? `cell-${componentId(box)}` : 'table-cell-for-unknown-box';

    let row: number;
    let column: number;
    let orientation: BoxTypeName = "gridcellNeutral";
    let childBox: Box;
    let htmlElement: HTMLElement;
    let isHeader = "noheader";
    let cssStyle: string = "";
    let cssClass: string = "";

    // the drag ghost image, preload  it, otherwise it will not be shown on the first drag
    const img = new Image();
    // img.src = "img/freonlogo.png"; // todo provide better drag image

    const refresh = (why?: string) => {
        LOGGER.log("TableCellComponent refresh, why: " + why);
        if (!!box) {
            if (parentOrientation === TableDirection.HORIZONTAL) {
                row = box.row;
                column = box.column;
            } else {
                row = box.column;
                column = box.row;
            }
            childBox = box.content;
            myMetaType = box.conceptName;
        }
        LOGGER.log("    refresh row, col = " + row + ", " + column);
    }

    /**
     * This function sets the focus on this element programmatically.
     * It is called from the box. Note that because focus can be set,
     * the html needs to have its tabindex set, and its needs to be bound
     * to a variable.
     */
    async function setFocus(): Promise<void> {
        htmlElement.focus();
    }

    onMount(() => {
        box.refreshComponent = refresh;
        box.setFocus = setFocus;
        row = box.row;
        column = box.column;
    });

    afterUpdate(() => {
        box.refreshComponent = refresh;
        box.setFocus = setFocus;
        // selection is handled here because TableCells are not included in the RenderComponent
        let isSelected: boolean = $selectedBoxes.includes(box);
        cssClass = (isSelected ? "table-cell-component-selected" : "table-cell-component-unselected");
    });

    const onKeydown = (event: KeyboardEvent) => {
        LOGGER.log("GridCellComponent onKeyDown");
        if (isMetaKey(event) || event.key === ENTER) {
            LOGGER.log("Keyboard shortcut in GridCell ===============");
            // let index: number = parentOrientation === TableDirection.HORIZONTAL ? row : column;
            // todo handle this here, because there are no shortcuts for Enter created by TableUtils anymore,
            // or add the shortcuts
            // executeCustomKeyboardShortCut(event, index, box, editor);
        }
    };

    $: { // Evaluated and re-evaluated when the box changes.
        refresh('New TableCellComponent created for ' + box?.id );//+ " element name: " + box?.element["name"]);
    }

    const drop = (event: DragEvent) => {
        LOGGER.log("drop, dispatching");
        dispatcher("dropOnCell", { row: row, column: column });
    };

    const dragstart = (event: DragEvent) => {
        LOGGER.log("dragStart");
        // close any context menu
        $contextMenuVisible = false;

        // give the drag an effect
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.dropEffect = "move";

        // select the complete element
        editor.selectElementForBox(box);

        // give the drag an image
        event.dataTransfer.setDragImage(img, 0, 0);
        // And Chrome seems to require the image to be in the dom: document.body.append(img), which should be hidden with some css

        // create the data to be transferred and notify the store that something is being dragged
        // See https://stackoverflow.com/questions/11927309/html5-dnd-datatransfer-setdata-or-getdata-not-working-in-every-browser-except-fi,
        // which explains why we cannot use event.dataTransfer.setData. We use a svelte store instead.
        $draggedElem = new ListElementInfo(box.node, parentComponentId);
        $draggedFrom = parentComponentId;
    };

    const dragenter = (event: DragEvent): boolean => {
        // only show this item as active when the type of the element to be dropped is the right one
        if (FreLanguage.getInstance().metaConformsToType($draggedElem.element, myMetaType)) {
            $activeElem = { row: row, column: column };
            $activeIn = parentComponentId;
        }
        return false; // cancels 'normal' browser handling, more or less like preventDefault, present to avoid type error
    };

    const mouseout = (): boolean => {
        $activeElem = null;
        $activeIn = "";
        return false; // cancels 'normal' browser handling, more or less like preventDefault, present to avoid type error
    };

    function showContextMenu(event) {
        // determine the contents of the menu based on box
        // if the selected box is the placeholder or a title/header => show different menu items
        let index: number;
        FreUtils.CHECK(isTableRowBox(box.parent));
        let parent: TableRowBox = box.parent as TableRowBox;
        if (isActionBox(box.content)) {
            $contextMenu.items = box.options(MenuOptionsType.placeholder);
            index = Number.MAX_VALUE;
        } else if (parent.isHeader) {
            $contextMenu.items = box.options(MenuOptionsType.header);
            index = -1;
        } else {
            $contextMenu.items = box.options(MenuOptionsType.normal);
            // console.log(`showContextMenu row: ${row}, column: ${column}, box.propertyIndex: ${box.propertyIndex}, box.propertyName: ${box.propertyName}`);
            index = box.propertyIndex;
        }
        // set the selected box
        if (editor.selectedBox !== box) {
            if (isActionBox(box.content) || parent.isHeader) {
                $selectedBoxes = [...parent.children];
            } else {
                editor.selectElementForBox(box);
            }
        }
        $contextMenu.show(event, index); // this function sets $contextMenuVisible to true
    }

    // Note that this component is never part of a RenderComponent, therefore we must handle being selected here
    let isSelected: boolean;
    $: isSelected = box.content.selectable ? ($selectedBoxes.includes(box) || $selectedBoxes.includes(box.content)) : false;
</script>


<!-- on:focus is here to avoid a known bug in svelte 3.4*: "A11y: on:mouseover must be accompanied by on:focus with Svelte v3.40 #285" -->
<!-- Likewise on:blur is needed for on:mouseout -->
<!-- Apparently, we cannot combine multiple inline style directives, as in -->
<!--  style="grid-row: '{row}' grid-column: '{column}' {cssStyle}"-->

<span
        id="{id}"
        role="cell"
        class="table-cell-component {orientation} {isHeader} {cssClass} "
        style:grid-row="{row}"
        style:grid-column="{column}"
        style="{cssStyle}"
        draggable=true
        on:keydown={onKeydown}
        on:dragstart|stopPropagation={event => dragstart(event)}
        on:drop|stopPropagation={event => drop(event)}

        on:dragenter|stopPropagation={(event) => dragenter(event)}
        on:mouseout|stopPropagation={mouseout}
        on:focus={() => {}}
        on:blur={() => {}}
        on:keydown={onKeydown}
        on:contextmenu|stopPropagation|preventDefault={(event) => showContextMenu(event)}
        bind:this={htmlElement}
>
    <RenderComponent box={childBox} editor={editor}/>
</span>

