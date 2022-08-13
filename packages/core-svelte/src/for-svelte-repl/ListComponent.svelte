<script>
    import {flip} from 'svelte/animate';
    import TextComponent from "./TextComponent.svelte";
    import ContextMenu from './ContextMenu.svelte';

    export let isHorizontal = false;
    export let boxId = 123;
    export let list = [
        { id: 'J---aiyznGQ', name: 'Keyboard Cat' },
        { id: 'z_AbfPXTKms', name: 'Maru' },
        { id: 'OUtn3pvWmpg', name: 'Henri The Existential Cat' }
    ];

    let shownElements = [];
    $: shownElements = addStyleProps(list);

    function addStyleProps(list){
        let result = [];
        list.forEach (c => {result.push({name: c.name, hover: false, active: false})});
        return result;

        // the first part of a shownElement is the identification of the model element, the others have to do with styling:
        // 'hover' indicates hovering, but not dragging
        // 'active' indicates hovering while dragging per list-item
    }

    const drop = (event /* : DragEvent */, targetIndex) => {
        event.dataTransfer.dropEffect = 'move';
        const json = event.dataTransfer.getData("text/plain");
        const data = JSON.parse(json);
        const newTracklist = list;

        // TODO update model here, this code only outlines what needs to be done
        console.log('DROPPING list-item [' + data.listIndex + '] from list [' + data.listId + '] in list [' + boxId + ']');
        if (data.listId === boxId) { // dropping in the same list
            if (data.listIndex < targetIndex) {
                newTracklist.splice(targetIndex + 1, 0, newTracklist[data.listIndex]);
                newTracklist.splice(data.listIndex, 1);
            } else {
                newTracklist.splice(targetIndex, 0, newTracklist[data.listIndex]);
                newTracklist.splice(data.listIndex + 1, 1);
            }
        } else {
            for (let i = 0; i < shownElements.length; i++) {
                shownElements[i].active = false;
            }
        }
        list = newTracklist;
    }

    const dragstart = (event, listId, listIndex) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.dropEffect = 'move';
        const data = {listId: listId, listIndex};
        event.dataTransfer.setData('text/plain', JSON.stringify(data));
    }

    let contextMenu;
    let itemWithMenu;
    function openMenu(a, b, c) {
        console.log('openMenu: ' + a + ", " + b + ", " + c.name);
        itemWithMenu = c;
        contextMenu.show(a, b);
    }
</script>

<!-- on:focus is here to avoid a known bug in svelte 3.4*	:
  A11y: on:mouseover must be accompanied by on:focus with Svelte v3.40 #285
likewise on:blur is needed for on:mouseout -->
<div class="list" class:horizontalList="{isHorizontal}" class:verticalList="{!isHorizontal}" tabindex=0 >
    {#each shownElements as n, index  (n.name)}
        <span
                class="list-item"
                class:hovering={n.hover}
                class:is-active={n.active}
                animate:flip
                draggable=true
                on:dragstart={event => dragstart(event, boxId, index)}
                on:drop|preventDefault={event => drop(event, index)}
                ondragover="return false"
                on:dragenter={() => n.active = true}
                on:dragleave={() => n.active = false}
                on:mouseover={() => n.hover = true}
                on:mouseout={() => {n.active = false; n.hover = false;}}
                on:focus={() => {}}
                on:blur={() => {}}
                on:contextmenu|preventDefault={e => openMenu(e.clientX, e.clientY, n)}
        >
       <TextComponent text={n.name} partOfAlias={false}/>
            {#if !isHorizontal && (index < shownElements.length - 1)} <br> {/if}
		</span>
    {/each}
</div>
<ContextMenu bind:this={contextMenu}/>

<style>
    .list {
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
    }

    .list-item {
        /* display: inline;
        padding: 0.5em 1em;  */
        margin-left:5px;
    }

    .list-item.is-active {
        background-color: red;
        color: #fff;
    }

    .list-item.hovering {
        background-color: mediumpurple;
        border: solid 2px mediumpurple;
        color: #fff;
    }

    .horizontalList {
        /*grid-template-rows: var(--pi-list-grid-template-rows);*/
        /*grid-template-columns: var(--pi-list-grid-template-columns);*/
        white-space: nowrap;
        display: inline-block;
        padding: var(--freon-horizontallist-component-padding, 1px);
        background-color: var(--freon-editor-component-background-color, white);
        margin: var(--freon-horizontallist-component-margin, 1px);
        box-sizing: border-box;
    }

    .verticalList {
        /*grid-template-rows: var(--pi-list-grid-template-rows);*/
        /*grid-template-columns: var(--pi-list-grid-template-columns);*/
        /*display: grid;*/
        background-color: var(--freon-editor-component-background-color, white);
        padding: var(--freon-verticallist-component-padding, 1px);
        margin: var(--freon-verticallist-component-margin, 1px);
        /*margin-top: 10px;*/
        box-sizing: border-box;
    }
</style>
