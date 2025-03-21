<script lang="ts">
    import { TEXTDROPDOWN_LOGGER } from '$lib/components/ComponentLoggers.js';

    // This component is a combination of a TextComponent and a DropdownComponent.
    // The TextComponent is shown in non-editable state until it becomes editable,
    // then the Dropdown also appears. When the text in the TextComponent alters,
    // the options in the dropdown are filtered based on the text and the caret position
    // within the text.
    import TextComponent from './TextComponent.svelte';
    import DropdownComponent from './DropdownComponent.svelte';
    import ArrowForward from './images/ArrowForward.svelte';
    import { componentId } from '$lib/index.js';
    import {
        type AbstractChoiceBox,
        ARROW_DOWN,
        ARROW_UP,
        ENTER,
        isActionBox,
        isSelectBox,
        isReferenceBox,
        type SelectOption,
        TextBox,
        BehaviorExecutionResult,
        isNullOrUndefined
    } from '@freon4dsl/core';
    import type { FreComponentProps } from '$lib/components/svelte-utils/FreComponentProps.js';
    import { selectedBoxes } from '$lib/components/stores/AllStores.svelte.js';
    import { clickOutsideConditional } from '$lib';
    import { type CaretDetails } from '$lib/components/svelte-utils/CaretDetails';
    import { onMount } from 'svelte';

    const LOGGER = TEXTDROPDOWN_LOGGER;

    // Props
    let { editor, box }: FreComponentProps<AbstractChoiceBox> = $props();
    // the textbox that is to be coupled to the TextComponent part
    let textBox: TextBox = $state(box.textBox)!; // NB the initial value must be here, the effect starts to function after initialization
    // True if box is a referencebox and referred is in the same unit
    let selectAbleReference: boolean = $state(false)
    
    $effect(() => {
        // keeps the textBox variable in state with the box!
        textBox = box?.textBox;
    });

    onMount(() => {
        LOGGER.log(`${box.id}: onMount`);
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
        selectAbleReference = isReferenceBox(box) && box.isSelectAble()
    });

    let id: string = $state(''); // an id for the html element
    id = !isNullOrUndefined(box) ? componentId(box) : 'textdropdown-with-unknown-box';
    let isEditing: boolean = $state(false); // becomes true when the text field gets focus
    let dropdownShown: boolean = $state(false); // when true the dropdown element is shown
    let text: string = $state(''); // the text in the text field
    let selected: SelectOption | undefined = $state(undefined); // the selected option in the dropdown
    let filteredOptions: SelectOption[] = $state([]); // the list of filtered options that are shown in the dropdown
    let allOptions: SelectOption[]; // all options as calculated by the editor
    let textComponent: TextComponent;

    let setText = (value: string) => {
        LOGGER.log(`${box.id}: setting text to '${value}'`);
        if (isNullOrUndefined(value)) {
            text = '';
        } else {
            text = value;
        }
    };

    const noOptionsId = 'noOptions'; // constant for when the editor has no options

    // the function used to calculate all_options, called by onClick and setFocus
    let getOptions = (): SelectOption[] => {
        LOGGER.log('getOptions for ' + box?.id)
        let result = box?.getOptions(editor);
        if (isNullOrUndefined(result)) {
            result = [{ id: noOptionsId, label: '<no known options>' }];
        }
        return result;
    };

    /**
     * This function sets the focus on this element programmatically.
     */
    const setFocus = () => {
        LOGGER.log('TextDropdownComponent.setFocus ' + box.kind + id);
        if (!isNullOrUndefined(textComponent)) {
            textComponent.setFocus();
        } else {
            LOGGER.error('TextDropdownComponent ' + id + ' has no textComponent');
        }
    };

    function setTextLocalAndInBox(text: string) {
        box.textHelper.setText(text);
        setText(text);
    }

    const setFiltered = (options: SelectOption[]): void => {
        LOGGER.log(`setFiltered ${options.map((o) => o.label)}`);
        filteredOptions = options;
    };

    /**
     * This function is executed whenever there is a change in the box model.
     * It sets the text in the box, if this is a SelectBox.
     */
    const refresh = (why?: string) => {
        LOGGER.log(`${box.id}: refresh: ` + why + ' for ' + box?.kind);
        if (isSelectBox(box)) {
            let selectedOption = box.getSelectedOption();
            LOGGER.log('    selectedOption is ' + selectedOption?.label);
            if (!isNullOrUndefined(selectedOption)) {
                setTextLocalAndInBox(selectedOption.label);
                selected = selectedOption;
            } else {
                selected = undefined;
            }
        }
        // NB Not in an else if, because isSelectBox() is also true for ReferenceBox
        if (isReferenceBox(box)) {
            selectAbleReference = box.isSelectAble()
            LOGGER.log("     selectAble is " + selectAbleReference)
        }
        // because the box maybe a different one than we started with ...
        // box.setFocus = setFocus; todo remove?
    };

    /**
     * This function is triggered when the text in the textComponent is altered or when the
     * caret position is changed.
     * Based on the (altered) text and the caret position within the text, the list of options
     * in the dropdownComponent is changed.
     * @param details
     */
    const textUpdate = (details: CaretDetails) => {
        LOGGER.log(
            `textUpdate for ${box.kind}: ${JSON.stringify(details)}, start: ${text.substring(0, details.caret)}`
        );
        if (!dropdownShown) {
            showDropdown();
        }
        allOptions = getOptions();
        setFiltered(
            allOptions.filter((o) => o.label.startsWith(text.substring(0, details.caret)))
        );
        makeFilteredOptionsUnique();
        // Only one option and has been fully typed in, use this option without waiting for the ENTER key
        LOGGER.log(
            `textUpdate: (${filteredOptions.length}, ${filteredOptions[0]?.label}, ${filteredOptions[0]?.label?.length}`
        );
        if (
            filteredOptions.length === 1 &&
            filteredOptions[0].label === text &&
            filteredOptions[0].label.length === details.caret
        ) {
            storeOrExecute(filteredOptions[0]);
            return;
        }
        if (isActionBox(box)) {
            // Try to match a regular expression, and execute the action that is associated with it
            const result = box.tryToMatchRegExpAndExecuteAction(text, editor);
            if (result === BehaviorExecutionResult.EXECUTED) {
                endEditing();
            }
        }
    };

    const caretChanged = (details: CaretDetails) => {
        LOGGER.log(
            `caretChanged for ${box.kind}: ` +
                JSON.stringify(details) +
                ', start: ' +
                text.substring(0, details.caret)
        );
        allOptions = getOptions();
        setFiltered(
            allOptions.filter((o) => o.label.startsWith(text.substring(0, details.caret)))
        );
        makeFilteredOptionsUnique();
    };

    const hideDropdown = () => {
        dropdownShown = false;
    };

    const showDropdown = () => {
        dropdownShown = true;
    };

    function makeFilteredOptionsUnique() {
        // remove doubles, to avoid errors
        const seen: string[] = [];
        const result: SelectOption[] = [];
        filteredOptions.forEach((option) => {
            if (seen.includes(option.label)) {
                LOGGER.log('Option ' + JSON.stringify(option) + ' is a duplicate');
            } else {
                seen.push(option.label);
                result.push(option);
            }
        });
        setFiltered(result);
    }
    function selectLastOption() {
        if (dropdownShown) {
            if (filteredOptions?.length !== 0) {
                selected = filteredOptions[filteredOptions.length - 1];
            } else {
                // there are no valid options left
                editor.setUserMessage('no valid selection');
            }
        }
    }

    function selectFirstOption() {
        if (dropdownShown) {
            if (filteredOptions?.length !== 0) {
                selected = filteredOptions[0];
            } else {
                // there are no valid options left
                editor.setUserMessage('No valid selection');
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
        LOGGER.log(
            'XX onKeyDown: ' +
                id +
                ' [' +
                event.key +
                '] alt [' +
                event.altKey +
                '] shift [' +
                event.shiftKey +
                '] ctrl [' +
                event.ctrlKey +
                '] meta [' +
                event.metaKey +
                ']' +
                ', selected?.id: ' +
                selected?.id +
                ' dropdown:' +
                dropdownShown +
                ' editing:' +
                isEditing
        );
        if (dropdownShown) {
            if (!event.ctrlKey && !event.altKey) {
                switch (event.key) {
                    case ARROW_DOWN: {
                        if (dropdownShown) {
                            // if stat removed
                            if (!selected) {
                                // there is no current selection: start at the first option
                                selectFirstOption();
                            } else {
                                const index = filteredOptions.findIndex(
                                    (o) => o.id === selected?.id
                                );
                                if (index + 1 < filteredOptions.length) {
                                    // the 'normal' case: go one down
                                    selected = filteredOptions[index + 1];
                                } else if (index + 1 === filteredOptions.length) {
                                    // the end of the options reached: go to the first
                                    selectFirstOption();
                                }
                            }
                            event.preventDefault();
                            event.stopPropagation();
                        }
                        break;
                    }
                    case ARROW_UP: {
                        if (dropdownShown) {
                            // if stat removed
                            if (!selected) {
                                // there is no current selection, start at the last option
                                selectLastOption();
                            } else {
                                const index = filteredOptions.findIndex(
                                    (o) => o.id === selected?.id
                                );
                                if (index > 0) {
                                    // the 'normal' case: go one up
                                    selected = filteredOptions[index - 1];
                                } else if (index === 0) {
                                    // the beginning of the options reached: go to the last
                                    selectLastOption();
                                }
                            }
                            event.preventDefault();
                            event.stopPropagation();
                        }
                        break;
                    }
                    case ENTER: {
                        // user wants current selection
                        // find the chosen option
                        let chosenOption: SelectOption | null = null;
                        if (filteredOptions.length <= 1) {
                            if (filteredOptions.length !== 0) {
                                // if there is just one option left, choose that one
                                chosenOption = filteredOptions[0];
                            } else {
                                // there are no valid options left
                                editor.setUserMessage('No valid selection');
                            }
                        } else {
                            // find the selected option and choose that one
                            const index = filteredOptions.findIndex((o) => o.id === selected?.id);
                            if (index >= 0 && index < filteredOptions.length) {
                                chosenOption = filteredOptions[index];
                            }
                        }
                        // store or execute the option
                        if (!isNullOrUndefined(chosenOption)) {
                            storeOrExecute(chosenOption);
                        } else {
                            //  no valid option, restore the original text
                            setText(textBox.getText()); // line : using setText
                            // stop editing
                            isEditing = false;
                            hideDropdown();
                            editor.selectNextLeaf();
                        }
                        event.preventDefault();
                        event.stopPropagation();
                        break;
                    }
                    default: {
                        // stop editing todo is this the correct default?
                        isEditing = false;
                        hideDropdown();
                    }
                }
            }
        } else {
            // this component was selected using keystrokes, not by clicking, therefore dropDownShown = false
            if (!event.ctrlKey && !event.altKey) {
                switch (event.key) {
                    case ENTER: {
                        // Check whether there is only one option, if so execute immediately
                        const allOptions = getOptions();
                        if (allOptions.length === 1) {
                            storeOrExecute(allOptions[0]);
                        } else {
                            if (isNullOrUndefined(box.getSelectedOption())) {
                                selected = undefined;
                            } else {
                                selected = box.getSelectedOption()!;
                            }
                            LOGGER.log('Setting selected option to ' + selected?.id);
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
    const itemSelected = (sel: SelectOption) => {
        LOGGER.log('itemSelected ' + selected?.id);
        const index = filteredOptions.findIndex((o) => o === sel);
        if (index >= 0 && index < filteredOptions.length) {
            const chosenOption = filteredOptions[index];
            if (!isNullOrUndefined(chosenOption)) {
                storeOrExecute(chosenOption);
            }
        }
        if (!isSelectBox(box)) {
            // clear text for an action box
            setTextLocalAndInBox('');
        }
        isEditing = false;
        hideDropdown();
    };

    /**
     * This custom event is triggered when the TextComponent gets focus by click.
     * The editor is notified of the newly selected box and the options list is filled.
     */
    const startEditing = (details?: CaretDetails) => {
        LOGGER.log(
            'startEditing detail: ' + JSON.stringify(details) + ` dropDown: ${dropdownShown}`
        );
        isEditing = true;
        showDropdown();
        allOptions = getOptions();
        LOGGER.log(
            `    startEditing allOptions ${allOptions.map((o) => o.label)} dropDown: ${dropdownShown}`
        );
        if (!isNullOrUndefined(details)) {
            if (isNullOrUndefined(text) || text.length === 0) {
                setFiltered(allOptions.filter(() => true));
            } else {
                setFiltered(
                    allOptions.filter((o) => {
                        LOGGER.log(`    startsWith text [${text}], option is ${JSON.stringify(o)}`);
                        return o?.label?.startsWith(text.substring(0, details.caret));
                    })
                );
            }
        } else {
            setFiltered(allOptions.filter((o) => o?.label?.startsWith(text.substring(0, 0))));
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
        LOGGER.log('storeOrExecute for option ' + selected.label + ' ' + box.kind + ' ' + box.role);
        isEditing = false;
        hideDropdown();

        box.executeOption(editor, selected);
        if (isActionBox(box)) {
            // ActionBox, action done, clear input text
            setTextLocalAndInBox('');
        } else {
            editor.selectNextLeaf(box);
        }
    }

    /**
     * This function is called whenever the user ends editing the TextComponent,
     * in whatever manner.
     */
    const endEditing = () => {
        LOGGER.log(
            'endEditing ' + id + ' dropdownShow:' + dropdownShown + ' isEditing: ' + isEditing
        );
        // todo this is strange code, must have a better look
        if (isEditing === true) {
            isEditing = false;
        } else {
            if (dropdownShown === true) {
                hideDropdown();
            }
            return;
        }
        if (dropdownShown) {
            allOptions = getOptions();
            let validOption = allOptions.find((o) => o.label === text);
            if (!!validOption && validOption.id !== noOptionsId) {
                storeOrExecute(validOption);
            } else {
                // no valid option, restore the previous value
                setText(textBox.getText());
            }
            hideDropdown();
        }
    };

    const focusOutTextComponent = () => {
        LOGGER.log('focusOutTextComponent ' + id);
        selected = undefined;
        if (isEditing) {
            endEditing();
        }
    };

    const onBlur = () => {
        // We use onblur instead of onfocusout, because when the user selects an item in the dropdown list,
        // the text component will trigger a focus out event. The focus out event from the text component
        // always comes before the click in the dropdown. If we react to focus out by endEditing(), any click
        // on the dropdown list will have no effect.
        LOGGER.log('onBlur ' + id);
        if (!document.hasFocus() || !selectedBoxes.value.includes(box)) {
            endEditing();
        }
    };

    /**
     * The "click_outside" event was triggered because of `use:clickOutsideConditional`.
     */
    const onClickOutside = () => {
        LOGGER.log('onClickOutside');
        endEditing();
    };

    const selectReferred = (event: Event) => {
        if (isReferenceBox(box)) {
            if (box.isSelectAble()) {
                box.selectReferred(editor);
            } else {
                editor.setUserMessage('Cannot jump to this element.');
            }
            event.stopPropagation();
            event.preventDefault();
        }
    };

    /** This function replaces the event handling in version 1.0.0 (for svelte v4). What used to be an event,
     * now is a call to this function, where the param 'eventType' indicates the type of the former event, and
     * 'details' are the information passed by the event.
     *
     * NB Here this function is called 'fromInner', in the child TextComponent it is called 'toParent'.
     * @param eventType
     * @param details
     */
    function fromInner(eventType: string, details?: CaretDetails) {
        switch (eventType) {
            case 'showDropdown': { showDropdown(); break;}
            case 'hideDropdown': { hideDropdown(); break;}
            case 'startEditing': { startEditing(details as CaretDetails); break;} // has details
            case 'caretChanged': { caretChanged(details as CaretDetails); break;} // has details
            case 'textUpdate': { textUpdate(details as CaretDetails); break;} // has details
            case 'endEditing': { endEditing(); break;}
            case 'focusOutTextComponent': { focusOutTextComponent(); break;}
        }
    }

    refresh();
</script>

<span
    {id}
    onkeydown={onKeyDown}
    use:clickOutsideConditional={{ enabled: dropdownShown }}
    onclick_outside={onClickOutside}
    onblur={onBlur}
    oncontextmenu={() => endEditing()}
    tabindex="-1"
    class="text-dropdown-component"
    role="none"
>
    <TextComponent
        {editor}
        box={textBox}
        partOfDropdown={true}
        bind:isEditing
        bind:text
        bind:this={textComponent}
        toParent={fromInner}
    />
    {#if selectAbleReference}
        <button
            class="reference-button"
            {id}
            onclick={(event) => selectReferred(event)}
            tabindex="-1"
        >
            <ArrowForward />
        </button>
    {/if}
    {#if dropdownShown}
        <DropdownComponent
            bind:selected
            bind:options={filteredOptions}
            selectionChanged={itemSelected}
        />
    {/if}
</span>
