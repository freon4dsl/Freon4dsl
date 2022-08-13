<script>
    import clickOutside from './clickOutside'

    export let items = []

    let open = false
    let top = 0, left = 0

    export function show(event) {
        event.preventDefault()
        open = true
        top = event.pageY
        left = event.pageX
    }

    export function hide() {
        open = false
    }
</script>

<nav class="contextmenu"
     style="display: {open ? 'flex' : 'none'}; top: {top}px; left: {left}px"
     on:click={hide}
     use:clickOutside
     on:clickOutside={hide}>
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

<style>
    .contextmenu {
        display: none;
        flex-direction: column;
        border: solid 1px #c5c5c5;
        border-radius: 3px;
        gap: 5px;
        position: absolute;
        background: #e5e5e5;
        min-width: 120px;
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
