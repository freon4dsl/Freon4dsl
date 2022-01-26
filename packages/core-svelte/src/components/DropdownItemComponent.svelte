<script lang="ts">
    import { PiLogger, type SelectOption } from "@projectit/core";
    import { createEventDispatcher } from "svelte";

    const LOGGER: PiLogger = new PiLogger("DropdownItemComponent");
    const dispatcher = createEventDispatcher();

    export let isSelected: boolean = false;
    export let option: SelectOption;

    let label: string = option.label;

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
        color: var(--theme-colors-color_dropdownitem_component);
        display: block;
        white-space: nowrap;
        border:none;
    }
    .isSelected {
        border: none;
        background-color: lightblue;
    }
    .dropdownitem:hover {
        display: block;
        white-space: nowrap;
         color: blue;
    }


</style>
