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
    import DropdownComponent from "./DropdownComponent.svelte";

    export let choiceBox: AbstractChoiceBox;
    export let editor: PiEditor;

    let openStore: Writable<boolean> = writable<boolean>(false);

    function setOpen(msg: string, value: boolean) {
        // LOGGER.log("SET OPEN " + choiceBox?.role + " from " + $openStore + " to " + value + " in " + msg );
        $openStore = value;
    }
    let LOGGER = new PiLogger("AliasComponent");
    let dropdownComponent: DropdownComponent;
    let textComponent: TextComponent;
    let selectedOption: SelectOption;

    let selectableOptionList = new SelectOptionList(editor)

    const getAliasOptions = (): SelectOption[] => {
        return selectableOptionList.getFilteredOptions();
        // return listForDropdown;
    };

    const setFocus = async (): Promise<void> => {
        LOGGER.log("AliasComponent set focus " + choiceBox.role);
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
            if (!!textComponent) {
                textComponent.element.innerText = key;
            }
        }
    };

    const handleStringInput = async (s: string) => {
        LOGGER.info(this, "handleStringInput for box " + choiceBox.role);
        const aliasResult = await executeBehavior(choiceBox, s, null, editor);
        switch (aliasResult) {
            case BehaviorExecutionResult.EXECUTED:
                if (!!textComponent) {
                    textComponent.element.innerText = "";
                }
                setOpen("handleStringInput Alias executed", false);
                // this.hasError = false;
                break;
            case BehaviorExecutionResult.PARTIAL_MATCH:
                LOGGER.info(this, "PARTIAL_MATCH");
                // this.hasError = false;
                break;
            case BehaviorExecutionResult.NO_MATCH:
                LOGGER.info(this, "NO MATCH");
                // this.hasError = true;
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
            choiceBox.textBox.setText(selected.label)
        }
    });

    afterUpdate( () => {
        UPDATE_LOGGER.log("AfterUpdate")
        choiceBox.triggerKeyPressEvent = triggerKeyPressEvent;
        choiceBox.textBox.setFocus = setFocus;
        choiceBox.setFocus = setFocus;
        const selected = choiceBox.getSelectedOption();
        if( !! selected) {
            choiceBox.textBox.setText(selected.label)
        }
        UPDATE_LOGGER.log("afterupdate ==> selectedBox " + !!editor.selectedBox + " choiceBox " + !!choiceBox + " choiceBox.textbox " + !!choiceBox.textBox);
    })

    const onKeyPress = async (e: KeyboardEvent) => {
        EVENT_LOG.log("onKeyPress: " + e.key + " for role " + choiceBox.role);
        if (isPrintable(e) && !e.ctrlKey) {
            EVENT_LOG.log("Press: is printable, text is now [" + textComponent.getText() + "]");
        }
    };

    const onInput = async (e: InputEvent) => {
        const value = (e.target as HTMLElement).innerText;
        LOGGER.log("onInput: [" + value + "] for role " + choiceBox.role + " with text ["+ textComponent.getText() + "]");
        let aliasResult = undefined;
        if( isAliasBox(choiceBox)) {
            aliasResult = await choiceBox.selectOption(editor, { id: value, label: value });
        } else if( isSelectBox(choiceBox)) {
            const selected: SelectOption = findOption( choiceBox.getOptions(editor), value);
            if( selected !== null ){
                aliasResult = await choiceBox.selectOption(editor, { id: value, label: value });
            } else {
                aliasResult = BehaviorExecutionResult.NO_MATCH;
            }
        } else {
          return BehaviorExecutionResult.NO_MATCH;
        }
        LOGGER.log("onInput aliasResult: [" + aliasResult + "]");
        switch (aliasResult) {
            case BehaviorExecutionResult.EXECUTED:
                LOGGER.log("ALIAS MATCH");
                if( !!textComponent) {
                    textComponent.textOnScreen = value; // choiceBox.getSelectedOption().label;
                }
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

    const onKeyDown = async (e: KeyboardEvent) => {
        LOGGER.log("onKeyDown: " + e.key + " for role " + choiceBox.role);
        if (isPrintable(e) && !e.ctrlKey) {
            LOGGER.log("Down: is printable, text is now [" + textComponent.getText() + "]");
            setOpen("onKeyDown", true);
            if(dropdownComponent !== null && dropdownComponent !== undefined) {
                dropdownComponent.handleKeyDown(e);
            }
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
        if (e.key === KEY_ARROW_LEFT || e.key === KEY_ARROW_RIGHT) {
            // const caretPosition = textComponent.getCaretPosition();
            // if (caretPosition <= 0 || caretPosition >= textComponent.element.innerText.length ) {
                // Handle in ProjectItComponent
                setOpen("arraow at the edges", false);
            // }
        }
        if (!shouldPropagate(e)) {
            e.stopPropagation();
        }
        if( (e.key === KEY_SPACEBAR && e.ctrlKey) || (e.key === KEY_ESCAPE)) {
            setOpen("cltr-space or esacape", !$openStore);
            return;
        }
        if ($openStore ) { // && this.dropdownComponent) {
            // Propagate key event to dropdown component
            LOGGER.log("Forwarding event to dropdown component");
            if( dropdownComponent !== null && dropdownComponent !== undefined){
                const x = dropdownComponent.handleKeyDown(e);
                LOGGER.log("      handled result: " + x);
            } else {
                console.error("AliasComponent.onKeyDown: DROPDOWN UNDEFINED ope "+ $openStore );
            }

            e.preventDefault();
            e.stopPropagation();
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
        // TODO
        // const caretPosition = textComponent.getCaretPosition();
        if (e.key === KEY_ARROW_LEFT || e.key === KEY_BACKSPACE) {
            return true;//caretPosition <= 0;
        } else if (e.key === KEY_ARROW_RIGHT || e.key === KEY_DELETE) {
            return true;
            // const length: number = textComponent?.element?.innerText?.length;
            // return (!!length ? caretPosition >= length : true);
        } else {
            return false;
        }
        return false;
    };

    const selectedEvent = (event: CustomEvent<SelectOption>): void => {
        LOGGER.log("set selected SVELTE option to "+ event.detail.id );
        selectOption(event.detail);
        if (isSelectBox(choiceBox)) {
            if (!!textComponent) {
                textComponent.textOnScreen = choiceBox.getSelectedOption().label;
            }
        }
    }

    const selectOption = action ( async (option: SelectOption) => {
        LOGGER.log("==> EXECUTING ALIAS " + option.label)
        await choiceBox.selectOption(editor, option);
        let selected = choiceBox.getSelectedOption();
        choiceBox.textHelper.setText((!!selected ? selected.label : ""));
        setOpen("selectOption", false);
    });

    const onClick = (e: MouseEvent) => {
        LOGGER.log("onClick before open is " + $openStore);
        // const opts: SelectOption[] = choiceBox.getOptions(editor);
        // LOGGER.log("   options are " + opts.length + " ==> " + opts.map(o => o.id))
        // selectableOptionList.replaceOptions(opts)
        setOpen("onClick", !$openStore);
        LOGGER.log("onClick after, open is " + $openStore);
    }

    let listForDropdown: SelectOption[];
    let notifier = new ChangeNotifier();

    // selectableOptionList.replaceOptions(choiceBox.getOptions(editor))
    autorun( ()=> {
        if ($openStore) {
            listForDropdown = selectableOptionList.getFilteredOptions();
        }
        selectedOption = choiceBox.getSelectedOption();
        AUTO_LOGGER.log("AliasComponent role " + choiceBox.role + " selectOption: " + selectedOption + " label " + selectedOption?.label + "  id "+ selectedOption?.id);
        if( !!selectedOption) {
            choiceBox.textBox.setText(selectedOption.label);
        }
    });

    const handleClickOutside = (event): void => {
        setOpen("clickOutside", false);
    }

    const onFocusHandler = (e: FocusEvent) => {
        FOCUS_LOGGER.log("AliasComponent.onFocus for box " + choiceBox.role);
        const options = choiceBox.getOptions(editor);
        selectableOptionList.replaceOptions(options)
    }

    const onBlurHandler = (e: FocusEvent) => {
        FOCUS_LOGGER.log("AliasComponent.onBlur for box " + choiceBox.role);
    }
</script>

<div on:keydown={onKeyDown}
     on:keypress={onKeyPress}
     on:input={onInput}
     on:focus={onFocusHandler}
     on:blur={onBlurHandler}
     on:focusin={onFocusHandler}
     on:focusout={onBlurHandler}
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
        <DropdownComponent
                bind:this="{dropdownComponent}"
                handleSelectedOption={selectOption}
                on:pi-ItemSelected={selectedEvent}
                getOptions={getAliasOptions}
                selectedOptionId="2"
                notifier={notifier}
        />
    {/if}

</div>
