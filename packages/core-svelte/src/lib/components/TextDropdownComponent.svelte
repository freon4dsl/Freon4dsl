<script lang="ts">
    import { TEXTDROPDOWN_LOGGER } from "$lib/components/ComponentLoggers.js";

    // This component is a combination of a TextComponent and a DropdownComponent.
    // The TextComponent is shown in non-editable state until it gets focus,
    // then the Dropdown also appears. When the text in the TextComponent alters,
    // the options in the dropdown are filtered based on the text and the caret position
    // within the text.
    import TextComponent from "./TextComponent.svelte";
    import DropdownComponent from "./DropdownComponent.svelte";
    import ArrowForward from "$lib/components/images/ArrowForward.svelte";
    import { clickOutsideConditional, componentId, selectedBoxes } from "./svelte-utils/index.js";
    import {
        type AbstractChoiceBox,
        ARROW_DOWN,
        ARROW_UP,
        ENTER,
        FreEditor,
        FreLogger,
        isActionBox,
        isSelectBox,
        isReferenceBox,
        type SelectOption,
        TextBox,
        BehaviorExecutionResult
    } from "@freon4dsl/core"

    import { afterUpdate, onMount } from "svelte";

    const LOGGER = TEXTDROPDOWN_LOGGER;
    
    export let box: AbstractChoiceBox;	        // the accompanying ActionBox or SelectBox
    export let editor: FreEditor;			    // the editor
    let textBox: TextBox;                       // the textbox that is to be coupled to the TextComponent part
    $: textBox = box?.textBox;                  // keeps the textBox variable in state with the box!

    let id: string;                             // an id for the html element
    id = !!box ? componentId(box) : 'textdropdown-with-unknown-box';
    let isEditing: boolean = false;             // becomes true when the text field gets focus
    let dropdownShown: boolean = false;         // when true the dropdown element is shown
    let text: string = "";		                // the text in the text field
    let selectedId: string;		                // the id of the selected option in the dropdown
    let filteredOptions: SelectOption[];        // the list of filtered options that are shown in the dropdown
    let allOptions: SelectOption[];             // all options as calculated by the editor
    let textComponent;

    let setText = (value: string) => {
        LOGGER.log(`${box.id}: setting text to '${value}'`)
        if (value === null || value === undefined) {
            text = "";
        } else {
            text = value;
        }
    }

    const noOptionsId = 'noOptions';            // constant for when the editor has no options
    let getOptions = (): SelectOption[] => {    // the function used to calculate all_options, called by onClick and setFocus
        let result = box?.getOptions(editor);
        if (result === null || result === undefined) {
            result = [{id: noOptionsId, label: '<no known options>'}];
        }
        return result;
    };

    /**
     * This function sets the focus on this element programmatically.
     */
    const setFocus = () => {
        LOGGER.log("setFocus " + box.kind + id);
        if (!!textComponent) {
            textComponent.setFocus();
        } else {
            LOGGER.error('TextDropdownComponent ' + id + ' has no textComponent' )
        }
    }

    function setTextLocalAndInBox(text: string) {
        box.textHelper.setText(text);
        setText(text);
    }

    /**
     * This function is executed whenever there is a change in the box model.
     * It sets the text in the box, if this is a SelectBox.
     */
    const refresh = (why?: string) => {
        LOGGER.log(`${box.id}: refresh: ` + why + " for " + box?.kind)
        if (isSelectBox(box)) {
            let selectedOption = box.getSelectedOption();
            LOGGER.log("    selectedOption is " + selectedOption?.label)
            if (!!selectedOption) {
                setTextLocalAndInBox(selectedOption.label);
            }
            selectedId = undefined
        }
        // because the box maybe a different one than we started with ...
        // box.setFocus = setFocus; todo remove?
    }

    afterUpdate( () => {
        LOGGER.log(`${box.id}: afterUpdate`)
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
        box.triggerKeyPressEvent = triggerKeyPressEvent
    });

    onMount(() => {
        LOGGER.log("onMount for role [" + box.role + "]");
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
        box.triggerKeyPressEvent = triggerKeyPressEvent
    });

    const triggerKeyPressEvent = (key: string) => {
        // todo remove
        // allOptions = getOptions();
        // filteredOptions = allOptions.filter(o => o.label.startsWith(key))
        // makeFilteredOptionsUnique();
        // dropdownShown = true;
    }

    /**
     * This custom event is triggered when the text in the textComponent is altered or when the
     * caret position is changed.
     * Based on the (altered) text and the caret position within the text, the list of options
     * in the dropdownComponent is changed.
     * @param event
     */
    const textUpdate = (event: CustomEvent) => {
        LOGGER.log(`textUpdate for ${box.kind}: ` + JSON.stringify(event.detail) + ", start: "+ text.substring(0, event.detail.caret));
        allOptions = getOptions();
        filteredOptions = allOptions.filter(o => o.label.startsWith(text.substring(0, event.detail.caret)));
        makeFilteredOptionsUnique();
        // Only one option and has been fully typed in, use this option without waiting for the ENTER key
        LOGGER.log(`textUpdate: (${filteredOptions.length}, ${filteredOptions[0]?.label}, ${filteredOptions[0]?.label?.length}`)
        if (filteredOptions.length === 1 && filteredOptions[0].label === text && filteredOptions[0].label.length === event.detail.caret ) {
            event.preventDefault()
            event.stopPropagation()
            storeOrExecute(filteredOptions[0])
            return
        }
        if (isActionBox(box)) {
            // Try to match a regular expression, and execute the action that is associated with it
            const result = box.tryToMatchRegExpAndExecuteAction(text, editor);
            if (result === BehaviorExecutionResult.EXECUTED) endEditing();
        }
    };

    const caretChanged = (event: CustomEvent) => {
        LOGGER.log(`caretChanged for ${box.kind}: ` + JSON.stringify(event.detail) + ", start: "+ text.substring(0, event.detail.caret));
        allOptions = getOptions();
        filteredOptions = allOptions.filter(o => o.label.startsWith(text.substring(0, event.detail.caret)));
        makeFilteredOptionsUnique();
    };

    const hideDropdown= () => {
        dropdownShown = false;
    }

    const showDropdown= () => {
        dropdownShown = true;
    }

    function makeFilteredOptionsUnique() {
        // remove doubles, to avoid errors
        const seen: string[] = [];
        const result: SelectOption[] = [];
        filteredOptions.forEach( option => {
            if (seen.includes(option.label)) {
                LOGGER.log("Option " + JSON.stringify(option) + " is a duplicate");
            } else {
                seen.push(option.label);
                result.push(option)
            }
        });
        filteredOptions = result;
    }
    function selectLastOption() {
        if (dropdownShown) {
            if (filteredOptions?.length !== 0) {
                selectedId = filteredOptions[filteredOptions.length - 1].id;
            } else { // there are no valid options left
                editor.setUserMessage("no valid selection");
            }
        }
    }

    function selectFirstOption() {
        if (dropdownShown) {
            if (filteredOptions?.length !== 0) {
                selectedId = filteredOptions[0].id;
            } else { // there are no valid options left
                editor.setUserMessage("No valid selection");
            }
        }
    }

    /**
     * These events are either not handled by the textComponent, or not handled by the dropdownComponent.
     * In case of an arrow down or up event in the textComponent, the currently selected option in the dropdown is changed.
     * In case of an Enter event in the dropdown, the currently selected option in the dropdown is set as text in the
     * textComponent, and the editing state is ended.
     * @param event
     */
    const onKeyDown = (event: KeyboardEvent) => {
        LOGGER.log("XX onKeyDown: " + id + " [" + event.key + "] alt [" + event.altKey + "] shift [" + event.shiftKey + "] ctrl [" + event.ctrlKey + "] meta [" + event.metaKey + "]" + ", selectedId: " + selectedId + " dropdown:" + dropdownShown + " editing:" + isEditing);
        if (dropdownShown) {
            if (!event.ctrlKey && !event.altKey) {
                switch (event.key) {
                    case ARROW_DOWN: {
                        if (dropdownShown) { // if stat removed
                            if (!selectedId || selectedId.length == 0) { // there is no current selection: start at the first option
                                selectFirstOption();
                            } else {
                                const index = filteredOptions.findIndex(o => o.id === selectedId);
                                if (index + 1 < filteredOptions.length) { // the 'normal' case: go one down
                                    selectedId = filteredOptions[index + 1].id;
                                } else if (index + 1 === filteredOptions.length) { // the end of the options reached: go to the first
                                    selectFirstOption();
                                }
                            }
                            event.preventDefault();
                            event.stopPropagation();
                        }
                        break;
                    }
                    case ARROW_UP: {
                        if (dropdownShown) { // if stat removed
                            if (!selectedId || selectedId.length == 0) { // there is no current selection, start at the last option
                                selectLastOption();
                            } else {
                                const index = filteredOptions.findIndex(o => o.id === selectedId);
                                if (index > 0) { // the 'normal' case: go one up
                                    selectedId = filteredOptions[index - 1].id;
                                } else if (index === 0) { // the beginning of the options reached: go to the last
                                    selectLastOption();
                                }
                            }
                            event.preventDefault();
                            event.stopPropagation();
                        }
                        break;
                    }
                    case ENTER: { // user wants current selection
                        // find the chosen option
                        let chosenOption: SelectOption = null;
                        if (filteredOptions.length <= 1) {
                            if (filteredOptions.length !== 0) { // if there is just one option left, choose that one
                                chosenOption = filteredOptions[0];
                            } else { // there are no valid options left
                                editor.setUserMessage('No valid selection')
                            }
                        } else { // find the selected option and choose that one
                            const index = filteredOptions.findIndex(o => o.id === selectedId);
                            if (index >= 0 && index < filteredOptions.length) {
                                chosenOption = filteredOptions[index];
                            }
                        }
                        // store or execute the option
                        if (!!chosenOption) {
                            storeOrExecute(chosenOption);
                        } else { //  no valid option, restore the original text
                            setText(textBox.getText()); // line : using setText
                            // stop editing
                            isEditing = false;
                            dropdownShown = false;
                        }
                        event.preventDefault();
                        event.stopPropagation();
                        break;
                    }
                    default: {
                        // stop editing todo is this the correct default?
                        isEditing = false;
                        dropdownShown = false;
                    }
                }
            }
        } else { // this component was selected using keystrokes, not by clicking, therefore dropDownShown = false
            if (!event.ctrlKey && !event.altKey) {
                switch (event.key) {
                    case ENTER: {
                        // Check whether there is only one option, if so execute immediately
                        const allOptions = getOptions()
                        if (allOptions.length === 1) {
                            storeOrExecute(allOptions[0])
                        } else {
                            startEditing();
                        }
                        event.stopPropagation();
                        event.preventDefault();
                    }
                }
            }
        }
    };

    /**
     * This custom event is triggered by a click in the dropdown. The option that is clicked
     * is set as text in the textComponent and the editing state is ended.
     */
    const itemSelected = () => {
        LOGGER.log('itemSelected ' + selectedId)
        const index = filteredOptions.findIndex(o => o.id === selectedId);
        if (index >= 0 && index < filteredOptions.length) {
            const chosenOption = filteredOptions[index];
            if (!!chosenOption) {
                storeOrExecute(chosenOption);
            }
        }
        if (!isSelectBox(box)) { // clear text for an action box
            setTextLocalAndInBox('');
        }
        isEditing = false;
        dropdownShown = false;
    };

    /**
     * This custom event is triggered when the TextComponent gets focus by click.
     * The editor is notified of the newly selected box and the options list is filled.
     */
    const startEditing = (event?: CustomEvent) => {
        LOGGER.log('TextDropdownComponent: startEditing' + JSON.stringify(event?.detail));
        isEditing = true;
        dropdownShown = true;
        allOptions = getOptions();
        if (!!event) {
            if ( text === undefined || text === null || text.length === 0) {
                // @ts-ignore filter used to make a shallow copy
                filteredOptions = allOptions.filter(o => true);
            } else {
                filteredOptions = allOptions.filter(o => {
                    LOGGER.log(`startsWith text [${text}], option is ${JSON.stringify(o)}`);
                    return o?.label?.startsWith(text.substring(0, event.detail.caret))
                });
            }
        } else {
            filteredOptions = allOptions.filter(o => o?.label?.startsWith(text.substring(0, 0)));
        }
        makeFilteredOptionsUnique();
    };

    /**
     * When the user has selected an option, in whatever manner, this function is called.
     * The action that is associated with the option is executed. This changes the model,
     * thus it triggers the creation of a new box model. The 'refresh' function is triggered
     * by these changes.
     * @param selected
     */
    function storeOrExecute(selected: SelectOption) {
        LOGGER.log('storeOrExecute for option ' + selected.label + ' ' + box.kind);
        isEditing = false;
        dropdownShown = false;

        box.executeOption(editor, selected); // TODO the result of the execution is ignored
        if (isActionBox(box)) { // ActionBox, action done, clear input text
            setTextLocalAndInBox('');
        }
    }

    /**
     * This function is called whenever the user ends editing the TextComponent,
     * in whatever manner.
     */
    const endEditing = () => {
        LOGGER.log("endEditing " +id + " dropdownShow:" + dropdownShown + " isEditing: " + isEditing);
        // todo this is strange code, must have a better look
        if (isEditing === true) {
            isEditing = false;
        } else {
            if (dropdownShown === true) {
                dropdownShown = false;
            }
            return;
        }
        if (dropdownShown) {
            allOptions = getOptions();
            let validOption = allOptions.find(o => o.label === text);
            if (!!validOption && validOption.id !== noOptionsId) {
                storeOrExecute(validOption);
            } else { // no valid option, restore the previous value
                setText(textBox.getText());
            }
            dropdownShown = false;
        }
    };
    
    const focusOutTextComponent = () => {
        LOGGER.log("focusOutTextComponent " + id)
        selectedId = undefined
        isEditing = false
    }

    const onBlur = () => {
        // We use on:blur instead of on:focusout, because when the user selects an item in the dropdown list,
        // the text component will trigger a focus out event. The focus out event from the text component
        // always comes before the click in the dropdown. If we react to focus out by endEditing(), any click
        // on the dropdown list will have no effect.
        LOGGER.log("onBlur " + id);
        if (!document.hasFocus() || !$selectedBoxes.includes(box)) {
            endEditing();
        }
    };

    /**
     * The "click_outside" event was triggered because of `use:clickOutsideConditional`.
     */
    const onClickOutside = () => {
        LOGGER.log("onClickOutside");
        endEditing();
    };

    const selectReferred = (event) => {
        if (isReferenceBox(box)) {
            if (box.isSelectAble()) {
                box.selectReferred(editor);
            } else {
                editor.setUserMessage("Cannot jump to this element.");
            }
            event.stopPropagation();
            event.preventDefault();
        }
    };

    refresh();
</script>


<span id="{id}"
      on:keydown={onKeyDown}
      use:clickOutsideConditional={{enabled: dropdownShown}}
      on:click_outside={onClickOutside}
      on:blur={onBlur}
      on:contextmenu={(event) => endEditing()}
      class="text-dropdown-component"
      role="none"
>
    <TextComponent
            bind:isEditing={isEditing}
            bind:text={text}
            bind:this={textComponent}
            partOfDropdown={true}
            box={textBox}
            editor={editor}
            on:textUpdate={textUpdate}
            on:caretChanged={caretChanged}
            on:focusOutTextComponent={focusOutTextComponent}
            on:hideDropdown={hideDropdown}
            on:showDropdown={showDropdown}
            on:startEditing={startEditing}
            on:endEditing={endEditing}
    />
    {#if isReferenceBox(box) && box.isSelectAble()}
        <button class="reference-button" id="{id}" on:click={(event) => selectReferred(event)}>
            <ArrowForward/>
        </button>
    {/if}
    {#if dropdownShown}
        <DropdownComponent
            bind:selectedId={selectedId}
            bind:options={filteredOptions}
            on:freItemSelected={itemSelected}/>
    {/if}
</span>

