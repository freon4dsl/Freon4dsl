<script lang="ts">
    import { TABLE_LOGGER } from './ComponentLoggers.js';

    /**
     * This component shows a list of elements that have the same type (a 'true' list) as
     * a table. It can be shown row-based or column-based, both are displayed as a grid.
     * This component functions as a drop zone for dragged elements from either a ListComponent
     * or a TableCellComponent.
     */
    import {
        type TableBox,
        ListElementInfo,
        TableDirection,
        isTableRowBox,
        isElementBox,
        TableCellBox,
        notNullOrUndefined, isFreNodeReference, isFreNode, type DragAndDropType, FreLanguage
    } from '@freon4dsl/core';
    import { componentId } from '../index.js';

    import { dropListElement, moveListElement } from '@freon4dsl/core';
    import TableCellComponent from './TableCellComponent.svelte';
    import type { FreComponentProps } from './svelte-utils/FreComponentProps.js';
    import { activeElem, activeIn, draggedElem, draggedFrom } from './stores/AllStores.svelte';
    import type { TableDetails } from './svelte-utils/TableDetails.js';

    const LOGGER = TABLE_LOGGER;

    // Props
    let { editor, box }: FreComponentProps<TableBox> = $props();

    let id = notNullOrUndefined(box) ? componentId(box) : 'table-for-unknown-box';
    let cells: TableCellBox[] = $state([]);
    let templateColumns: string = $state('');
    let templateRows: string = $state('');
    let cssClass: string = $state('');
    let htmlElement: HTMLElement;
    let myMetaType: DragAndDropType;
    
    $effect(() => {
        // console.log(`EFFECT ${box.conceptName} : ${box.node.freLanguageConcept()}`)
        myMetaType = {
            type: box.conceptName,
            isRef: FreLanguage.getInstance().classifierProperty(box.node.freLanguageConcept(), box.propertyName)?.propertyKind === 'reference'
        }

        box.refreshComponent = refresh;
        box.setFocus = setFocus;
        // We also set the refresh to each child that is a TableRowBox,
        // because TableRowBoxes do not have an equivalent Svelte component.
        for (const child of box.children) {
            if (isTableRowBox(child)) {
                child.refreshComponent = refresh;
            } else if (isElementBox(child) && isTableRowBox(child.content)) {
                child.refreshComponent = refresh;
            }
        }
        // Evaluated and re-evaluated when the box changes.
        refresh('Refresh new box: ' + box?.id);
    });

    const refresh = (why?: string): void => {
        LOGGER.log('Refresh TableBox, box: ' + why);
        if (notNullOrUndefined(box)) {
            cells = getCells();
            templateColumns = `repeat(${box.numberOfColumns() - 1}, auto)`;
            templateRows = `repeat(${box.numberOfRows() - 1}, auto)`;
            cssClass = box.cssClass;
        }
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

    function getCells(): TableCellBox[] {
        const _cells: TableCellBox[] = [];
        box.children.forEach((ch) => {
            if (isElementBox(ch)) {
                const rowBox = ch.content;
                if (isTableRowBox(rowBox)) {
                    _cells.push(...rowBox.cells);
                }
            } else if (isTableRowBox(ch)) {
                _cells.push(...ch.cells);
            }
        });
        return _cells;
    }

    const drop = (details: TableDetails) => {
        const data: ListElementInfo | null = draggedElem.value;
        let targetIndex = details.row - 1;
        if (box.direction === TableDirection.VERTICAL) {
            targetIndex = details.column - 1;
        }

        if (notNullOrUndefined(data)) {
            if (isFreNodeReference(data.element)) {
                LOGGER.log(`DROPPING item [${data.element.name}] from [${data.componentId}] in list [${id}] on position [${targetIndex}]`);
            } else if (isFreNode(data.element)) {
                LOGGER.log(`DROPPING item [${data.element.freId()}] from [${data.componentId}] in list [${id}] on position [${targetIndex}]`);
            }
            if (box.hasHeaders) {
                // take headers into account for the index in the node model
                targetIndex = targetIndex - 1;
                // console.log("grid has headers, targetIndex: " + targetIndex);
            }

            if (data.componentId === id) {
                // dropping in the same grid
                // console.log("moving item within grid");
                moveListElement(box.node, data.element, box.propertyName, targetIndex);
            } else {
                // dropping in another list
                // console.log("moving item to another grid, drop type: " + data.elementType + ", grid cell type: " + elementType);
                dropListElement(editor, data, myMetaType, box.node, box.propertyName, targetIndex);
            }
        }
        // Everything is done, so reset the variables
        draggedElem.value = null;
        draggedFrom.value = '';
        activeElem.value = { row: -1, column: -1 };
        activeIn.value = '';
        // Clear the drag data cache (for all formats/types) (gives error in FireFox!)
        // event.dataTransfer.clearData();
    };
</script>

<span
    style:grid-template-columns={templateColumns}
    style:grid-template-rows={templateRows}
    class="table-component {cssClass}"
    {id}
    tabIndex={-1}
    bind:this={htmlElement}
>
    {#each cells as cell (cell.content.id + '-' + cell.row + '-' + cell.column)}
        <TableCellComponent
            box={cell}
            {editor}
            parentComponentId={id}
            parentOrientation={box.direction}
            ondropOnCell={drop}
        />
    {/each}
</span>
