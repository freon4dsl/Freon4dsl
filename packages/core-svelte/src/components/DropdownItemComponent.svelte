<script lang="ts">
    import { PiLogger } from "@projectit/core";
    import { createEventDispatcher } from "svelte";
    import type { SelectOption } from "@projectit/core";

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
        color: black;
        display: block;
        white-space: nowrap;
    }
    .isSelected {
        background-color: lightblue;
    }
    .dropdownitem:hover {
        display: block;
        white-space: nowrap;
         color: blue;
    }


</style>
