<script lang="ts">
    import { ChangeNotifier } from "./ChangeNotifier";
    import { clickOutside } from "./clickOutside"
    import { autorun } from "mobx";
    import { createEventDispatcher } from "svelte";
    import {
        findOption, PiLogger,
        KEY_ESCAPE, KEY_ARROW_DOWN, KEY_ARROW_UP, KEY_DELETE, KEY_ENTER
    } from "@projectit/core";
    import DropdownItemComponent from "./DropdownItemComponent.svelte";
    import type { SelectOption } from "@projectit/core";

    export let getOptions: () => SelectOption[];
    export let selectedOptionId: string = "1";
    export let open: boolean;
    export let handleSelectedOption: (option: SelectOption) => void;
    export let notifier;

    const LOGGER = new PiLogger("DropdownComponent");
    const dispatcher = createEventDispatcher();

    const getOptionsLogged = (): SelectOption[] => {
        const options = getOptions();
        LOGGER.log("getOptions size "+ options.length);
        options.forEach(o => LOGGER.log("     Option ["+ o.id + "]"));
        return options;//.filter((item, pos, self) => self.findIndex(v => v.id === item.id) === pos);
    }

    /** Supports Arrow up and down keys, Enter for selection
     * Escape is forwarded to owning component, so it may use it to close the dropdown.
     * NB: Called by owning component to forward key event !!
     */
    export const handleKeyDown = (e: KeyboardEvent): boolean => {
        const options = getOptions();
        const index = options.findIndex(o => o.id === selectedOptionId);
        LOGGER.log("handleKeyDown " + e.key + " index="+ index);
        switch (e.key) {
            case KEY_ARROW_DOWN:
                if (index + 1 < options.length) {
                    setSelectedOption(options[index + 1].id);
                }
                return true;
            case KEY_ARROW_UP:
                if (index > 0) {
                    setSelectedOption(options[index - 1].id);
                }
                return true;
            case KEY_ENTER:
                if (index >= 0 && index < options.length) {
                    dispatcher("pi-ItemSelected", options[index]);
                    return true;
                } else {
                    return false;
                }
            case KEY_DELETE:
                return true;
            case KEY_ESCAPE:
                return true;
        }
        return false;
    };

    const setSelectedOption = (index: string): void => {
        LOGGER.log("set selected option to "+ index);
        selectedOptionId = index;
    }

    const handleClickOutside = (event): void => {
        // TODO Inform parent AliasComponent
        open = false;
    }

    let getOptionsForHtml : SelectOption[];
    autorun(()=> {
        const dummy = notifier.dummy;
        getOptionsForHtml = getOptionsLogged();
        LOGGER.log("AUTORUN " + getOptionsForHtml.map(o => o.id) );
        getOptionsLogged().forEach( option => LOGGER.log("OPTION "+ option.label));
    });

</script>

<div class="dropdown">
    <div tabIndex={0}  />
    <div class="popupWrapper" use:clickOutside on:click_outside={handleClickOutside}>
        {#each getOptionsForHtml as option (option.id)}
            <div class="popup">
                <div>
                    <DropdownItemComponent on:pi-ItemSelected option={option} isSelected={option.id === selectedOptionId} />
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    .dropdown {
        position: relative;
    }

    .popup {
        position: relative;
        min-width: 60px;
        overflow-y: auto;
        overflow-x: auto;
        padding: 4px;

        z-index: 99;
        background: var(--pi-popup-background);
        border: 1px solid var(--pi-popup-border);
        box-shadow: var(--pi-popup-box-shadow);
        border-radius: 2px;
    }

    .popupWrapper {
        position: absolute;
        top: 10px;
        left: -1px;
    }
</style>
