<!-- This component does all the screen handling for both an Alias and a Select Component.
-->
<script lang="ts">
    import {
        BehaviorExecutionResult,
        AbstractChoiceBox,
        EVENT_LOG,
        executeBehavior,
        isAliasBox,
        isMetaKey,
        isPrintable,
        PiEditor,
        PiLogger,
        PiUtils,
        toPiKey,
        isSelectBox,
        findOption,
        KEY_ENTER,
        KEY_TAB,
        KEY_ARROW_DOWN,
        KEY_ARROW_UP,
        KEY_SPACEBAR, KEY_ESCAPE, KEY_DELETE, KEY_ARROW_LEFT, KEY_BACKSPACE, KEY_ARROW_RIGHT
    } from "@projectit/core";
    import type { SelectOption } from "@projectit/core";
    import { action, autorun } from "mobx";
    import { clickOutside } from "./clickOutside";
    import { afterUpdate, onMount } from "svelte";
    import { writable } from 'svelte/store';
    import type  { Writable } from 'svelte/store';
    import { SelectOptionList } from "./SelectableOptionList";
    import { AUTO_LOGGER, ChangeNotifier, FOCUS_LOGGER, MOUNT_LOGGER, UPDATE_LOGGER } from "./ChangeNotifier";
    import SelectableComponent from "./SelectableComponent.svelte";
    import TextComponent from "./TextComponent.svelte";

    export let choiceBox: AbstractChoiceBox;
    export let editor: PiEditor;

    let openStore: Writable<boolean> = writable<boolean>(false);
    let LOGGER = new PiLogger("ChoiceComponent");
    let textComponent: TextComponent;
    let selectedOption: SelectOption;
    let selectableOptionList = new SelectOptionList(editor);

    function setOpen(msg: string, value: boolean) {
        // LOGGER.log("SET OPEN " + choiceBox?.role + " from " + $openStore + " to " + value + " in " + msg );
        $openStore = value;
    }

    const getChoiceOptions = (): SelectOption[] => {
        return selectableOptionList.getFilteredOptions();
        // return listForDropdown;
    };

    const setFocus = async (): Promise<void> => {
        LOGGER.log("ChoiceComponent set focus " + choiceBox.role);
        if( !!textComponent) {
            textComponent.setFocus();
        } else {
            LOGGER.log("?ERROR? textComponent is null in setFocus.")
        }
    };

    /**
     * Trigger a key event for `key`.
     * @param {string} key
     * @returns {Promise<void>}
     */
    const triggerKeyPressEvent = async (key: string) => {
        LOGGER.info(this, "triggerKeyPressEvent " + key);
        const aliasResult = await handleStringInput(key);
        if (aliasResult !== BehaviorExecutionResult.EXECUTED) {
            if (!!textComponent && !!textComponent.element) {
                textComponent.element.innerText = key;
            }
        }
    };

    const handleStringInput = async (value: string) => {
        LOGGER.info(this, "handleStringInput for box " + choiceBox.role);
        const aliasResult = executeBehavior(choiceBox, value, value, editor);
        switch (aliasResult) {
            case BehaviorExecutionResult.EXECUTED:
                LOGGER.log("ALIAS MATCH");
                choiceBox.textBox.setText(value);
                // if (!!textComponent) {
                //     textComponent.textOnScreen = value; // choiceBox.getSelectedOption().label;
                // }
                choiceBox.textBox.setText(value);
                setOpen("onInput alias executed", false);
                // this.hasError = false;
                break;
            case BehaviorExecutionResult.PARTIAL_MATCH:
                LOGGER.log("PARTIAL_MATCH");
                // this.hasError = false;
                choiceBox.textBox.setText(value);
                selectableOptionList.text = value;
                notifier.notifyChange()
                setOpen("onInput alias partial match", true);
                break;
            case BehaviorExecutionResult.NO_MATCH:
                LOGGER.log("NO MATCH");
                selectableOptionList.text = value;
                notifier.notifyChange();
                // this.hasError = true;
                // this.dropdownIsOpen = true;
                break;
        }
        return aliasResult;
    };

    onMount( () => {
        MOUNT_LOGGER.log("onMount for role [" + choiceBox.role + "] with textComponent " + textComponent);
        choiceBox.textBox.setFocus = setFocus;
        choiceBox.setFocus = setFocus;
        const selected = choiceBox.getSelectedOption();
        if( !! selected) {
            LOGGER.log("Set text of choicebox to " + selected.label);
            choiceBox.textBox.setText(selected.label)
        }
    });

    afterUpdate( () => {
        UPDATE_LOGGER.log("AfterUpdate")
        choiceBox.triggerKeyPressEvent = triggerKeyPressEvent;
        choiceBox.textBox.setFocus = setFocus;
        choiceBox.setFocus = setFocus;
        const selected = choiceBox.getSelectedOption();
        if( !! selected && !!selected.label) {
            choiceBox.textBox.setText(selected.label)
        }
        UPDATE_LOGGER.log("afterupdate ==> selectedBox " + !!editor.selectedBox + " choiceBox " + !!choiceBox + " choiceBox.textbox " + !!choiceBox.textBox);
    })

    const onKeyPress = async (e: KeyboardEvent) => {
        EVENT_LOG.log("onKeyPress: " + e.key + " for role " + choiceBox.role);
        if (isPrintable(e) && !e.ctrlKey) {
            EVENT_LOG.log("Press: is printable, text is now [" + choiceBox.textBox.getText() + "]");
        }
    };

    const onInput = (e: InputEvent) => {
        const value = (e.target as HTMLElement).innerText;
        LOGGER.log("onInput: [" + value + "] for role " + choiceBox.role + " with text ["+ choiceBox.textBox.getText() + "]");
        return handleStringInput(value);
    };

    const onKeyDown = async (e: KeyboardEvent) => {
        LOGGER.log("onKeyDown: " + e.key + " for role " + choiceBox.role);
        if (isPrintable(e) && !e.ctrlKey) {
            LOGGER.log("Down: is printable, text is now [" + choiceBox.textBox.getText() + "]");
            setOpen("onKeyDown", true);
            e.stopPropagation();
            return;
        }
        if (e.key === KEY_DELETE) {
            e.stopPropagation();
        }
        if( e.key === KEY_TAB){
            setOpen("TAB", false);
            return;
        }
        if (!shouldPropagate(e)) {
            LOGGER.log("Stop propagation")
            e.stopPropagation();
        }
        if( (e.key === KEY_SPACEBAR && e.ctrlKey) || (e.key === KEY_ESCAPE)) {
            setOpen("cltr-space or esacape", !$openStore);
            return;
        }
        if ($openStore ) {
            if (handleArrowKeys(e)) {
                e.preventDefault();
                e.stopPropagation();
            }
        } else {
            switch (e.key) {
                case KEY_ENTER:
                    e.preventDefault();
                    if (isAliasBox(choiceBox)) {
                        await PiUtils.handleKeyboardShortcut(toPiKey(e), choiceBox, editor);
                        e.stopPropagation();
                    }
                    break;
            }
        }
    };

    const shouldPropagate = (e: KeyboardEvent): boolean => {
        if (isMetaKey(e)) {
            if (e.key === KEY_ARROW_UP || e.key === KEY_ARROW_DOWN || e.key === KEY_TAB) {
                return true;
            }
        }
        if (e.key === KEY_ENTER || e.key === KEY_TAB) {
            return true;
        }
        if (e.key === KEY_ARROW_UP || e.key === KEY_ARROW_DOWN) {
            return true;
        }
        // Is at the end or start of the text field, so let's propagate to ProjectItComponent
        if (e.key === KEY_ARROW_LEFT || e.key === KEY_BACKSPACE || e.key === KEY_ARROW_RIGHT || e.key === KEY_DELETE) {
            setOpen("Leaving left or right", false);
            return true;
        } else {
            return false;
        }
        return false;
    };

    const selectOption = action ( async (option: SelectOption) => {
        LOGGER.log("selectOption ==> EXECUTING ALIAS " + option.label)
        await choiceBox.selectOption(editor, option);
        let selected = choiceBox.getSelectedOption();
        LOGGER.log("selectOption: setting textHelper to [" + JSON.stringify(selected) + "]")
        // choiceBox.textHelper.setText(!!selected ? selected.label : "????");
        // choiceBox.textBox.setText(!!selected ? selected.label : "????");
        setOpen("selectOption", false);
    });

    const onClick = (e: MouseEvent) => {
        LOGGER.log("onClick before open is " + $openStore);
        setOpen("onClick", !$openStore);
        LOGGER.log("onClick after, open is " + $openStore);
    }

    const handleArrowKeys = (e: KeyboardEvent): boolean => {
        const options = getChoiceOptions();
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
                    selectOption( options[index]);
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

    let listForDropdown: SelectOption[] = [];
    let notifier = new ChangeNotifier();

    const handleClickOutside = (event): void => {
        setOpen("clickOutside", false);
    }

    const onFocusHandler = (e: FocusEvent) => {
        FOCUS_LOGGER.log("ChoiceComponent.onFocus for box " + choiceBox.role);
        const options = choiceBox.getOptions(editor);
        selectableOptionList.replaceOptions(options)
    }

    const onBlurHandler = (e: FocusEvent) => {
        FOCUS_LOGGER.log("ChoiceComponent.onBlur for box " + choiceBox.role );
        // setOpen("onBlurHandler", false);
    }

    const onBlurHandler2 = (e: FocusEvent) => {
        FOCUS_LOGGER.log("ChoiceComponent.onBlur2 for box " + choiceBox.role);
        // setOpen("onBlurHandler", false);
    }


    const onClickItem = (m: MouseEvent, o : SelectOption) => {
        LOGGER.log("onClickItem " + JSON.stringify(o));
        selectOption(o);
        setOpen("onClickItem", false);
        m.stopPropagation();
    }

    let selectedOptionId: string = "1";
    function setSelectedOption (index: string): void  {
        // LOGGER.log("set selected option to "+ index);
        selectedOptionId = index;
    }

    let isSelected = (option: SelectOption, s: string): string => {
        // console.log("isSelected " + JSON.stringify(option));
        if (option.id === selectedOptionId) {
            return "isSelected";
        } else {
            return "isNotSelected";
        }
    };
    const dropdownitem ="dropdownitem";

    autorun( ()=> {
        // console.log("AUTORUN CHOICE COMPONENT " + $openStore);
        // if ($openStore) {
        listForDropdown = selectableOptionList.getFilteredOptions();
        // }
        selectedOption = choiceBox.getSelectedOption();
        // LOGGER.log("AUTORUN ChoiceComponent role " + choiceBox.role + " selectOption: " + selectedOption + " label " + selectedOption?.label + "  id "+ selectedOption?.id);
        if( !!selectedOption) {
            choiceBox.textBox.setText(selectedOption.label);
        }
        const dummy = choiceBox.textHelper.getText();
    });

</script>

<div on:keydown={onKeyDown}
     on:keypress={onKeyPress}
     on:input={onInput}
     on:focus={onFocusHandler}
     on:blur={onBlurHandler}
     on:focusin={onFocusHandler}
     on:focusout={onBlurHandler2}
     on:click={onClick}
     use:clickOutside on:click_outside={handleClickOutside}
>
    <SelectableComponent box={choiceBox.textBox} editor={editor}>
        <TextComponent
            editor={editor}
            textBox={choiceBox.textBox}
            bind:this={textComponent}
        />
    </SelectableComponent>
    {#if $openStore}
        <div class="dropdown">
            <div tabIndex={0}  />
            <div class="popupWrapper">
                {#each listForDropdown as option (option.id + option.label)}
                    <div class="popup">
                        <div
                             class={isSelected(option, selectedOptionId)}
                             class:dropdownitem
                             on:click={(m) => onClickItem(m, option)}
                        >
                            {option.label}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
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
        opacity: 1.0;

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
        opacity: 1.0;
        z-index: 95;
    }
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
    .isNotSelected {
        border: none;
    }
    .dropdownitem:hover {
        display: block;
        white-space: nowrap;
        color: blue;
    }


</style>
