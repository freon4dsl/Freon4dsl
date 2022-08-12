<script>
    import {flip} from 'svelte/animate';
    import TextComponent from "./TextComponent.svelte";
    import TextDropdownComponent from "./TextDropdownComponent.svelte";

    export let list = [
        { id: 'J---aiyznGQ', name: 'Keyboard Cat' },
        { id: 'z_AbfPXTKms', name: 'Maru' },
        { id: 'OUtn3pvWmpg', name: 'Henri The Existential Cat' }
    ];
    export let isHorizontal = false;
    export let boxId = 123;
    export let hasSubclasses = true;

    let hoveringWithoutData = -1; // indicates hovering, but not dragging
    let placeholder = '<placeholder>';
    let active = []; // indicates hovering while dragging per list-item
    let children;
    $: children = list;

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
            for (let i = 0; i < active.length; i++) {
                active[i] = false;
            }
        }
        list = newTracklist;
        hoveringWithoutData = -1;
    }

    const dragstart = (event, listId, listIndex) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.dropEffect = 'move';
        const data = {listId: listId, listIndex};
        event.dataTransfer.setData('text/plain', JSON.stringify(data));
    }

    let first = true;
    function addElement(index) {
        // TODO update model here
        if (first) {
            list.push({id:'fdsa35345', name: 'Mojojojo'});
            first = false;
        } else {
            list.push({id:'45hhh', name: 'Gabber'});
        }
        children = list; // triggers the refresh of children, not needed when new element is added to model
    }

    const setInactive = (index) => {
        console.log('setInactive');
        active[index] = false;
        hoveringWithoutData = -1;
    }
    const subclasses = () => {
        return [{id:'opt1', label:'subclass1'}, {id:'opt2', label:'subclass2'}];
    }
</script>

<!-- on:focus is here to avoid a known bug in svelte 3.4*	:
  A11y: on:mouseover must be accompanied by on:focus with Svelte v3.40 #285
likewise on:blur is needed for on:mouseout -->
<div class="list" class:horizontalList="{isHorizontal}" class:verticalList="{!isHorizontal}" tabindex=0 >
    {#each children as n, index  (n.name)}
        <span
                class="list-item"
                animate:flip
                draggable=true
                on:dragstart={event => dragstart(event, boxId, index)}
                on:drop|preventDefault={event => drop(event, index)}
                ondragover="return false"
                on:dragenter={() => active[index] = true}
                on:dragleave={() => active[index] = false}
                class:is-active={active[index]}
                on:mouseover={() => hoveringWithoutData = index}
                on:mouseout={() => {active[index] = false; hoveringWithoutData = -1;}}
                on:focus={() => {}}
                on:blur={() => {}}
                class:hovering={hoveringWithoutData === index}
        >
       <TextComponent text={n.name} partOfAlias={false}/>
            {#if !isHorizontal } <br> {/if}
        </span>
    {/each}
    <span class="list-item" on:click={() => addElement(children.length)} tabindex=0
          on:mouseover={() => hoveringWithoutData = children.length + 1}
          on:mouseout={() => hoveringWithoutData = -1}
          on:focus={() => {}}
          on:blur={() => {}}
          class:hovering={hoveringWithoutData === children.length + 1}
    >
        {#if hasSubclasses}
            <TextDropdownComponent getOptions={() => {return [{id:'opt1', label:'subclass1'}, {id:'opt2', label:'subclass2'}]} } />
            {:else}
			{placeholder}
            {/if}
	</span>
</div>

<style>
    .list {
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
    }

    .list-item {
        /*     display: inline-block;
            padding: 0.5em 1em; */
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
