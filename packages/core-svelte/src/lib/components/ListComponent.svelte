<script lang="ts">
    import { LIST_LOGGER } from './ComponentLoggers.js';

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
        MenuItem,
        type DragAndDropType,
        isFreNodeReference,
        isFreNode,
        FreLogger,
        FreCreatePartAction,
        MetaKey,
        AST,
        ENTER
    } from "@freon4dsl/core"
    import RenderComponent from './RenderComponent.svelte';
    import { componentId, rememberDraggedNode } from '../index.js';
    import type { ListProps } from './svelte-utils/FreComponentProps.js';
    import {
        activeElem,
        activeIn,
        contextMenu,
        contextMenuVisible,
        draggedElem,
        draggedFrom
    } from './stores/AllStores.svelte.js';
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
    let myMetaType: DragAndDropType;
    
    $effect(() => {
        // console.log(`EFFECT ${box.conceptName} : ${box.node.freLanguageConcept()}`)
        myMetaType = {
            type: box.conceptName,
            isRef: FreLanguage.getInstance().classifierProperty(box.node.freLanguageConcept(), box.propertyName)?.propertyKind === 'reference'
        }
        // runs after the initial onMount
        LOGGER.log('ListComponent.effect for ' + box.role);
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
        // Evaluated and re-evaluated when the box changes.
        refresh('Refresh from ListComponent box changed:   ' + box?.id);
    });



    const drop = (event: DragEvent, targetIndex: number) => {
        const data: ListElementInfo | null = draggedElem.value;
        event.stopPropagation();

        if (!isNullOrUndefined(data)) {
            if (isFreNodeReference(data.element)) {
                LOGGER.log(`DROPPING item [${data.element.name}] from [${data.componentId}] in list [${id}] on position [${targetIndex}]`);
            } else if (isFreNode(data.element)) {
                LOGGER.log(`DROPPING item [${data.element.freId()}] from [${data.componentId}] in list [${id}] on position [${targetIndex}]`);
            }
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
        console.log('Drag Start ' + box.id + ' index: ' + listIndex);
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
        // Create the data to be transferred and notify the store that something is being dragged.
        rememberDraggedNode(listId, box, shownElements[listIndex]);
        // console.log(`dragstart: ${draggedElem.value.element.freLanguageConcept()}`)
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
        if (isNullOrUndefined(data)) {
            return false;
        }
        // console.log(JSON.stringify(data.elementType) + ' compares to ' + JSON.stringify(myMetaType))
        // only show this item as active when the type of the element to be dropped is the right one
        if (FreLanguage.getInstance().dragMetaConformsToType(data.elementType, myMetaType)) {
            activeElem.value = { row: index, column: -1 };
            activeIn.value = id;
            return true;
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

    const refresh = (why?: string): void => {
        LOGGER.log('REFRESH ListComponent( ' + why + ') ' + box?.node?.freLanguageConcept());
        shownElements = [...box.children];
        id = !isNullOrUndefined(box) ? componentId(box) : 'list-for-unknown-box';
        isHorizontal = !isNullOrUndefined(box)
            ? box.getDirection() === ListDirection.HORIZONTAL
            : false;
    };

    const onKeyDown = (event: KeyboardEvent, index: number) => {
        if (event.key === ENTER) {
            // Create a new list element after the node at index
            event.stopPropagation()
            const action: FreCreatePartAction = new FreCreatePartAction({
                trigger: { meta: MetaKey.None, key: ENTER, code: ENTER },
                activeInBoxRoles: [box.role, "action-" + box.role + "-textbox"],
                conceptName: box.conceptName,
                propertyName: box.propertyName,
                boxRoleToSelect: undefined,
            })
            let execresult: () => void;
            AST.changeNamed("ListComponent.Enter", () => {
                execresult = action.execute(box, { meta: MetaKey.None, key: ENTER, code: ENTER }, editor, index + 1)
            })
            // @ts-ignore
            if (!!execresult) {
                execresult();
            }
        }
    }
</script>

<!-- onblur is needed for onmouseout -->
<span
    class="{isHorizontal ? 'list-component-horizontal' : 'list-component-vertical'} {box.cssClass}"
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

            onkeydown={event => {onKeyDown(event, index)}}
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
            {#if !isActionBox(box)}
            <span class="drag-handle"
                  draggable="true"
                  ondragstart={(event) => dragstart(event, id, index)}
                  role="listitem"><DragHandle/></span>
            {/if}
            <RenderComponent {box} {editor} />
        </span>
    {/each}
</span>
