<script lang="ts">
    import { AUTO_LOGGER, ChangeNotifier, FOCUS_LOGGER } from "./ChangeNotifier";
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
    // Needed to know when the dropdownlist has changed
    // export let notifier: ChangeNotifier;

    const LOGGER = new PiLogger("DropdownComponent");
    const dispatcher = createEventDispatcher();

    const getOptionsLogged = (): SelectOption[] => {
        const options = getOptions();
        // check for duplicate keys and give a usefull error
        const alreadySeen: string[] = [];
        options.forEach(o => {
            const key = o.id + o.label;
            if (alreadySeen.includes(key)) {
                console.error("Dropdowncomponent duplicate key for option [" + JSON.stringify(o) + "]");
            } else {
                alreadySeen.push(key);
            }
        });
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

    let getOptionsForHtml : SelectOption[];
    autorun(()=> {
        AUTO_LOGGER.log("autorun");
        // const dummy = notifier.dummy;
        getOptionsForHtml = getOptionsLogged();
    });

    const onFocus = (e: FocusEvent) =>  {
        FOCUS_LOGGER.log("DropdownComponent.onFocus")
    };
    const onBlur = (e: FocusEvent) => {
        FOCUS_LOGGER.log("DropdownComponent.onBlur")
    }
</script>

<div class="dropdown"
        on:focus={onFocus}
        on:blur={onBlur}
>
    <div tabIndex={0}  />
    <div class="popupWrapper">
        {#each getOptionsForHtml as option (option.id + option.label)}
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
        background: var(--theme-colors-bg_dropdown_component);
    }

    .popupWrapper {
        position: absolute;
        border: 1px solid var(--theme-colors-border_dropdown_component);
        box-shadow: var(--pi-popup-box-shadow);
        border-radius: 2px;
        top: 10px;
        left: -1px;
        z-index: 95;
    }
</style>
