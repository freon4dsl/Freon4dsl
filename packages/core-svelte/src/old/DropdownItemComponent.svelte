<script lang="ts">
    import { PiLogger, type SelectOption } from "@projectit/core";
    import { createEventDispatcher } from "svelte";

    const LOGGER: PiLogger = new PiLogger("DropdownItemComponent").mute();
    const dispatcher = createEventDispatcher();

    export let isSelected: boolean = false;
    export let option: SelectOption;

    let label: string = option.label;
    // TODO add id
    // let id: string = `${box.element.piId()}-${box.role}`;

    const onClick = (e: MouseEvent): void => {
        LOGGER.log("CLICKED, option " + option.id);
        e.stopPropagation();
        dispatcher("pi-ItemSelected",option );
    };
</script>

<div class={"dropdownitem"}
     class:isSelected
     on:click={onClick}
     tabIndex={0}
>
    {label}
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
        border: none;
        color: var(--freon-dropdownitem-component-selected-color, darkblue);
        background-color: var(--freon-dropdownitem-component-selected-background-color, lightblue);
    }
    .dropdownitem:hover {
        display: block;
        background-color: var(--freon-dropdownitem-component-hover-color, darkblue);
        background-color: var(--freon-dropdownitem-component-hover-background-color, white);
        white-space: nowrap;
        color: blue;
    }


</style>
