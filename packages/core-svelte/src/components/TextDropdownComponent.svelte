<script lang="ts">
    // This component is a combination of a TextComponent and a DropdownComponent.
    // The TextComponent is shown in non-editable state until it gets focus,
    // then the Dropdown also appears. When the text in the TextComponent alters,
    // the options in the dropdown are filtered based on the text and the caret position
    // within the text.
    import TextComponent from "./TextComponent.svelte";
    import DropdownComponent from "./DropdownComponent.svelte";
    import { clickOutsideConditional, componentId, selectedBoxes } from "./svelte-utils";
    import {
        AbstractChoiceBox,
        ARROW_DOWN,
        ARROW_UP,
        ENTER,
        ESCAPE,
        isSelectBox,
        FreEditor,
        FreLogger,
        SelectOption,
        TextBox
    } from "@freon4dsl/core";

    import { runInAction } from "mobx";
    import { afterUpdate, onMount } from "svelte";

    const LOGGER = new FreLogger("TextDropdownComponent"); // .mute(); muting done through webapp/logging/LoggerSettings

    export let box: AbstractChoiceBox;	        // the accompanying ActionBox or SelectBox
    export let editor: FreEditor;			    // the editor
    let textBox: TextBox;                       // the textbox that is to be coupled to the TextComponent part
    $: textBox = box?.textBox;                  // keeps the textBox variable in state with the box!

    let id: string;                             // an id for the html element
    id = !!box ? componentId(box) : 'textdropdown-with-unknown-box';
    let isEditing: boolean = false;             // becomes true when the text field gets focus
    let dropdownShown: boolean = false;         // when true the dropdwon element is shown
    let text: string = "";		                // the text in the text field
    let selectedId: string;		                // the id of the selected option in the dropdown
    let filteredOptions: SelectOption[];        // the list of filtered options that are shown in the dropdown
    let allOptions: SelectOption[];             // all options as calculated by the editor
    let textComponent;

    let setText = (value: string) => {
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
     * It is called from the RenderComponent.
     */
    const setFocus = () => {
        LOGGER.log("setFocus " + box.kind + id);
        if (!!textComponent) {
            textComponent.setFocus();
        } else {
            console.error('TextDropdownComponent ' + id + ' has no textComponent' )
        }
    }

    /**
     * This function is executed whenever there is a change in the box model.
     * It sets the text in the box, if this is a SelectBox.
     */
    const refresh = (why?: string) => {
        if (isSelectBox(box)) {
            // TODO see todo in 'storeOrExecute'
            let selectedOption = box.getSelectedOption();
            if (!!selectedOption) {
                box.textHelper.setText(selectedOption.label);
                setText(box.textHelper.getText());
            }
        }
        // because the box maybe a different one than we started with ...
        // box.setFocus = setFocus; todo remove?
    }

    afterUpdate( () => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    onMount(() => {
        LOGGER.log("onMount for role [" + box.role + "]");
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    // TODO still not functioning: reference shortcuts and chars that are not valid in textComponent to drop in next action!!!

    /**
     * This custom event is triggered when the text in the textComponent is altered or when the
     * caret position is changed.
     * Based on the (altered) text and the caret position within the text, the list of options
     * in the dropdownComponent is changed.
     * @param event
     */
    const textUpdate = (event: CustomEvent) => {
        LOGGER.log('textUpdate: ' + JSON.stringify(event.detail));
        dropdownShown = true;
        setText(event.detail.content);
        if (!allOptions) {
            allOptions = getOptions();
        }
        filteredOptions = allOptions.filter(o => o.label.startsWith(text.substring(0, event.detail.caret)));
        makeUnique();
    };

    function makeUnique() {
        // make doubles unique, to avoid errors
        const seen: string[] = [];
        const result: SelectOption[] = [];
        filteredOptions.forEach( option => {
            if (seen.includes(option.label)) {
                console.error("Option " + JSON.stringify(option) + " is a duplicate");
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
     * In case of an ESCAPE in the textComponent, the dropdown is closed, while the editing state remains.
     * @param event
     */
    const onKeyDown = (event: KeyboardEvent) => {
        LOGGER.log("onKeyDown: " + id + " [" + event.key + "] alt [" + event.altKey + "] shift [" + event.shiftKey + "] ctrl [" + event.ctrlKey + "] meta [" + event.metaKey + "]" + ", selectedId: " + selectedId + " dropdown:" + dropdownShown + " editing:" + isEditing);
        if (dropdownShown) {
            if (!event.ctrlKey && !event.altKey) {
                switch (event.key) {
                    case ESCAPE: {
                        dropdownShown = false;
                        event.preventDefault();
                        event.stopPropagation();
                        break;
                    }
                    case ARROW_DOWN: {
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
                        break;
                    }
                    case ARROW_UP: {
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
                        break;
                    }
                    case ENTER: { // user wants current selection
                        // find the chosen option
                        let chosenOption: SelectOption = null;
                        if (filteredOptions.length === 1) { // if there is just one option left, choose that one
                            if (filteredOptions.length !== 0) {
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
                            storeAndExecute(chosenOption);
                        } else { //  no valid option, restore the original text
                            setText(textBox.getText());
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
                        startEditing();
                        event.stopPropagation();
                        event.preventDefault();
                    }
                }
            }
        }
    };

    function clearText() {
        // todo find out whether we can do without this textHelper
        box.textHelper.setText("");
        setText("");
    }

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
                storeAndExecute(chosenOption);
            }
        }
        if (!isSelectBox(box)) {
            // clear text for an action box
            clearText();
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
        editor.selectElementForBox(box);
        if (!allOptions) {
            allOptions = getOptions();
        }
        if (!!event) {
            if ( text === undefined || text === null) {
                filteredOptions = allOptions.filter(o => true);
            } else {
                filteredOptions = allOptions.filter(o => {
                    LOGGER.log(`startsWith text [${text}], option is ${JSON.stringify(o)}`);
                    return o.label.startsWith(text.substring(0, event.detail.caret))
                });
            }
        } else {
            filteredOptions = allOptions.filter(o => o.label.startsWith(text.substring(0, 0)));
        }
        makeUnique();
    };

    /**
     * When the user has selected an option, in whatever manner, this function is called.
     * The action that is associated with the option is executed. This changes the model,
     * thus it triggers the creation of a new box model. The 'refresh' function is triggered
     * by these changes.
     * @param selected
     */
    function storeAndExecute(selected: SelectOption) {
        LOGGER.log('executing option ' + selected.label);
        isEditing = false;
        dropdownShown = false;
        runInAction(() => {
            // TODO set the new cursor through the editor
            box.selectOption(editor, selected); // TODO the result of the execution is ignored

            // TODO the execution of the option should set the text in the selectBox, for now this is handled here
            if (isSelectBox(box)) {
                box.textHelper.setText(selected.label);
                setText(selected.label);
            } else {
                // ActionBox, action done, clear input text
                clearText();
            }
        });
    }

    /**
     * This function is called whenever the user ends editing the TextComponent,
     * in whatever manner. It checks whether the current selected option/text is
     * a valid option. If so, this option is executed, else the text is set to the
     * original value.
     */
    const endEditing = () => {
        LOGGER.log("endEditing " +id + " dropdownShow:" + dropdownShown + " isEditing: " + isEditing);
        if (isEditing === true) {
            isEditing = false;
        } else {
            if (dropdownShown === true) {
                dropdownShown = false;
            }
            return;
        }
        if (dropdownShown) {
            // check whether the current text is a valid option
            if (allOptions === undefined || allOptions === null) {
                allOptions = getOptions();
            }
            let validOption = allOptions.find(o => o.label === text);
            if (!!validOption && validOption.id !== noOptionsId) {
                storeAndExecute(validOption);
            } else { // no valid option, restore the previous value
                setText(textBox.getText());
            }
            dropdownShown = false;
        }
    };

    const onBlur = () => {
        LOGGER.log("onBlur " + id);
        if (!document.hasFocus() || !$selectedBoxes.includes(box)) {
            endEditing();
        }
    };

    const onFocusOutText = () => {
        LOGGER.log("onFocusOutText " + id, "focus");
        if (isEditing) {
            isEditing = false;
        }
    };

    /**
     * The "click_outside" event was triggered because of `use:clickOutsideConditional`.
     */
    const onClickOutside = () => {
        LOGGER.log("onClickOutside", "focus");
        endEditing();
    };

    refresh();

</script>


<span id="{id}"
      on:keydown={onKeyDown}
      use:clickOutsideConditional={{enabled: dropdownShown}}
      on:click_outside={onClickOutside}
      on:blur={onBlur}
      on:contextmenu={(event) => endEditing()}
      class="dropdown"
>
    <TextComponent
            bind:isEditing={isEditing}
            bind:text={text}
            bind:this={textComponent}
            partOfActionBox={true}
            box={textBox}
            editor={editor}
            on:textUpdate={textUpdate}
            on:startEditing={startEditing}
            on:endEditing={endEditing}
            on:onFocusOutText={onFocusOutText}
    />
    {#if dropdownShown}
        <DropdownComponent
                bind:selectedId={selectedId}
                bind:options={filteredOptions}
                on:freItemSelected={itemSelected}/>
    {/if}
</span>

<style>
    /* The container styling - needed to position the dropdown content */
    .dropdown {
        position: relative;
        display: inline-block;
    }
</style>
