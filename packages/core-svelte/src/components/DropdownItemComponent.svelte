<script lang="ts">
    import { PiLogger } from "@projectit/core";
    import { autorun } from "mobx";
    import { createEventDispatcher } from "svelte";
    import type { SelectOption } from "@projectit/core";

    const dispatcher = createEventDispatcher();
    export const ARROW_UP = 38;
    export const ARROW_RIGHT = 39;
    export const ARROW_DOWN = 40;

    const LOGGER: PiLogger = new PiLogger("DropdownItemComponent");
    const onMouseDown = () => {};
    /** Supports Arrow up and down keys, Enter for selection
     * Escape is forwarded to owning component, so it may use it to close the dropdown.
     *
     * NB: Called by owning component to forward key event !!
     * @param {React.KeyboardEvent<any>} e
     * @returns {boolean}
     */
   const  handleKeyDown = (event: KeyboardEvent): void => {
        // const index = options.findIndex(o => o.id === this.props.selectedOptionId);
        switch (event.keyCode) {
        }
    }

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
