<script>
    import { clickOutside } from "./clickOutside";

    const items = [
        { label: "Add before", shortcut: "Ctrl+A", handler: () => openSub()},
        { label: "Add after", shortcut: "Ctrl+I", handler: () => openSub()},
        { label: "Delete", handler: () => alert('deleting...')},
        '---',
        { label: "Cut", handler: () => alert('cut...')},
        { label: "Copy", handler: () => alert('copy...')},
        { label: "Paste before", handler: () => alert('paste before...')},
        { label: "Paste after", handler: () => alert('paste after...')},
    ]

    let open = false;
    let top = 0, left = 0;

    // everything for the submenu
    let hasSubclasses = true;
    let submenuOpen = false;
    const submenuItems = [
        { label: "Subclass1", handler: () => alert('Subclass1 chosen')},
        { label: "Subclass2", handler: () => alert('Subclass2 chosen')},
        { label: "Subclass3", handler: () => alert('Subclass3 chosen')},
        { label: "Subclass4", handler: () => alert('Subclass4 chosen')},
    ]

    export function show(posX, posY) {
        open = true;
        submenuOpen = false;
        top = posY;
        left = posX;
    }

    let contextMenu;

    export function hide() {
        open = false;
        submenuOpen = false;
    }

    function hidesubmenu() {
        open = false;
        submenuOpen = false;
    }

    function openSub() {
        if (hasSubclasses) {
            open = true;
            submenuOpen = true;
        }
    }

    // example to show how to position menu: above mouse when at the end of page, below otherwise
    // function setContextMenuPostion(event, contextMenu) {
    //
    //     var mousePosition = {};
    //     var menuPostion = {};
    //     var menuDimension = {};
    //
    //     menuDimension.x = contextMenu.outerWidth();
    //     menuDimension.y = contextMenu.outerHeight();
    //     mousePosition.x = event.pageX;
    //     mousePosition.y = event.pageY;
    //
    //     if (mousePosition.x + menuDimension.x > $(window).width() + $(window).scrollLeft()) {
    //         menuPostion.x = mousePosition.x - menuDimension.x;
    //     } else {
    //         menuPostion.x = mousePosition.x;
    //     }
    //
    //     if (mousePosition.y + menuDimension.y > $(window).height() + $(window).scrollTop()) {
    //         menuPostion.y = mousePosition.y - menuDimension.y;
    //     } else {
    //         menuPostion.y = mousePosition.y;
    //     }
    //
    //     return menuPostion;
    // }
</script>

<nav class="contextmenu"
     style="display: {open ? 'flex' : 'none'}; top: {top}px; left: {left}px"
     use:clickOutside
     on:clickOutside={hide}
    bind:this={contextMenu}>
    {#each items as item}
        {#if item == '---'}
            <hr/>
        {:else}
            <button on:click={item.handler}>
                {item.label}
                {#if item.shortcut}
                    <span class="shortcut">{item.shortcut}</span>
                {/if}
            </button>
        {/if}
    {/each}
</nav>
<nav class="contextmenu"
     style="display: {submenuOpen ? 'flex' : 'none'}; top: {top+10}px; left: {left+50}px"
     on:click={hidesubmenu}
     use:clickOutside
     on:click_outside={hide}>
    {#each submenuItems as item}
        {#if item == '---'}
            <hr/>
        {:else}
            <button on:click={item.handler}>
                {item.label}
                {#if item.shortcut}
                    <span class="shortcut">{item.shortcut}</span>
                {/if}
            </button>
        {/if}
    {/each}
</nav>

<style>
    .contextmenu {
        display: none;
        flex-direction: column;
        border: solid 1px #c5c5c5;
        border-radius: 3px;
        gap: 1px;
        position: absolute;
        background: #e5e5e5;
        min-width: 120px;
        z-index: 10;
    }
    button {
        background: none;
        border: none;
        border-radius: 2px;
        padding: 4px;
        margin: 3px;
        cursor: pointer;
        text-align: left;
        display: flex;
        justify-content: space-between;
        gap: 5px;
        place-items: center;
    }
    button:hover {
        background: #f4f4f4;
    }
    .shortcut {
        color: #666;
        font-size: 0.7em;
    }

    hr {
        border-top: solid 1px #c5c5c5;
        width: 100%;
        margin: 0;
    }
</style>
