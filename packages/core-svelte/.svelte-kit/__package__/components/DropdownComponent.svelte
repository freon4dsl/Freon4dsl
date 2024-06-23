<script>import { createEventDispatcher } from "svelte";
import { FreLogger } from "@freon4dsl/core";
export let selectedId = "";
export let options = [];
let id = "dropdown";
const dispatcher = createEventDispatcher();
const LOGGER = new FreLogger("DropdownComponent");
$: isSelected = (option) => {
  if (options.length === 1) {
    return true;
  }
  return option.id === selectedId;
};
const handleClick = (option) => {
  LOGGER.log("handleClick");
  selectedId = option.id;
  dispatcher("freItemSelected", option);
};
</script>

<nav class="dropdown"
     id="{id}"
>
    {#if options.length > 0 }
        {#each options as option (option.id + option.label)}
            <div class="dropdownitem"
                 class:isSelected={isSelected(option)}
                 on:click={(event) => {event.preventDefault(); event.stopPropagation(); handleClick(option); }}
            >
                {option.label}
            </div>
        {/each}
    {:else}
        <div class="dropdownerror">
            Invalid input!
        </div>
    {/if}
</nav>


<style>
    .dropdown {
        border: 1px solid var(--freon-dropdown-component-border-color, darkblue);
        box-shadow: var(--freon-popup-box-shadow, 0 0 6px 0 rgba(0, 0, 0, 0.5));
        border-radius: 2px;
        opacity: 1;
        z-index: 95;
        display: flex;
        flex-direction: column;
        gap: 2px;
        background: #e5e5e5;
        min-width: 120px;
        width: fit-content;
        margin-top: 3px;
        position: absolute;
    }

    .dropdownitem {
        color: var(--freon-dropdownitem-component-color, darkblue);
        background-color: var(--freon-dropdownitem-component-background-color, inherit);
        white-space: nowrap;
        border: none;
        background: none;
        border-radius: 2px;
        padding: 4px;
        margin: 3px;
        cursor: pointer;
        text-align: left;
        display: flex;
        justify-content: space-between;
        gap: 2px;
        place-items: center;
    }

    .dropdownerror {
        color: var(--freon-dropdownitem-component-color, darkblue);
        background-color: var(--freon-dropdownitem-component-error-bg-color, red);
        display: block;
        white-space: nowrap;
        border: none;
    }

    .dropdownitem:hover {
        color: var(--freon-dropdownitem-component-hover-color, darkblue);
        background-color: var(--freon-dropdownitem-component-hover-background-color, #f4f4f4);
    }

    .isSelected {
        color: var(--freon-dropdownitem-component-selected-color, darkblue);
        background-color: var(--freon-dropdownitem-component-selected-background-color, lightblue);
        border: none;
    }
</style>
