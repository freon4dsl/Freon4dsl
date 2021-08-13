<script lang="ts">
    import {
        AliasBox, ARROW_DOWN, ARROW_UP, BehaviorExecutionResult,
        DELETE,
        AbstractChoiceBox,
        ENTER, ESCAPE,
        EVENT_LOG, executeBehavior,
        isAliasBox, isMetaKey,
        isPrintable,
        PiEditor,
        PiLogger,
        PiUtils, SPACEBAR, TAB, toPiKey, isSelectBox, findOption
    } from "@projectit/core";
    import type { SelectOption } from "@projectit/core";
    import { autorun } from "mobx";
    import { afterUpdate, onMount } from "svelte";
    import { ChangeNotifier } from "./ChangeNotifier";
    import DropdownComponent from "./DropdownComponent.svelte";
    import TextComponent from "./TextComponent.svelte";
    import { SelectOptionList } from "./SelectableOptionList";

    export let choiceBox: AbstractChoiceBox;
    export let editor: PiEditor;

    let openInHtml: boolean ;
    let open: boolean = false;
    $: openInHtml = open;
    let LOGGER = new PiLogger("AliasComponent");

    let dropdown: DropdownComponent;
    let textcomponent: TextComponent;
    let selectedOption: SelectOption;

    const selectableOptionList = new SelectOptionList(editor)

    const getAliasOptions = (): SelectOption[] => {
        return listForDropdown;
    };

    // const selected = (event: CustomEvent) => {
    //     console.log("Alias.selected " + event.detail.label);
    //     aliasBox.textBox.placeHolder = event.detail.label
    //     open = false;
    // }
    const setFocus = async (): Promise<void> => {
        LOGGER.log("AliasComponent set focus " + choiceBox.role);
        if( !!textcomponent) {
            textcomponent.focus();
        } else {
            LOGGER.log("?ERROR? textcomponent is null in setFopcus.")
        }
        // this.startEditing();
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
            if (!!textcomponent) {
                textcomponent.innerText = key;
                // this.setCaretPosition(textcomponent.innerText.length);
                // this.dropdownIsOpen = true;
            }
        }
    };

    const handleStringInput = async (s: string) => {
        LOGGER.info(this, "handleStringInput for box " + choiceBox.role);
        const aliasResult = await executeBehavior(choiceBox, s, editor);
        switch (aliasResult) {
            case BehaviorExecutionResult.EXECUTED:
                if (!!textcomponent) {
                    textcomponent.innerText = "";
                }
                open = false;
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
        LOGGER.log("onMount for role [" + choiceBox.role + "] with textcomponent " + textcomponent);
        choiceBox.textBox.setFocus = setFocus;
        choiceBox.setFocus = setFocus;
        const selected = choiceBox.getSelectedOption();
        if( !! selected) {
            choiceBox.textBox.setText(selected.label)
        }
        // textBox.setCaret = setCaret;
        // caretPosition = textBox.caretPosition;
    });

    afterUpdate( () => {
        LOGGER.log("AfterUpdate")
        choiceBox.textBox.setFocus = setFocus;
        choiceBox.setFocus = setFocus;
        const selected = choiceBox.getSelectedOption();
        if( !! selected) {
            choiceBox.textBox.setText(selected.label)
        }
        LOGGER.log("afterupdate ==> selectedBox " + !!editor.selectedBox + " choiceBox " + !!choiceBox + " choiceBox.textbox " + !!choiceBox.textBox);
        if( !!editor.selectedBox && !!choiceBox && !!choiceBox.textBox ) {
            if (editor.selectedBox.role === choiceBox.role && editor.selectedBox.element.piId() === choiceBox.element.piId()) {
                LOGGER.log("-----------------------------------------------")
                setFocus();
            }
        }
    })

    const onKeyPress = async (e: KeyboardEvent) => {
        EVENT_LOG.log("onKeyPress: " + e.key + " for role " + choiceBox.role);
        // await wait(0);

        if (isPrintable(e) && !e.ctrlKey) {
            LOGGER.log("Press: is printable, text is now [" + textcomponent.getText() + "]");
        }
    };

    const onInput = async (e: InputEvent) => {
        const value = (e.target as HTMLElement).innerText;
        LOGGER.log("onInput: [" + value + "] for role " + choiceBox.role + " with text ["+ textcomponent.getText() + "]");
        // const aliasResult = await executeBehavior(aliasBox, e.data, editor);
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
                if( !!textcomponent) {
                    textcomponent.textOnScreen = value; // choiceBox.getSelectedOption().label;
                }
                open = false;
                // this.hasError = false;
                break;
            case BehaviorExecutionResult.PARTIAL_MATCH:
                LOGGER.log("PARTIAL_MATCH");
                // this.hasError = false;
                choiceBox.textBox.setText(value);
                selectableOptionList.text = value;
                notifier.notifyChange()
                open = true;
                break;
            case BehaviorExecutionResult.NO_MATCH:
                LOGGER.log("NO MATCH");
                selectableOptionList.text = value;
                notifier.notifyChange()
                // this.hasError = true;
                // this.dropdownIsOpen = true;
                break;
        }
        return aliasResult;
    };

    const onKeyDown = async (e: KeyboardEvent) => {
        LOGGER.log("onKeyDown: " + e.key + " for role " + choiceBox.role);
        if (isPrintable(e) && !e.ctrlKey) {
            LOGGER.log("Down: is printable, text is now [" + textcomponent.getText() + "]");
            open = true;
            if(dropdown !== null && dropdown !== undefined) {
                dropdown.handleKeyDown(e);
            }
            e.stopPropagation();
            return;
        }
        if (e.keyCode === DELETE) {
            e.stopPropagation();
        }
        if( e.keyCode=== TAB){
            open = false;
            return;
        }
        if (!shouldPropagate(e)) {
            e.stopPropagation();
        }
        if( (e.keyCode === SPACEBAR && e.ctrlKey) || (e.keyCode === ESCAPE)) {
            open = !open;
            return;
        }
        if (open ) { // && this.dropdown) {
            // Propagate key event to dropdown component
            LOGGER.log("Forwarding event to dropdown component");
            if( dropdown !== null && dropdown !== undefined){
                const x = dropdown.handleKeyDown(e);
                LOGGER.log("      handled result: " + x);
            } else {
                console.error("AliasComponent.onKeyDown: DROPDOWN UDEFINED ope "+ open + " openInHtml: "+ openInHtml);
            }
            // if (x) {
            //     e.preventDefault();
            //     e.stopPropagation();
            //     this.setCaretToMostRight();
            //     this.props.box.caretPosition = this.getCaretPosition();
            //     this.caretPosition = this.props.box.caretPosition;
            //     LOGGER.info(this, "caret " + this.props.box.caretPosition);
            // }
            // switch (e.keyCode) {
            //     case ENTER:
            //         e.preventDefault();
            //         break;
            // }
            e.preventDefault();
            e.stopPropagation();
        } else {
            switch (e.keyCode) {
                case ENTER:
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
            if (e.keyCode === ARROW_UP || e.keyCode === ARROW_DOWN || e.keyCode === TAB) {
                return true;
            }
        }
        if (e.keyCode === ENTER || e.keyCode === TAB) {
            return true;
        }
        if (e.keyCode === ARROW_UP || e.keyCode === ARROW_DOWN) {
            return true;
        }
        // TODO
        // const caretPosition = this.getCaretPosition();
        // if (e.keyCode === ARROW_LEFT || e.keyCode === BACKSPACE) {
        //     return caretPosition <= 0;
        // } else if (e.keyCode === Keys.ARROW_RIGHT || e.keyCode === Keys.DELETE) {
        //     return caretPosition >= this.element.innerText.length;
        // } else {
        //     return false;
        // }
        return false;
    };

    const selectedEvent = (event: CustomEvent<SelectOption>): void => {
        LOGGER.log("set selected SVELTE option to "+ event.detail.id );
        selectOption(event.detail);
        if (isSelectBox(choiceBox)) {
            if (!!textcomponent) {
                textcomponent.textOnScreen = choiceBox.getSelectedOption().label;
            }
        }
    }

    const selectOption = async (option: SelectOption) => {
        LOGGER.log("==> EXECUTING ALIAS " + option.label)
        await choiceBox.selectOption(editor, option);
        let selected = choiceBox.getSelectedOption();
        choiceBox.textHelper.text = (!!selected ? selected.label : "");
        open=false
    }

    const onClick = (e: MouseEvent) => {
        LOGGER.log("onClick");
        open = !open;
    }

    let listForDropdown: SelectOption[];
    let notifier = new ChangeNotifier();
    choiceBox.triggerKeyPressEvent = triggerKeyPressEvent;

    selectableOptionList.replaceOptions(choiceBox.getOptions(editor))
    autorun( ()=> {
        listForDropdown = selectableOptionList.getFilteredOptions();
        selectedOption = choiceBox.getSelectedOption();
        LOGGER.log("AUTORUN role " + choiceBox.role + " selectOption: " + selectedOption + " label " + selectedOption?.label + "  id "+ selectedOption?.id);
        if( !!selectedOption) {
            choiceBox.textBox.setText(selectedOption.label);
        }
        LOGGER.log("==> selectedBox " + !!editor.selectedBox + " choiceBox " + !!choiceBox + " choiceBox.textbox " + !!choiceBox.textBox);
        if( !!editor.selectedBox && !!choiceBox && !!choiceBox.textBox ) {
            if (editor.selectedBox.role === choiceBox.role && editor.selectedBox.element.piId() === choiceBox.element.piId()) {
                LOGGER.log("==============================================")
                focus();
            }
        }

    });
</script>

<div on:keydown={onKeyDown}
     on:keypress={onKeyPress}
     on:input={onInput}
     on:click={onClick}
>
    <TextComponent
                   editor={editor}
                   textBox={choiceBox.textBox}
                   bind:this={textcomponent}
    />
    {#if openInHtml}
        <DropdownComponent
                bind:this="{dropdown}"
                bind:open={openInHtml}
                handleSelectedOption={selectOption}
                on:pi-ItemSelected={selectedEvent}
                getOptions={getAliasOptions}
                selectedOptionId="2"
                notifier={notifier}
        />
    {/if}

</div>
