<script>
    import ContextMenu from './ContextMenu.svelte';
    import Icon from './Icon.svelte';
    import clickOutside from './clickOutside';
    import {writable} from 'svelte/store';
    export let list = [
        { id: 'J---aiyznGQ', name: 'Keyboard Cat' },
        { id: 'z_AbfPXTKms', name: 'Maru' },
        { id: 'OUtn3pvWmpg', name: 'Henri The Existential Cat' }
    ];

    export let boxId = 12;
    let active = true;
    let children;
    $: children = list;

    let templateColumns;
    $: templateColumns = active ? `repeat(5, auto)` : `repeat(4, auto)`
    let contextMenu;
    let itemWithMenu;

    function buttonClick(index) {
        children[index].active = true;
    }

    function openMenu(a, b, index) {
        console.log('button for index ' + index);
        itemWithMenu = index;
        contextMenu.show(a-150, b);
        children[index].active = true;
    }

    function deselect(index) {
        children[index].active = false;
    }

    const dragstart = (event, listId, listIndex) => {
        console.log('dragging element ' + children[listIndex].name);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.dropEffect = 'move';
        const data = {listId: listId, listIndex};
        event.dataTransfer.setData('text/plain', JSON.stringify(data));

    }
    const coords = writable({x: 0, y: 0});

    const drop = (event /* : DragEvent */, targetIndex) => {
        event.dataTransfer.dropEffect = 'move';
        const json = event.dataTransfer.getData("text/plain");
        const data = JSON.parse(json);
        const newTracklist = list;

        // TODO update model here, this code only outlines what needs to be done
        console.log('DROPPING list-item [' + data.listIndex + '] from list [' + data.listId + '] in list [' + boxId + ']' + ' at index ' + targetIndex );
    }
</script>

<div class='CompleteGrid'	 tabIndex={0} style:grid-template-columns="{templateColumns}">
    {#each children as n, index (n.name)}
        <div class="cell" class:is-active={n.active} style='grid-row:{index} grid-column: 1' tabIndex={0}
             use:clickOutside
             on:clickOutside={deselect(index)}
             on:drop|preventDefault={event => drop(event, index)}
             ondragover="return false"
             on:dragenter={() => n.active = true}
             on:dragleave={() => n.active = false}
        >
            {n.name}
        </div>
        <div class="cell" class:is-active={n.active} style='grid-row:{index} grid-column: 2' tabIndex={0}
             use:clickOutside
             on:clickOutside={deselect(index)}
             on:drop|preventDefault={event => drop(event, index)}
             ondragover="return false"
             on:dragenter={() => n.active = true}
             on:dragleave={() => n.active = false}
        >
            email
        </div>
        <div class="cell" class:is-active={n.active} style='grid-row:{index} grid-column: 3'
             use:clickOutside
             on:clickOutside={deselect(index)}
             on:drop|preventDefault={event => drop(event, index)}
             ondragover="return false"
             on:dragenter={() => n.active = true}
             on:dragleave={() => n.active = false}
        >
            phone
        </div>
        <div class="cell" class:is-active={n.active} style='grid-row:{index} grid-column: 4'
             use:clickOutside
             on:clickOutside={deselect(index)}
             on:drop|preventDefault={event => drop(event, index)}
             ondragover="return false"
             on:dragenter={() => n.active = true}
             on:dragleave={() => n.active = false}
        >
            {n.id}
        </div>
        {#if active}
            <div class='button'
                 on:click={buttonClick(index)}
                 draggable=true
                 on:dragstart={event => dragstart(event, boxId, index)}
                 on:drop|preventDefault={event => drop(event, index)}
                 ondragover="return false"
                 on:dragenter={() => n.active = true}
                 on:dragleave={() => n.active = false}
                 on:contextmenu|preventDefault={e => openMenu(e.clientX, e.clientY, index)}
                 style="transform: translate({$coords.x}px,{$coords.y}px)"
            > ...
            </div>
        {/if}
    {/each}
</div>
<ContextMenu bind:this={contextMenu}/>

<style>
    .CompleteGrid {
        display:grid;
        grid-template-rows:1fr;
        grid-row-gap:8px;
        background-color:#EDF5FC;
        cursor:pointer;
        margin:auto;
    }

    .cell {
    }

    .cell.is-active {
        background-color: darkblue;
        color: #fff;
    }

    .button {
        background-color: #4CAF50; /* Green */
        border: none;
        color: white;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        min-width: 16px;
        justify-self: end;
        align-self: center;
    }
</style>
