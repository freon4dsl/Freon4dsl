<script>
    import ContextMenu from './ContextMenu.svelte'

    const items = [
        { label: "Append", shortcut: "Ctrl+A", handler: () => alert('appending...')},
        { label: "Insert", shortcut: "Ctrl+I", handler: () => alert('inserting...')},
        { label: "Delete", handler: () => alert('deleting...')},
        '---',
        { label: "Scroll", handler: () => alert('scrolling...')},
        { label: "Select", handler: () => alert('selecting...')},
    ]

    let contextMenu
</script>

<h1>Context menu example</h1>

<p>Right click anywhere to view.</p>

<ContextMenu bind:this={contextMenu} {items}/>
<svelte:window on:contextmenu={contextMenu.show}/>


<style>
    :global(body) {
        display: flex;
        justify-content: center;
        flex-direction: column;
        place-items: center;
    }
</style>
