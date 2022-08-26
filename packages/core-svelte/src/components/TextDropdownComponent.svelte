<script lang="ts">
    // This component is a combination of a TextComponent and a DropdownComponent.
    // The TextComponent is shown in non-editable state until it gets focus,
    // then the Dropdown also appears. When the text in the TextComponent alters,
    // the options in the dropdown are filtered based on the text and the caret position
    // within the text.
    import TextComponent from "./TextComponent.svelte";
    import DropdownComponent from "./DropdownComponent.svelte";
    import { clickOutside } from "./clickOutside";
    import {
        AbstractChoiceBox,
        ARROW_DOWN,
        ARROW_UP,
        ENTER, ESCAPE,
        isSelectBox,
        PiEditor, PiLogger,
        SelectOption,
        TextBox
    } from "@projectit/core";
    import { componentId } from "./util";
    import { autorun, runInAction } from "mobx";

    const LOGGER = new PiLogger("TextDropdownComponent").mute();

    export let choiceBox: AbstractChoiceBox;	// the accompanying AliasBox or SelectBox
    export let editor: PiEditor;			    // the editor
    let textBox: TextBox;                       // the textbox that is to be coupled to the TextComponent part
    $: textBox = choiceBox?.textBox;            // keeps the textBox variable in state with the choiceBox!

    let id: string;                             // an id for the html element
    id = !!choiceBox ? componentId(choiceBox) : 'textdropdown-with-unknown-box';
    let isEditing: boolean = false;             // becomes true when the text field gets focus
    let dropdownShown: boolean = false;         // when true the dropdwon element is shown
    let text: string = "";		                // the text in the text field
    let selectedId: string;		                // the id of the selected option in the dropdown
    let filteredOptions: SelectOption[];        // the list of filtered options that are shown in the dropdown
    let allOptions: SelectOption[];             // all options as calculated by the editor

    const noOptionsId = 'noOptions';            // constant for when the editor has no options
    let getOptions = (): SelectOption[] => {    // the function used to calculate all_options, called by onClick and setFocus
        let result = choiceBox?.getOptions(editor);
        if (result === null || result === undefined) {
            result = [{id: noOptionsId, label: '<no known options>'}];
        }
        return result;
    };

    /**
     * This function sets the focus on this element programmatically.
     * It is called from the editor.
     */
    const setFocus = () => {
        // TODO to be tested
        // console.log('TextDropdownComponent setFocus');
        isEditing = true;
        dropdownShown = false;
        editor.selectedBox = choiceBox;
        allOptions = filteredOptions = getOptions();
    };

    /**
     * This custom event is triggered when the text in the textComponent is altered or when the
     * caret position is changed.
     * Based on the (altered) text and the caret position within the text, the list of options
     * in the dropdownComponent is changed.
     * @param event
     */
    const textUpdate = (event: CustomEvent) => {
        // console.log('textUpdate: ' + JSON.stringify(event.detail));
        dropdownShown = true;
        text = event.detail.content;
        if (!allOptions) {
            allOptions = getOptions();
        }
        filteredOptions = allOptions.filter(o => o.label.startsWith(text.substring(0, event.detail.caret)));
    };

    /**
     * These events are either not handled by the textComponent, or not handled by the dropdownComponent.
     * In case of an arrow down or up event in the textComponent, the currently selected option in the dropdown is changed.
     * In case of an Enter event in the dropdown, the currently selected option in the dropdown is set as text in the
     * textComponent, and the editing state is ended.
     * In case of an ESCAPE in the textCompnent, the dropdown is closed, while the editing state remains.
     * @param event
     */
    const onKeyDown = (event: KeyboardEvent) => {
        LOGGER.log("TextDropdownComponent onKeyDown: [" + event.key + "] alt [" + event.altKey + "] shift [" + event.shiftKey + "] ctrl [" + event.ctrlKey + "] meta [" + event.metaKey + "]" + ", selectedId: " + selectedId);
        switch (event.key) {
            case ESCAPE: {
                dropdownShown = false;
                event.preventDefault();
                event.stopPropagation();
                break;
            }
            case ARROW_DOWN: {
                if (!selectedId || selectedId.length == 0) { // there is no current selection: start at the first option
                    selectedId = filteredOptions[0].id;
                } else {
                    const index = filteredOptions.findIndex(o => o.id === selectedId);
                    if (index + 1 < filteredOptions.length) { // the 'normal' case: go one down
                        selectedId = filteredOptions[index + 1].id;
                    } else if (index + 1 === filteredOptions.length) { // the end of the options reached: go to the first
                        selectedId = filteredOptions[0].id;
                    }
                }
                event.preventDefault();
                event.stopPropagation();
                break;
            }
            case ARROW_UP: {
                if (!selectedId || selectedId.length == 0) { // there is no current selection, start at the last option
                    selectedId = filteredOptions[filteredOptions.length - 1].id;
                } else {
                    const index = filteredOptions.findIndex(o => o.id === selectedId);
                    if (index > 0) { // the 'normal' case: go one up
                        selectedId = filteredOptions[index - 1].id;
                    } else if (index === 0) { // the beginning of the options reached: go to the last
                        selectedId = filteredOptions[filteredOptions.length - 1].id;
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
                    chosenOption = filteredOptions[0];
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
                    text = textBox.getText();
                }
                // stop editing
                isEditing = false;
                dropdownShown = false;
                event.preventDefault();
                event.stopPropagation();
                break;
            }
        }
    };

    /**
     * This custom event is triggered by a click in the dropdown. The option that is clicked
     * is set as text in the textComponent and the editing state is ended.
     */
    const itemSelected = () => {
        LOGGER.log('Textdropdown itemSelected')
        const index = filteredOptions.findIndex(o => o.id === selectedId);
        if (index >= 0 && index < filteredOptions.length) {
            storeAndExecute(filteredOptions[index]);
        }
        isEditing = false;
        dropdownShown = false;
    };

    /**
     * This custom event is triggered when the TextComponent gets focus, either by click or tabbing.
     * The editor is notified of the newly selected box and the options list is filled.
     */
    const startEditing = () => {
        // LOGGER.log('TextDropdownComponent: startEditing');
        isEditing = true;
        dropdownShown = true;
        editor.selectedBox = choiceBox;
        if (!allOptions) {
            allOptions = getOptions();
        }
        allOptions = filteredOptions = getOptions();
    };

    /**
     * When the user has selected an option, in whatever manner, this function is called.
     * The action that is associated with the option is executed. This changes the model,
     * thus it triggers the creation of a new box model. The 'autorun' function is triggered
     * by these changes.
     * @param selected
     */
    function storeAndExecute(selected: SelectOption) {
        LOGGER.log('executing option ' + selected.label);
        runInAction(() => {
            // TODO set the new cursor through the editor
            choiceBox.selectOption(editor, selected); // TODO the result of the execution is ignored
            // TODO the execution of the option should set the text in the selectBox, for now this is handled here
            if (isSelectBox(choiceBox)) {
                choiceBox.textHelper.setText(selected.label);
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
        LOGGER.log('TextDropdownComponent: endEditing');
        isEditing = false;
        dropdownShown = false;
        // check whether the current text is a valid option
        if (!allOptions) {
            allOptions = getOptions();
        }
        let validOption = allOptions.find(o => o.label === text);
        if (!!validOption && validOption.id !== noOptionsId) {
            storeAndExecute(validOption);
        } else { // no valide option, restore the previous value
            text = textBox.getText();
        }
    };

    /**
     * This function is executed whenever there is a change in the box model.
     * It sets the text in the choiceBox, if this is a SelectBox.
     */
    autorun(() => {
        if (isSelectBox(choiceBox)) {
            // TODO see todo in 'storeOrExecute'
            let selectedOption = choiceBox.getSelectedOption();
            if (!!selectedOption) {
                choiceBox.textHelper.setText(selectedOption.label);
            }
        }
        // choiceBox.setFocus = setFocus;
    });

</script>

<span id="{id}"
      on:keydown={onKeyDown}
      use:clickOutside
      on:click_outside={endEditing}
>
    <TextComponent
            bind:isEditing={isEditing}
            bind:text={text}
            textBox={textBox}
            editor={editor}
            partOfAlias={true}
            on:textUpdate={textUpdate}
            on:startEditing={startEditing}
            on:endEditing={endEditing}
    />
    {#if dropdownShown}
        <DropdownComponent
                bind:selectedId={selectedId}
                bind:options={filteredOptions}
                on:piItemSelected={itemSelected}/>
    {/if}
</span>