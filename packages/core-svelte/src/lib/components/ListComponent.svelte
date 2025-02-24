<script lang="ts">
    import { LIST_LOGGER } from '$lib/components/ComponentLoggers.js';

    /**
     * This component shows a list of elements that have the same type (a 'true' list).
     * It can be shown horizontally or vertically, both are displayed as a grid with one
     * row or column, respectively.
     * This component supports drag and drop.
     */
    import { flip } from 'svelte/animate';
    import {
        Box,
        dropListElement,
        isActionBox,
        isNullOrUndefined,
        FreLanguage,
        ListBox,
        ListDirection,
        ListElementInfo,
        MenuOptionsType,
        moveListElement,
        FreLogger, MenuItem
    } from '@freon4dsl/core';
    import RenderComponent from './RenderComponent.svelte';
    import { componentId } from '$lib/index.js';
    import type { FreComponentProps } from '$lib/components/svelte-utils/FreComponentProps.js';
    import {
        activeElem,
        activeIn,
        contextMenu,
        contextMenuVisible,
        draggedElem,
        draggedFrom
    } from '$lib/components/stores/AllStores.svelte.js';
    import DragHandle from "$lib/components/images/DragHandle.svelte";

    // Props
    let { editor, box }: FreComponentProps<ListBox> = $props();

    // Local state variables
    let LOGGER: FreLogger = LIST_LOGGER;
    let id: string = $state(''); // an id for the html element showing the list
    let htmlElement: HTMLSpanElement;
    let isHorizontal: boolean = $state(true); // indicates whether the list should be shown horizontally or vertically
    let shownElements: Box[] = $state([]); // the parts of the list that are being shown

    // determine the type of the elements in the list
    // this speeds up the check whether an element may be dropped here
    let myMetaType: string;
    $effect(() => {
        myMetaType = box.conceptName;
    });

    const drop = (event: DragEvent, targetIndex: number) => {
        const data: ListElementInfo | null = draggedElem.value;
        event.stopPropagation();

        if (!isNullOrUndefined(data)) {
            console.log(
                'DROPPING item [' +
                    data.element.freId() +
                    '] from [' +
                    data.componentId +
                    '] in list [' +
                    id +
                    '] on position [' +
                    targetIndex +
                    ']'
            );
            if (data.componentId === id) {
                // dropping in the same list
                moveListElement(box.node, data.element, box.propertyName, targetIndex);
            } else {
                // dropping in another list
                dropListElement(editor, data, myMetaType, box.node, box.propertyName, targetIndex);
            }
        }
        // everything is done, so reset the variables
        draggedElem.value = null;
        draggedFrom.value = '';
        activeElem.value = { row: -1, column: -1 };
        activeIn.value = '';
        // Clear the drag data cache (for all formats/types)
        // event.dataTransfer.clearData(); // has problems in Firefox!
    };

    const dragend = (event: DragEvent) => {
        LOGGER.log('Drag End ' + box.id);
        event.stopPropagation();
        return false;
    };

    const dragstart = (event: DragEvent, listId: string, listIndex: number) => {
        LOGGER.log('Drag Start ' + box.id + ' index: ' + listIndex);
        event.stopPropagation();
        // close any context menu
        contextMenuVisible.value = false;

        // give the drag an effect
        if (!isNullOrUndefined(event.dataTransfer)) {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.dropEffect = 'move';
        }

        // See https://stackoverflow.com/questions/11927309/html5-dnd-datatransfer-setdata-or-getdata-not-working-in-every-browser-except-fi,
        // which explains why we cannot use event.dataTransfer.setData. We use a svelte store instead.
        // create the data to be transferred and notify the store that something is being dragged
        draggedElem.value = new ListElementInfo(shownElements[listIndex].node, id);
        draggedFrom.value = listId;
    };

    const dragleave = (event: DragEvent, index: number): boolean => {
        LOGGER.log('Drag Leave' + box.id + ' index: ' + index);
        event.stopPropagation();
        return false;
    };

    const dragenter = (event: DragEvent, index: number): boolean => {
        LOGGER.log('Drag Enter' + box.id + ' index: ' + index);
        event.stopPropagation();
        event.preventDefault();
        const data: ListElementInfo | null = draggedElem.value;
        // Do nothing if no element is being dragged. Stops Svelte from thinking something has changed.
        if (isNullOrUndefined(draggedElem.value)) {
            return false;
        }
        // only show this item as active when the type of the element to be dropped is the right one
        if (
            !isNullOrUndefined(data) &&
            FreLanguage.getInstance().metaConformsToType(data.element, myMetaType)
        ) {
            activeElem.value = { row: index, column: -1 };
            activeIn.value = id;
        }
        return false; // cancels 'normal' browser handling, more or less like preventDefault, present to avoid type error
    };

    const mouseout = (): boolean => {
        LOGGER.log('LIST mouse out ' + box.id);
        // Do nothing if no element is being dragged. Stops Svelte from thinking something has changed.
        if (isNullOrUndefined(draggedElem.value)) {
            return false;
        }
        activeElem.value = { row: -1, column: -1 };
        activeIn.value = '';
        return false; // cancels 'normal' browser handling, more or less like preventDefault, present to avoid type error
    };

    function showContextMenu(event: MouseEvent, index: number) {
        event.stopPropagation();
        event.preventDefault();
        if (index >= 0 && index <= shownElements.length) {
            const elemBox: Box = shownElements[index];
            if (editor.selectedBox !== elemBox) {
                editor.selectElementForBox(elemBox);
                // $selectedBoxes = [elemBox];
            }
            // determine the contents of the menu based on listBox, before showing the menu!
            let items: MenuItem[] = [];
            if (isActionBox(elemBox)) {
                // the selected box is the placeholder => show different menu items
                items = box.options(MenuOptionsType.placeholder);
            } else {
                items = box.options(MenuOptionsType.normal);
            }
            contextMenu.instance!.show(event, index, items); // this function sets contextMenuVisible to true
        }
    }

    async function setFocus(): Promise<void> {
        LOGGER.log('ListComponent.setFocus for box ' + box.role);
        if (!isNullOrUndefined(htmlElement)) {
            htmlElement.focus();
        }
    }

    $effect(() => {
        LOGGER.log('ListComponent.effect for ' + box.role);
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    const refresh = (why?: string): void => {
        LOGGER.log('REFRESH ListComponent( ' + why + ') ' + box?.node?.freLanguageConcept());
        shownElements = [...box.children];
        id = !isNullOrUndefined(box) ? componentId(box) : 'list-for-unknown-box';
        isHorizontal = !isNullOrUndefined(box)
            ? box.getDirection() === ListDirection.HORIZONTAL
            : false;
    };

    $effect(() => {
        // Evaluated and re-evaluated when the box changes.
        refresh('Refresh from ListComponent box changed:   ' + box?.id);
    });
</script>

<!-- onblur is needed for onmouseout -->
<span
    class={isHorizontal ? 'list-component-horizontal' : 'list-component-vertical'}
    {id}
    bind:this={htmlElement}
    style:grid-template-columns="auto"
    style:grid-template-rows="auto"
>
    {#each shownElements as box, index (box.id)}
        <span
            class="list-item"
            class:is-active={activeElem.value?.row === index && activeIn.value === id}
            class:dragged={draggedElem.value?.propertyIndex === index && draggedFrom.value === id}
            style:grid-column={!isHorizontal ? 1 : index + 1}
            style:grid-row={isHorizontal ? 1 : index + 1}
            animate:flip

            ondragend={(event) => dragend(event)}
            ondrop={(event) => drop(event, index)}
            ondragover={(event) => {
                event.preventDefault();
            }}
            ondragenter={(event) => dragenter(event, index)}
            ondragleave={(event) => dragleave(event, index)}
            onmouseout={mouseout}
            onblur={() => {}}
            oncontextmenu={(event) => showContextMenu(event, index)}
            role="none"
        >
            <span class="drag-handle"
                  draggable="true"
                  ondragstart={(event) => dragstart(event, id, index)}
                  role="listitem"><DragHandle/></span>
            <RenderComponent {box} {editor} />
        </span>
    {/each}
</span>
