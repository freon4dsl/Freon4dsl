<script lang="ts">
    import { clickOutside } from "./clickOutside"
    import { autorun } from "mobx";
    import { createEventDispatcher } from "svelte";
    import { findOption } from "@projectit/core";
    import DropdownItemComponent from "./DropdownItemComponent.svelte";
    import type { SelectOption } from "@projectit/core";
    import {
        ARROW_LEFT,
        ARROW_DOWN,
        ARROW_UP,
        ARROW_RIGHT,
        ENTER,
        DELETE,
        ESCAPE,
        PiLogger
    } from "@projectit/core";

    export let getOptions: () => SelectOption[];
    export let selectedOptionId: string = "1";
    export let open: boolean;
    export let handleSelectedOption: (option: SelectOption) => void;

    const LOGGER = new PiLogger("DropdownComponent");

    const getOptionsLogged = (): SelectOption[] => {
        const options = getOptions();
        LOGGER.log("getOptions");
        options.forEach(o => LOGGER.log("     Option ["+ o.id + "]"));
        return options.filter((item, pos, self) => self.findIndex(v => v.id === item.id) === pos);
    }
    /** Supports Arrow up and down keys, Enter for selection
     * Escape is forwarded to owning component, so it may use it to close the dropdown.
     *
     * NB: Called by owning component to forward key event !!
     */
    export const onKeydown = (event: KeyboardEvent): void => {
        LOGGER.log("onKeydown: "+ event.key);
        let index = getOptions().findIndex(o => o.id === selectedOptionId);
        switch (event.keyCode) {
            case ARROW_DOWN: {
                index++;
                selectedOptionId = getOptions()[index].id;
                break;
            }
            case ARROW_UP: {
                index--;
                selectedOptionId = getOptions()[index].id;
                break;
            }
            case ENTER: {
                LOGGER.log("ENTER " + findOption(getOptions(), selectedOptionId).label)
                break;
            }
        }
    }

    /** Supports Arrow up and down keys, Enter for selection
     * Escape is forwarded to owning component, so it may use it to close the dropdown.
     *
     * NB: Called by owning component to forward key event !!
     */
    export const handleKeyDown = (e: KeyboardEvent): boolean => {
        const options = getOptions();
        const index = options.findIndex(o => o.id === selectedOptionId);
        LOGGER.log("handleKeyDown " + e.key + " index="+ index);
        switch (e.keyCode) {
            case ARROW_DOWN:
                if (index + 1 < options.length) {
                    setSelectedOption(options[index + 1].id);
                }
                return true;
            case ARROW_UP:
                if (index > 0) {
                    setSelectedOption(options[index - 1].id);
                }
                return true;
            case ENTER:
                if (index >= 0 && index < options.length) {
                    handleSelectedOption(options[index]);
                    // initOption();
                    return true;
                } else {
                    return false;
                }
            case DELETE:
                // handleSelectedOption(null);
                return true;
            case ESCAPE:
                // handleSelectedOption("ESCAPE");
                // initOption();
                return true;
        }
        return false;
    };

    const setSelectedOption = (index: string): void => {
        LOGGER.log("set selected option to "+ index);
        selectedOptionId = index;
    }

    const handleClickOutside = (event): void => {
        open = false;
    }

    const dispatcher = createEventDispatcher();
    const forward = (event: CustomEvent): void => {
        LOGGER.log("set selected SVELTE option to "+ event.detail.id);
        dispatcher("pi-ItemSelected", event.detail)
    }

</script>

<div class="dropdown"  on:keydown={onKeydown} >
    <div tabIndex={0}  />
    <div class="popupWrapper" use:clickOutside on:click_outside={handleClickOutside}>
        {#each getOptionsLogged() as option (option.id)}
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
