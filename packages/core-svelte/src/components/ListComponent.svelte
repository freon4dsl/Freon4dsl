<script lang="ts">
    import { flip } from 'svelte/animate'; // TODO adjust rollup.config for svelte.animate
    import ContextMenu from './ContextMenu.svelte';
    import { Box, Language, ListBox, PiEditor } from "@projectit/core";
    import { componentId } from "./util";
    import RenderComponent from "./RenderComponent.svelte";
    import { runInAction } from "mobx";
    import { checkAndDrop, moveListElement } from "./dropHelpers";
    import { active, activeInList, dragged, draggedFromList } from "./DropStore";

    export let box: ListBox;	                // the accompanying ListBox
    export let editor: PiEditor;			    // the editor

    let id: string;                             // an id for the html element showing the list
    id = !!box ? componentId(box) : 'list-with-unknown-box';
    let isHorizontal = false;                   // indicates whether the list should be shown horizontally or vertically
    let hovering = -1;                          // determines the style of a list element, when nothing is being dragged
    let shownElements: Box[];
    $: shownElements = [...box.children];

    // determine the type of the elements in the list
    // this speeds up the check wether the element may be dropped in a certain drop-zone
    const propInfo = Language.getInstance().classifierProperty(box.element.piLanguageConcept(), box.propertyName);
    let elementType: string = propInfo.type;

    const drop = (event: DragEvent, targetIndex) => {
        const json = event.dataTransfer.getData("text/plain");
        const data = JSON.parse(json);

        // console.log('DROPPING list-item [' + data.dropInfo.index + '] from list [' + data.listId + '] in list [' + id + ']');
        if (data.listId === id) { // dropping in the same list
            runInAction(() => {
                moveListElement(box.element, box.propertyName, data.dropInfo.index, targetIndex);
            });
        } else { // dropping in another list
            runInAction(() => {
                // check if item may be dropped here
                if (!checkAndDrop(editor.rootElement, box.element, box.propertyName, data.dropInfo, targetIndex)) {
                    // TODO other way for error message
                    alert("drop is not allowed here, types do not match");
                }
                // TODO second drop gives mobx error
            });
        }
        // everything is done, so reset the variables
        $dragged = -1;
        $draggedFromList = '';
        $active = -1;
        $activeInList = '';
        hovering = -1;
    }

    const dragstart = (event: DragEvent, listId: string, listIndex) => {
        // give the drag an effect
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.dropEffect = 'move';

        // create the data to be transfered
        const data = {listId: listId, dropInfo: { parentElementId: box.element.piId(), propertyName: box.propertyName, propertyType: elementType, index: listIndex }};
        event.dataTransfer.setData('text/plain', JSON.stringify(data));

        // notify the store that something is being dragged
        $dragged = listIndex;
        $draggedFromList = listId;
    }
    const dragenter= (event: DragEvent, index): boolean => {
        const json = event.dataTransfer.getData("text/plain");
        const data = JSON.parse(json);
        // only show this list item as active when the type of the element to be dropped is the right one
        // TODO allow subtypes
        if (elementType === data.dropInfo.propertyType) {
            $active = index;
            $activeInList = id;
            return false; // cancels 'normal' browser handling, more or less like preventDefault, present to avoid type error
        }
    }
    const mouseover=(index): boolean => {
        hovering = index;
        return false; // cancels 'normal' browser handling, more or less like preventDefault, present to avoid type error
    }
    const mouseout=(): boolean => {
        hovering = -1;
        $active = -1;
        $activeInList = '';
        return false; // cancels 'normal' browser handling, more or less like preventDefault, present to avoid type error
    }

    let contextMenu;
    let itemWithMenu;
    function openMenu(a, b, c) {
        console.log('openMenu: ' + a + ", " + b + ", " + c + ', editor pos: ' + editor.scrollX + editor.scrollY);
        itemWithMenu = c;
        contextMenu.show(a, b);
    }

    // The mouseover fires when the mouse cursor is outside the element and then move to inside the boundaries of the element.
    // The mouseout fires when the mouse cursor is over an element and then moves another element.
    // The mouseenter fires when the mouse cursor is outside an element and then moves to inside the boundaries of the element.
    // The mouseleave fires when the mouse cursor is over an element and then moves to the outside of the element’s boundaries.
    // Both mouseenter and mouseleave does not bubble and does not fire when the mouse cursor moves over descendant elements.
</script>

<!-- on:focus is here to avoid a known bug in svelte 3.4*: "A11y: on:mouseover must be accompanied by on:focus with Svelte v3.40 #285" -->
<!-- Likewise on:blur is needed for on:mouseout -->
<div class="list" class:horizontalList="{isHorizontal}" class:verticalList="{!isHorizontal}" tabindex=0 id="{id}">
    {#each shownElements as box, index  (box.id)}
        <span
                class="list-item"
                class:hovering={hovering === index && !($active === index && $activeInList === id)}
                class:is-active={$active === index && $activeInList === id}
                class:dragged={$dragged === index && $draggedFromList === id}
                animate:flip
                draggable=true
                on:dragstart|stopPropagation={event => {dragstart(event, id, index);}}
                on:drop|stopPropagation={event => drop(event, index)}
                ondragover="return false"
                on:dragenter|stopPropagation={(event) => dragenter(event, index)}
                on:mouseover|stopPropagation={() => mouseover(index)}
                on:mouseout|stopPropagation={mouseout}
                on:focus={() => {}}
                on:blur={() => {}}
                on:contextmenu|preventDefault={(event) => openMenu(event.pageX, event.pageY, index)}
        >
            <RenderComponent box={box} editor={editor}/>
            {#if !isHorizontal && (index < shownElements.length - 1)} <br> {/if}
		</span>
    {/each}
</div>
<ContextMenu bind:this={contextMenu}/>

<style>
    .list {
        border-radius: 4px;
        box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
        padding: var(--freon-horizontallist-component-padding, 1px);
        background-color: var(--freon-editor-component-background-color, white);
        margin: var(--freon-horizontallist-component-margin, 1px);
        box-sizing: border-box;
    }
    .list-item {
        display: block;
        margin-left:5px;
        /* to prevent movement of elements when changing style there is an 'invisible' border that can change color */
        border: solid 2px transparent;
    }
    .list-item.is-active {
        border: solid 2px red;
        background-color: red; /* TODO adjust the colors to freon colors */
        color: #fff;
        border-top: solid 10px transparent; /* move the element a little down to show where the drop can take place */
    }
    .list-item.hovering {
        cursor: grab;
    }
    .list-item.dragged {
        opacity:0.5;
        cursor: grabbing;
    }
    .horizontalList {
        white-space: nowrap;
        display: inline-block;
    }
    .verticalList {
    }
</style>
