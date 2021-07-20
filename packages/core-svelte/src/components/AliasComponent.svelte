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
        PiUtils,SPACEBAR, TAB, toPiKey
    } from "@projectit/core";
    import type { SelectOption } from "@projectit/core";
    import { autorun } from "mobx";
    import { afterUpdate, onMount } from "svelte";
    import DropdownComponent from "./DropdownComponent.svelte";
    import TextComponent from "./TextComponent.svelte";

    export let aliasBox: AbstractChoiceBox;
    export let editor: PiEditor;

    let open: boolean = false;
    let LOGGER = new PiLogger("AliasComponent");

    let dropdown: DropdownComponent;
    let textcomponent: TextComponent;
    let selectedOption: SelectOption;

    const getAliasOptions = (): SelectOption[] => {
        return aliasBox.getOptions(editor);
    };

    // const selected = (event: CustomEvent) => {
    //     console.log("Alias.selected " + event.detail.label);
    //     aliasBox.textBox.placeHolder = event.detail.label
    //     open = false;
    // }
    const setFocus = async (): Promise<void> => {
        console.log("AliasComponent set focus " + aliasBox.role);
        LOGGER.log("AliasComponent set focus " + aliasBox.role);
        textcomponent.focus();
        // this.startEditing();
    };

    onMount( () => {
        LOGGER.log("AliasComponent.onMount for role [" + aliasBox.role + "]");
        aliasBox.textBox.setFocus = setFocus;
        aliasBox.setFocus = setFocus;
        // textBox.setCaret = setCaret;
        // caretPosition = textBox.caretPosition;
    });

    afterUpdate( () => {
        aliasBox.textBox.setFocus = setFocus;
        aliasBox.setFocus = focus;
    })

    const onKeyPress = async (e: KeyboardEvent) => {
        EVENT_LOG.log("onKeyPress: " + e.key + " for role " + aliasBox.role);
        // await wait(0);

        if (isPrintable(e) && !e.ctrlKey) {
            LOGGER.log("Press: is printable, text is now [" + textcomponent.getText() + "]");
        }
    };
    const onInput = async (e: InputEvent) => {
        const value = e.target.innerText;
        LOGGER.log("onInput: [" + value + "] for role " + aliasBox.role + " with text ["+ textcomponent.getText() + "]");
        // const aliasResult = await executeBehavior(aliasBox, e.data, editor);
        const aliasResult = await aliasBox.selectOption(editor, {id: value, label: value});
        switch (aliasResult) {
            case BehaviorExecutionResult.EXECUTED:
                LOGGER.log("ALIAS MATCH");
                if( !!textcomponent) {
                    textcomponent.textOnScreen = "";
                }
                open = false;
                // this.hasError = false;
                break;
            case BehaviorExecutionResult.PARTIAL_MATCH:
                LOGGER.log("PARTIAL_MATCH");
                // this.hasError = false;
                open = true;
                break;
            case BehaviorExecutionResult.NO_MATCH:
                LOGGER.log("NO MATCH");
                // this.hasError = true;
                // this.dropdownIsOpen = true;
                break;
        }
        return aliasResult;
    };

    const onKeyDown = async (e: KeyboardEvent) => {
        LOGGER.log("onKeyDown: " + e.key + " for role " + aliasBox.role);
        if (isPrintable(e) && !e.ctrlKey) {
            LOGGER.log("Down: is printable, text is now [" + textcomponent.getText() + "]");
            open = true;
            if(dropdown !== null && dropdown !== undefined) {
                dropdown.onKeydown(e);
            }
            e.stopPropagation();

            return;
        }
        if (e.keyCode === DELETE) {
            e.stopPropagation();
        }
        if (!shouldPropagate(e)) {
            e.stopPropagation();
        }
        if (open ) { // && this.dropdown) {
            // Propagate key event to dropdown component
            LOGGER.log("Forwarding event to dropdown component");
            if( dropdown !== null && dropdown !== undefined){
                const x = dropdown.handleKeyDown(e);
                LOGGER.log("      handled result: " + x);
            } else {
                LOGGER.log("      DROPDOWN UDEFINED")
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
                    if (isAliasBox(aliasBox)) {
                        await PiUtils.handleKeyboardShortcut(toPiKey(e), aliasBox, editor);
                        e.stopPropagation();
                    }
                    break;
                case SPACEBAR:
                    LOGGER.log("onKeyDown Keys.SPACEBAR");
                    if (e.ctrlKey) {
                        open = !open;
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

    const me = () => {
        return me.caller.name;
    }
    const selectedEvent = (event: CustomEvent<SelectOption>): void => {
        LOGGER.log("set selected SVELTE option to "+ event.detail.id );
        selectOption(event.detail);
    }

    const selectOption = async (option: SelectOption) => {
        LOGGER.log("==> EXECUTING ALIAS " + option.label)
        await aliasBox.selectOption(editor, option);
        let selected = aliasBox.getSelectedOption();
        aliasBox.textHelper.text = (!!selected ? selected.label : "");
        open=false
    }

    const onClick = (e: MouseEvent) => {
        LOGGER.log("onClick");
        open = !open;
    }
    autorun( ()=> {
        selectedOption = aliasBox.getSelectedOption();
        aliasBox.textBox.setText(!!selectedOption ? selectedOption.label : "");
    });
</script>

<div on:keydown={onKeyDown}
     on:keypress={onKeyPress}
     on:input={onInput}
     on:click={onClick}
>
    <TextComponent
                   editor={editor}
                   textBox={aliasBox.textBox}
                   bind:this={textcomponent}
    />
    {#if open}
        <DropdownComponent
                bind:this="{dropdown}"
                bind:open
                handleSelectedOption={selectOption}
                on:pi-ItemSelected={selectedEvent}
                getOptions={getAliasOptions}
                selectedOptionId="2"
        />
    {/if}

</div>
