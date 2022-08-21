<script lang="ts">
    // This component is a combination of a TextComponent and a DropdownComponent.
    // The TextComponent is shown in non-editable state until it gets focus,
    // then the Dropdown also appears. When the text in the TextComponent alters,
    // the options in the dropdown are filtered based on the text and the caret position
    // within the text.
    import TextComponent from "./TextComponent.svelte";
    import DropdownComponent from "./DropdownComponent.svelte";
    import {
        AbstractChoiceBox,
        ARROW_DOWN,
        ARROW_UP,
        ENTER,
        PiEditor,
        SelectOption,
        TextBox
    } from "@projectit/core";
    import { componentId } from "./util";
    import { clickOutside } from "./clickOutside";
    import { runInAction } from "mobx";
    import { storeText } from "./CommonFunctions";

    export let aliasBox: AbstractChoiceBox;	// the accompanying AliasBox or SelectBox
    export let editor: PiEditor;			// the editor

    let textBox: TextBox;
    $: textBox = aliasBox?.textBox;

    let textComponent: TextComponent;
    let dropdownComponent: DropdownComponent;
    let id: string = componentId(aliasBox); // an id for the html element
    let isEditing: boolean = false;         // becomes true when the text field gets focus
    let text: string = '';		            // the text in the text field
    let selectedId: string;		            // the id of the selected option in the dropdown
    let options: SelectOption[];            // the list of filtered options that are shown in the dropdown
    let all_options: SelectOption[];        // all options as calculated by the editor

    let getOptions = (): SelectOption[] => { // the function used to calculate all_options, called by onClick and setFocus
        return aliasBox?.getOptions(editor);
    };

    /**
     * This function sets the focus on this element programmatically.
     * It is called from the editor.
     */
    const setFocus = () => {
        // console.log('TextDropdownComponent setFocus');
        isEditing = true;
        all_options = options = getOptions();
    }

    /**
     * This custom event is triggered when the text in the textComponent is altered or when the
     * caret position is changed.
     * Based on the (altered) text and the caret position within the text, the list of options
     * in the dropdownComponent is changed.
     * @param event
     */
    const textUpdate = (event) => {
        text = event.detail.content;
        options = all_options.filter(o => o.label.startsWith(text.substring(0, event.detail.caret)));
    }

    /**
     * These events are either not handled by the textComponent, or not handled by the dropdownComponent.
     * In case of an arrow down or up event in the textComponent, the currently selected option in the dropdown is changed.
     * In case of an Enter event in the dropdown, the currently selected option in the dropdown is set as text in the
     * textComponent, and the editing state is ended.
     * @param event
     */
    const onKeyDown = (event) => {
        console.log("TextDropdownComponent onKeyDown: [" + event.key + "] alt [" + event.altKey + "] shift [" + event.shiftKey + "] ctrl [" + event.ctrlKey + "] meta [" + event.metaKey + "]" + ', selectedId: ' + selectedId);
        switch(event.key) {
            case ARROW_DOWN: {
                if (!selectedId || selectedId.length == 0) { // there is no current selection: start at the first option
                    selectedId = options[0].id;
                } else {
                    const index = options.findIndex(o => o.id === selectedId);
                    if (index + 1 < options.length) { // the 'normal' case: go one down
                        selectedId = options[index + 1].id;
                    } else if (index + 1 === options.length) { // the end of the options reached: go to the first
                        selectedId = options[0].id;
                    }
                }
                event.preventDefault();
                event.stopPropagation();
                break;
            }
            case ARROW_UP: {
                if (!selectedId || selectedId.length == 0) { // there is no current selection, start at the last option
                    selectedId = options[options.length - 1].id;
                } else {
                    const index = options.findIndex(o => o.id === selectedId);
                    if (index > 0) { // the 'normal' case: go one up
                        selectedId = options[index - 1].id;
                    } else if (index === 0) { // the beginning of the options reached: go to the last
                        selectedId = options[options.length - 1].id;
                    }
                }
                event.preventDefault();
                event.stopPropagation();
                break;
            }
            case ENTER: {
                if (options.length === 1) { // if there is just one option left, choose that one
                    text = options[0].label;
                    storeText(editor, text, textBox);
                } else { // find the selected option and choose that one
                    const index = options.findIndex(o => o.id === selectedId);
                    if (index >= 0 && index < options.length) {
                        text = options[index].label;
                        storeText(editor, text, textBox);
                    }
                }
                isEditing = false;
                event.preventDefault();
                event.stopPropagation();
                break;
            }
        }
    }

    /**
     * This custom event is triggered by a click in the dropdown. The option that is clicked
     * is set as text in the textComponent and the editing state is ended.
     */
    const itemSelected = () => {
        // console.log('Textdropdown itemSelected')
        const index = options.findIndex(o => o.id === selectedId);
        if (index >= 0 && index < options.length) {
            text = options[index].label;
            // store the current value in the textbox, or delete the box, if appropriate
            storeText(editor, text, textBox);
        }
        isEditing = false;
    }

    const startEditing = () => {
        // console.log('TextDropdownComponent: startEditing');
        isEditing = true;
        all_options = options = getOptions();
    }

    function checkCurrentText() {
        isEditing = false;
        // check whether the current text is a valid option
        let validOption = all_options.find(o => o.label === text);
        if (!!validOption) {
            // store the current value in the textbox, or delete the box, if appropriate
            storeText(editor, text, textBox);
        } else {
            text = textBox.getText();
        }
    }

    const endEditing = () => {
        // console.log('TextDropdownComponent: endEditing');
        checkCurrentText();
    }

    const hide = () => {
        console.log("TextDropdownComponent onBlur")
        checkCurrentText();
    }
</script>

<span id="{id}"
      on:keydown={onKeyDown}
      use:clickOutside on:clickOutside={hide}
>
    <TextComponent
            bind:isEditing={isEditing}
            bind:this={textComponent}
            bind:text={text}
            textBox={textBox}
            editor={editor}
            partOfAlias={true}
            on:textUpdate={textUpdate}
            on:startEditing={startEditing}
            on:endEditing={endEditing}
    />
    {#if isEditing}
        <DropdownComponent
                bind:this={dropdownComponent}
                bind:selectedId={selectedId}
                bind:options={options}
                on:piItemSelected={itemSelected}/>
    {/if}
</span>
