<script lang="ts">
    import { PiLogger, type SelectOption } from "@projectit/core";
    import { createEventDispatcher } from "svelte";
    import { selectedOptionId } from "./DropdownStore";

    const LOGGER: PiLogger = new PiLogger("DropdownItemComponent").mute();
    const dispatcher = createEventDispatcher();

    export let option: SelectOption;

    let isSelected: boolean = option.id === $selectedOptionId;

    let id: string = `dropdown-item-${option.label}-${option.id}`;

    const onClick = (e: MouseEvent): void => {
        $selectedOptionId = option.id;
        LOGGER.log("CLICKED, option " + option.id + ", currentSelection: " + $selectedOptionId);
        e.stopPropagation();
        dispatcher("piItemSelected", option);
    };
</script>

<div class={"dropdownitem"}
     class:isSelected={$selectedOptionId === option.id}
     on:click={onClick}
     tabIndex={0}
     id="{id}"
>
    {option.label}
</div>

<style>
    .dropdownitem {
        color: var(--freon-dropdownitem-component-color, darkblue);
        background-color: var(--freon-dropdownitem-component-background-color, inherit);
        display: block;
        white-space: nowrap;
        border:none;
    }
    .isSelected {
        color: var(--freon-dropdownitem-component-selected-color, darkblue);
        background-color: var(--freon-dropdownitem-component-selected-background-color, lightblue);
        border: none;
    }
    .dropdownitem:hover {
        color: var(--freon-dropdownitem-component-hover-color, darkblue);
        background-color: var(--freon-dropdownitem-component-hover-background-color, white);
    /*  TODO question: are changes correct? */
    }


</style>
