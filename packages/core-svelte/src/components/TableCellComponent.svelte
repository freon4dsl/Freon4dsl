<script lang="ts">
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
        type PiEditor,
        PiLogger,
        toPiKey,
        TableCellBox,
        PiEditorUtil, PiCommand, PI_NULL_COMMAND, PiPostAction, ListElementInfo, isActionBox
    } from "@projectit/core";
    import { autorun, runInAction } from "mobx";
    import { afterUpdate, onMount, createEventDispatcher, tick } from "svelte";
    import RenderComponent from "./RenderComponent.svelte";
    import { isOdd } from "./svelte-utils";
    import { contextMenu, contextMenuVisible } from "./svelte-utils/ContextMenuStore";
    import {
        activeElem,
        activeIn,
        draggedElem,
        draggedFrom,
        GridIndex,
        selectedBoxes
    } from "./svelte-utils/DropAndSelectStore";

    // properties
    export let box: TableCellBox;
    export let editor: PiEditor;
    export let parentComponentId: string;
    export let parentOrientation: string;
    export let parentHasHeader: boolean;
    // determine the type of the elements in the cell
    // this speeds up the check whether the element may be dropped in a certain drop-zone
    export let elementType: string;

    type BoxTypeName = "gridcellNeutral" | "gridcellOdd" | "gridcellEven";

    // local variables
    const LOGGER = new PiLogger("TableCellComponent"); //.mute();
    const dispatcher = createEventDispatcher();
    let cssVariables: string;
    let id: string = box.id;

    let row: number;
    let column: number;
    let orientation: BoxTypeName = "gridcellNeutral";

    let isHeader = "noheader";
    let cssStyle: string = "";
    let cssClass: string = "";
    let hovering: GridIndex = { row: -1, column: -1 };      // determines the style of the element, when hovering but nothing is being dragged

    // the drag ghost image, preload  it, otherwise it will not be shown on the first drag
    const img = new Image();
    img.src = "img/projectit-logo.png";

    // todo see which function we need to set the row and column: onMOunt autorun, afterUpdate???
    onMount(() => {
        row = box.row;
        column = box.column;
    });

    // afterUpdate(() => {
    //     UPDATE_LOGGER.log("GridCellComponent.afterUpdate");
    //     // Triggers autorun
    //     $boxStore = cellBox.box;
    // });

    const onKeydown = (event: KeyboardEvent) => {
        LOGGER.log("GridCellComponent onKeyDown");
        const piKey = toPiKey(event);
        if (isMetaKey(event) || event.key === ENTER) {
            LOGGER.log("Keyboard shortcut in GridCell ===============");
            let index: number = parentOrientation === "row" ? row : column;
            // todo make this a separate function also to be used in TextComponent o.a.
            const cmd: PiCommand = PiEditorUtil.findKeyboardShortcutCommand(toPiKey(event), box, editor);
            if (cmd !== PI_NULL_COMMAND) {
                let postAction: PiPostAction;
                runInAction(() => {
                    const action = event["action"];
                    if (!!action) {
                        action();
                    }
                    postAction = cmd.execute(box, toPiKey(event), editor, index);
                });
                if (!!postAction) {
                    postAction();
                }
                event.stopPropagation();
            }
        }
    };

    // todo renew autorun
    // autorun(() => {
    //     $boxStore = cellBox.box;
    //     LOGGER.log("GridCellComponent row/col " + cellBox.$id + ": " + cellBox.row + "," + cellBox.column + "  span " + cellBox.rowSpan + "," + cellBox.columnSpan + "  box " + cellBox.box.role + "--- " + int++);
    //     row = cellBox.row + (cellBox.rowSpan ? " / span " + cellBox.rowSpan : "");
    //     column = cellBox.column + (cellBox.columnSpan ? " / span " + cellBox.columnSpan : "");
    //     orientation = (grid.orientation === "neutral" ? "gridcellNeutral" : (grid.orientation === "row" ? (isOdd(cellBox.row) ? "gridcellOdd" : "gridcellEven") : (isOdd(cellBox.column) ? "gridcellOdd" : "gridcellEven")));
    //     if (cellBox.isHeader) {
    //         isHeader = "gridcell-header";
    //     }
    //     cssStyle = $boxStore.cssStyle;
    //     cssClass = cellBox.cssClass;
    // });

    const drop = (event: DragEvent) => {
        LOGGER.log("drop, dispatching");
        dispatcher("dropOnCell", { row: row, column: column });
        hovering = { row: -1, column: -1 };
    };

    const dragstart = (event: DragEvent) => {
        LOGGER.log("dragStart");
        // close any context menu
        $contextMenuVisible = false;

        // give the drag an effect
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.dropEffect = "move";

        // select the complete element and style them
        $selectedBoxes = box.getSiblings();
        // $selectedBoxes.forEach(b => b.style = "border: dashed");

        // give the drag an image
        event.dataTransfer.setDragImage(img, 0, 0);
        // And Chrome seems to require the image to be in the dom: document.body.append(img), which should be hidden with some css

        // create the data to be transferred and notify the store that something is being dragged
        // See https://stackoverflow.com/questions/11927309/html5-dnd-datatransfer-setdata-or-getdata-not-working-in-every-browser-except-fi,
        // which explains why we cannot use event.dataTransfer.setData. We use a svelte store instead.
        $draggedElem = new ListElementInfo(box.element, parentComponentId);
        $draggedFrom = parentComponentId;
    };

    const dragenter = (event: DragEvent): boolean => {
        const data: ListElementInfo = $draggedElem;
        // only show this item as active when the type of the element to be dropped is the right one // TODO allow subtypes
        if (elementType === data.elementType) {
            $activeElem = { row: row, column: column };
            $activeIn = parentComponentId;
        }
        return false; // cancels 'normal' browser handling, more or less like preventDefault, present to avoid type error
    };
    const mouseover = (): boolean => {
        hovering = { row: row, column: column };
        return false; // cancels 'normal' browser handling, more or less like preventDefault, present to avoid type error
    };
    const mouseout = (): boolean => {
        hovering = { row: -1, column: -1 };
        $activeElem = null;
        $activeIn = "";
        return false; // cancels 'normal' browser handling, more or less like preventDefault, present to avoid type error
    };

    function showContextMenu(event) {
        // determine the contents of the menu based on box
        // if the selected box is the placeholder or a title/header => show different menu items
        let index: number;
        if (isActionBox(box.content)) {
            $contextMenu.items = box.options("placeholder");
            index = Number.MAX_VALUE;
        } else if (box.isHeader) {
            $contextMenu.items = box.options("header");
            index = 0;
        } else {
            $contextMenu.items = box.options("normal");
            index = parentOrientation === "row" ? row : column;
            if (parentHasHeader) {
                index--;
            }
        }
        // set the selected box
        if (editor.selectedBox !== box) {
            editor.selectedBox = box;
            $selectedBoxes = box.getSiblings();
        }
        $contextMenu.show(event, index); // this function sets $contextMenuVisible to true
    }

    let isHovering: boolean;
    $: isHovering = (parentOrientation === "row" ? hovering.row === row : hovering.column === column) && !isActive;

    let isActive: boolean;
    $: isActive = (parentOrientation === "row" ? $activeElem?.row === row : $activeElem?.column === column) && $activeIn === parentComponentId;

    let isBeingDragged: boolean;
    $: isBeingDragged = ((parentOrientation === "row") ? $draggedElem?.propertyIndex === row : $draggedElem?.propertyIndex === column)
        && $draggedElem?.componentId === parentComponentId;

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
        class="gridcellcomponent {orientation} {isHeader} {cssClass} "
        class:selected={isSelected}
        class:hovering="{isHovering}"
        class:is-active={isActive}
        class:dragged={isBeingDragged}
        style:grid-row="{row}"
        style:grid-column="{column}"
        style="{cssStyle}"
        draggable=true
        on:dragstart|stopPropagation={event => dragstart(event)}
        on:drop|stopPropagation={event => drop(event)}
        ondragover="return false"
        on:dragenter|stopPropagation={(event) => dragenter(event)}
        on:mouseover|stopPropagation={mouseover}
        on:mouseout|stopPropagation={mouseout}
        on:focus={() => {}}
        on:blur={() => {}}
        on:keydown={onKeydown}
        on:contextmenu|stopPropagation|preventDefault={(event) => showContextMenu(event)}
>
    <RenderComponent box={box.content} editor={editor}/>
</span>


<style>
    .gridcellcomponent {
        box-sizing: border-box;
        align-self: stretch; /* isn't this the default? */
        justify-self: var(--freon-gridcell-component-justify-left, stretch);
        padding: var(--freon-gridcell-component-padding, 1px);
        background-color: var(--freon-gridcell-component-background-color, transparent);
        color: var(--freon-gridcell-component-color, inherit);
    }

    .is-active {
        outline: solid 1px red; /* TODO adjust the colors to freon colors */
        /*border-top: solid 10px transparent; !* move the element a little down to show where the drop can take place *!*/
    }

    .hovering {
        cursor: grab;
    }

    .dragged {
        opacity: 0.5;
        cursor: grabbing;
    }

    .selected {
        background-color: var(--freon-selected-background-color, rgba(211, 227, 253, 255));
        outline-color: var(--freon-selected-outline-color, darkblue);
        outline-style: var(--freon-selected-outline-style, solid);
        outline-width: var(--freon-selected-outline-width, 1px);
    }
</style>
