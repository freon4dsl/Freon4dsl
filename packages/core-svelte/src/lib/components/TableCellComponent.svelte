<script lang="ts">
    import { TABLECELL_LOGGER } from '$lib/components/ComponentLoggers.js';

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
        TableCellBox,
        FreLanguage,
        TableDirection,
        Box,
        isActionBox,
        ListElementInfo,
        MenuOptionsType,
        FreUtils,
        isTableRowBox,
        TableRowBox,
        isNullOrUndefined, MenuItem, isFreNodeReference, isFreNode
    } from '@freon4dsl/core';
    import { onMount } from 'svelte';
    import RenderComponent from './RenderComponent.svelte';
    import { componentId } from '$lib/index.js';
    import {
        activeElem,
        activeIn,
        draggedElem,
        draggedFrom,
        contextMenu,
        contextMenuVisible,
        selectedBoxes
    } from '$lib/components/stores/AllStores.svelte.js';
    import type { TableCellProps } from '$lib/components/svelte-utils/FreComponentProps.js';
    import DragHandle from "$lib/components/images/DragHandle.svelte";

    // Props
    let {
        editor,
        box,
        parentComponentId,
        parentOrientation,
        addDragHandle,
        ondropOnCell
    }: TableCellProps<TableCellBox> = $props();

    type BoxTypeName = 'gridcellNeutral' | 'gridcellOdd' | 'gridcellEven';

    // local variables
    const LOGGER = TABLECELL_LOGGER;
    let id: string = !isNullOrUndefined(box)
        ? `cell-${componentId(box)}`
        : 'table-cell-for-unknown-box';

    let row: number = $state(0);
    let column: number = $state(0);
    let orientation: BoxTypeName = 'gridcellNeutral';
    let childBox: Box = $state()!;
    let htmlElement: HTMLElement;
    let isHeader = $state('');
    let cssStyle: string = '';
    let cssClass: string = $state('');

    const refresh = (why?: string) => {
        LOGGER.log('TableCellComponent refresh, why: ' + why);
        if (!isNullOrUndefined(box)) {
            if (parentOrientation === TableDirection.HORIZONTAL) {
                row = box.row;
                column = box.column;
            } else {
                row = box.column;
                column = box.row;
            }
            childBox = box.content;
            box.conceptName = box.conceptName;
            isHeader = (box.parent as TableRowBox).isHeader ? 'table-header' : '';
        }
        LOGGER.log('    refresh row, col = ' + row + ', ' + column);
    };

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
        row = box.row;
        column = box.column;
        isHeader = (box.parent as TableRowBox).isHeader ? 'table-header' : 'no-header';
    });

    $effect(() => {
        box.refreshComponent = refresh;
        box.setFocus = setFocus;
        // selection is handled here because TableCells are not included in the RenderComponent
        let isSelected: boolean = selectedBoxes.value.includes(box);
        cssClass = isSelected ? 'table-cell-component-selected' : 'table-cell-component-unselected';
    });

    const onKeydown = (event: KeyboardEvent) => {
        LOGGER.log('TableCellComponent onKeyDown');
        if (isMetaKey(event) || event.key === ENTER) {
            LOGGER.log('Keyboard shortcut in TableCell ===============');
            // let index: number = parentOrientation === TableDirection.HORIZONTAL ? row : column;
            // todo handle this here, because there are no shortcuts for Enter created by TableUtils anymore,
            // or add the shortcuts
            // executeCustomKeyboardShortCut(event, index, box, editor);
        }
    };

    $effect(() => {
        // Evaluated and re-evaluated when the box changes.
        refresh('New TableCellComponent created for ' + box?.id); //+ " element name: " + box?.element["name"]);
    });

    const drop = (event: DragEvent) => {
        console.log('drop, dispatching');
        event.stopPropagation();
        ondropOnCell({ row: row, column: column });
    };

    const dragstart = (event: DragEvent) => {
        console.log(`dragStart ${box.node.freId()} ${box.node.freLanguageConcept()} ${box.node.freOwner()?.freLanguageConcept()}`);
        event.stopPropagation();
        // close any context menu
        contextMenuVisible.value = false;

        if (!isNullOrUndefined(event.dataTransfer)) {
            // give the drag an effect
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.dropEffect = 'move';
        }

        // select the complete element
        editor.selectElementForBox(box);

        // create the data to be transferred and notify the store that something is being dragged
        // See https://stackoverflow.com/questions/11927309/html5-dnd-datatransfer-setdata-or-getdata-not-working-in-every-browser-except-fi,
        // which explains why we cannot use event.dataTransfer.setData. We use a svelte store instead.
        draggedElem.value = new ListElementInfo(box.node, parentComponentId);
        draggedFrom.value = parentComponentId;
    };

    const dragenter = (event: DragEvent): boolean => {
        let data: ListElementInfo | null = draggedElem.value;
        if (!!data) {
            if (isFreNodeReference(data.element)) {
                LOGGER.log(`dragEnter item [${data.element.name}] from [${data.componentId}] in table [${id}] on position [${row},${column}]`);
            } else if (isFreNode(data.element)) {
                LOGGER.log(`dragEnter item [${data.element.freId()}] from [${data.componentId}] in table [${id}] on position [${row},${column}]`);
            }
            event.stopPropagation();
            event.preventDefault();
            let myMetaType = {
                type: box.conceptName,
                isRef: FreLanguage.getInstance().classifierProperty(box.node.freLanguageConcept(), box.propertyName)?.propertyKind === 'reference'
            }
            // only show this item as active when the type of the element to be dropped is the right one
            if (FreLanguage.getInstance().dragMetaConformsToType(data.elementType, myMetaType)) {
                activeElem.value = {row: row, column: column};
                activeIn.value = parentComponentId;
                return true;
            }
        }
        return false; // cancels 'normal' browser handling, more or less like preventDefault, present to avoid type error
    };

    const mouseout = (event: MouseEvent): boolean => {
        event.stopPropagation();
        activeElem.value = undefined;
        activeIn.value = '';
        return false; // cancels 'normal' browser handling, more or less like preventDefault, present to avoid type error
    };

    function showContextMenu(event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();

        FreUtils.CHECK(isTableRowBox(box.parent));
        let parent: TableRowBox = box.parent as TableRowBox;
        // set the selected box
        if (editor.selectedBox !== box) {
            if (isActionBox(box.content) || parent.isHeader) {
                selectedBoxes.value = [...parent.children];
            } else {
                editor.selectElementForBox(box);
            }
        }
        // open the context menu
        if (!isNullOrUndefined(contextMenu.instance)) {
            let index: number;
            // determine the contents of the menu based on box
            // if the selected box is the placeholder or a title/header => show different menu items
            let items: MenuItem[] = [];
            if (isActionBox(box.content)) {
                items = box.options(MenuOptionsType.placeholder);
                index = Number.MAX_VALUE;
            } else if (parent.isHeader) {
                items = box.options(MenuOptionsType.header);
                index = -1;
            } else {
                items = box.options(MenuOptionsType.normal);
                // console.log(`showContextMenu row: ${row}, column: ${column}, box.propertyIndex: ${box.propertyIndex}, box.propertyName: ${box.propertyName}`);
                index = box.propertyIndex;
            }
            contextMenu.instance.show(event, index, items); // this function sets contextMenu.instanceVisible to true
        }
    }

    // Note that this component is never part of a RenderComponent, therefore we must handle being selected here
    let selectedCls: string = $state(''); // css class name for when the node is selected
    $effect(() => {
        let isSelected: boolean = box.content.selectable
            ? selectedBoxes.value.includes(box) || selectedBoxes.value.includes(box.content)
            : false;
        selectedCls = isSelected ? 'render-component-selected' : 'render-component-unselected';
    });
</script>

<!-- on:blur is needed for on:mouseout -->
<!-- Apparently, we cannot combine multiple inline style directives, as in -->
<!--  style="grid-row: '{row}' grid-column: '{column}' {cssStyle}"-->
<span
    {id}
    role="cell"
    class="table-cell-component {orientation} {isHeader} {cssClass} {selectedCls}"
    style:grid-row={row}
    style:grid-column={column}
    style={cssStyle}
    onkeydown={onKeydown}
    ondrop={(event) => drop(event)}
    ondragenter={(event) => dragenter(event)}
    ondragover={(event) => {
                event.preventDefault();
            }}
    onmouseout={(event) => mouseout(event)}
    onblur={() => {}}
    oncontextmenu={(event) => showContextMenu(event)}
    bind:this={htmlElement}
    tabindex={-1}
>
    {#if isHeader.length === 0 && addDragHandle}
                <span class="drag-handle"
                      draggable="true"
                      tabindex={-1}
                      ondragstart={(event) => dragstart(event)}
                      role="listitem"><DragHandle/></span>
    {/if}
    <RenderComponent box={childBox} {editor} />
</span>
