<script>
    import ContextMenu from './ContextMenu.svelte';
    export let items = [];
    let contextMenu;
    let activeItem;

    function openMenu(a, b, c) {
        console.log('XXX: ' + a + ", " + b + ", " + c.name);
        activeItem = c;
        contextMenu.show(a, b);
    }
</script>

<ul>
    {#each items as it}
        <li class:red={it.isRed} on:contextmenu|preventDefault={e => openMenu(e.clientX, e.clientY, it)} >
            {it.name}
        </li>
    {/each}
</ul>
<ContextMenu bind:this={contextMenu}/>

<style>
    .red {
        color: red;
    }
</style>
