<script>
    import { createEventDispatcher } from "svelte";

    const KEY_BACKSPACE = "Backspace";
    const KEY_TAB = "Tab";
    const KEY_ENTER = "Enter";
    const KEY_SHIFT = "Shift";
    const KEY_CONTROL = "Control";
    const KEY_ALT = "Alt";
    const KEY_ESCAPE = "Escape";
    const KEY_SPACEBAR = " ";
    const KEY_ARROW_LEFT = "ArrowLeft";
    const KEY_ARROW_UP = "ArrowUp";
    const KEY_ARROW_RIGHT = "ArrowRight";
    const KEY_ARROW_DOWN = "ArrowDown";
    const KEY_DELETE = "Delete";
    const KEY_INSERT = "Insert";

    export let selectedId = '';
    export let options = [];
    let id = 'dropdown-test';
    const dispatcher = createEventDispatcher();

    $: isSelected = (option) => { // determines the style of the selected option
        if (options.length === 1) return true;
        return option.id === selectedId;
    }

    const handleClick = (option) => {
        selectedId = option.id;
        console.log("Dropdown CLICKED, option " + option.id);
        dispatcher("piItemSelected", option);
    };
</script>

<div class="dropdown"
     id="{id}"
>
    <div class="popupWrapper">
        {#if options.length > 0 }
            {#each options as option (option.id + option.label)}
                <div class="dropdownitem"
                     class:isSelected={isSelected(option)}
                     on:click={() => (handleClick(option))}
                >
                    {option.label}
                </div>
            {/each}
        {:else}
            <div class="dropdownerror">
                invalid input!
            </div>
        {/if}
    </div>
</div>


<style>
    .dropdown {
        position: relative;
    }

    .popupWrapper {
        position: absolute;
        border: 1px solid var(--freon-dropdown-component-border-color, darkblue);
        box-shadow: var(--freon-popup-box-shadow, 0 0 6px 0 rgba(0, 0, 0, 0.5));
        border-radius: 2px;
        top: 10px;
        left: -1px;
        opacity: 1;
        z-index: 95;
    }

    .dropdownitem {
        color: var(--freon-dropdownitem-component-color, darkblue);
        background-color: var(--freon-dropdownitem-component-background-color, inherit);
        display: block;
        white-space: nowrap;
        border: none;
    }

    .dropdownerror {
        color: var(--freon-dropdownitem-component-color, darkblue);
        background-color: var(--freon-dropdownitem-component-background-color, red);
        display: block;
        white-space: nowrap;
        border: none;
    }

    .dropdownitem:hover {
        color: var(--freon-dropdownitem-component-hover-color, darkblue);
        background-color: var(--freon-dropdownitem-component-hover-background-color, yellow);
    }

    .isSelected {
        color: var(--freon-dropdownitem-component-selected-color, darkblue);
        background-color: var(--freon-dropdownitem-component-selected-background-color, lightblue);
        border: none;
    }
</style>
