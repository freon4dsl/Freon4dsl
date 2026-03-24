<script lang="ts">
    import { TEXT_LOGGER } from "$lib/components/ComponentLoggers"
    import { componentId, type FreComponentProps } from "./index.js"
    import { shouldBeHandledByBrowser } from "./stores/AllStores.svelte"
    import {
        notNullOrUndefined,
        isNullOrUndefined,
        UndefinedRectangle,
        type ClientRectangle,
        FreCaret,
        FreCaretPosition,
        ARROW_LEFT, ENTER, ARROW_RIGHT, BACKSPACE, DELETE, SHIFT,
        CONTROL, ALT, TAB, ESCAPE,
        type AbstractChoiceBox,
        type SelectOption,
        isActionBox,
        isReferenceBox,
        jsonAsString,
        MatchUtil,
    } from "@freon4dsl/core"
    import {
        camelCaseToReadable, canDeleteNextWord, canDeletePreviousWord, canMoveCaretLeft,
        canMoveCaretRight,
        canMoveCaretToEnd,
        canMoveCaretToStart, canUseBackspace, canUseDelete,
        isDeleteNextWordKey, isDeletePreviousWordKey,
        isEndKey,
        isHomeKey,
        isRedoKey,
        isSelectAllKey,
        isUndoKey
    } from "./svelte-utils/TC2-Utils.js"
    import { flushSync, tick } from "svelte"
    import DropdownComponent from "$lib/components/DropdownComponent.svelte"
    import type DropdownCmp from "$lib/components/DropdownComponent.svelte"
    import { portal, useOverlayListeners, usePaneContext } from "./svelte-utils/OverlayPane.js"

    const LOGGER = TEXT_LOGGER;

    type FocusOrigin = "UI" | "editor";
    type CaretPosition = { start: number, end: number };
    type EndEditingReason =
        | "focusout"
        | "enter"
        | "escape"
        | "arrow-left"
        | "arrow-right"
        | "goto-next"
        | "goto-previous"
        | "contextmenu";

    // Props
    let { editor, box, readonly = false }: FreComponentProps<AbstractChoiceBox> = $props();

    // Variables dependent upon the box, the prop 'text' is one of these.
    // an id for the HTML element
    // svelte-ignore state_referenced_locally
    let id: string = $state(notNullOrUndefined(box) ? componentId(box) : 'text-with-unknown-box');
    // the placeholder when value of text component is not present
    // svelte-ignore state_referenced_locally
    let placeholder: string = $state(notNullOrUndefined(box) ? camelCaseToReadable(box.placeholder) : '<..>');
    // variable to remember the text that was in the box previously
    // svelte-ignore state_referenced_locally
    let originalText: string = $state(notNullOrUndefined(box) ? box.getText() : '');
    // The text in the input field, which can differ temporarily from the original text
    // svelte-ignore state_referenced_locally
    let text: string = $state(notNullOrUndefined(box) ? box.getText() : '');
    // variable for styling
    // svelte-ignore state_referenced_locally
    let cssClass: string | undefined = $state(box?.cssClass)

    // Variables for showing errors
    let errorCls: string = $state(''); // CSS class name for when the node is erroneous
    let errMess: string[] = $state([]); // error message to be shown when element is hovered
    let hasErr: boolean = $state(false); // indicates whether this box has errors

    // variables for the HTML parts
    let inputElement: HTMLInputElement | undefined = $state();
    let widthSpan: HTMLSpanElement | undefined = $state();
    let readonlyElement: HTMLSpanElement | undefined = $state();
    let inputWidth = $state("1ch");

    // variables for the caret position
    let caretPosition: CaretPosition = $state({ start: -1, end: -1 });

    // variable to guard against loops
    let isEnding = false;

    /* ========	The following variables are extra compared to the TextComponent =========== */

    // The dropdown part of this component
    let dropdownCmp: DropdownCmp | undefined = $state(undefined);
    let dropdownShown: boolean = $state(false); // when true the dropdown element is shown
    let selected: SelectOption | undefined = $state(undefined); // the selected option in the dropdown
    let filteredOptions: SelectOption[] = $state([]); // the list of filtered options that are shown in the dropdown
    let allOptions: SelectOption[] = $state([]); // all options from the box
    let useFilteredDropdown: boolean = $state(false); // which type of dropdown to use todo get this value from the edit config */
    const noOptionsId = 'noOptions'; // constant for when the box has no options

    // Elements for the use of the overlay to position the dropdown menu
    const pane = usePaneContext();
    let overlayRoot = $derived(pane?.getOverlayRoot() ?? null)
    let dropdownAnchorEl: HTMLElement | null = $state(null)
    let dropdownPanelEl: HTMLElement | null = $state(null)
    let dropdownContentEl: HTMLElement | null = $state(null)
    const listeners = useOverlayListeners(() => ({
        pane,
        enabled: dropdownShown,
        closeFunc: hideDropdown,
        inside: [dropdownAnchorEl, dropdownPanelEl, dropdownContentEl],
        closeOnResize: true,
    }));


    /*********************************************************************
     * Functions needed in every Freon component
     * *******************************************************************/
    /**
     * This function is called from the box, whenever the values in the box change.
     * This function updates that part of the state of this component which reflects the state of the box.
     * @param why
     */
    const refresh = (why?: string) => {
        LOGGER.log(
            `${id}: REFRESH why ${why}: (${box?.node?.freLanguageConcept()}) box text '${box?.getText()}' text '${text}'`
        );

        if (notNullOrUndefined(box)) {
            const newPlaceholder = camelCaseToReadable(box.placeholder);
            if (placeholder !== newPlaceholder) placeholder = newPlaceholder;

            const newOriginalText = box.getText() ?? "";
            if (originalText !== newOriginalText) originalText = newOriginalText;
            if (box.hasError) {
                errorCls = 'text-component-text-error';
                errMess = box.errorMessages;
                hasErr = true;
            } else {
                errorCls = '';
                errMess = [];
                hasErr = false;
            }
            cssClass = box.cssClass;

            // do not override text that the user is currently typing
            const isFocusedHere = document.activeElement === inputElement;
            if (!isFocusedHere && text !== newOriginalText) {
                text = newOriginalText;
            }
        }
    };
    export async function setFocus(): Promise<void> {
        await focusInput("editor");
    }
    /* effect to keep the box in sync */
    $effect(() => {
        LOGGER.log(`"effect box is ${box?.id}`)
        if (notNullOrUndefined(box)) {
            box.setFocus = setFocus
            box.refreshComponent = refresh
            box.getClientRectangle = clientRectangle
            // the following are needed for copy/cut/paste from the webapp
            // box.setCaret = calculateCaret;
            // box.getSelectedText = getSelectedText;
            // box.insertAtSelection = insertAtSelection;
            // box.deleteSelection = deleteSelection;
        }
    })
    /*********************************************************************
     * END Functions needed in every Freon component
     * *******************************************************************/

    /*********************************************************************
     * Helper functions
     * *******************************************************************/
    function hasChanges(): boolean {
        return text !== originalText;
    }
    /*********************************************************************
     * END Helper functions
     * *******************************************************************/

    /*********************************************************************
     * Functions to get the width of the element correct
     * *******************************************************************/
    /* effect to keep the width of the HTML correct */
    $effect(() => {
        // make this effect reactive to model changes
        text;
        placeholder;

        if (!readonly && widthSpan && inputElement) {
            setInputWidth();
        }
    });
    /**
     * Sets the input width to match the text inside.
     * Copy text from <input> into the <span> with position = absolute and takes the rendered span width.
     * See https://dev.to/matrixersp/how-to-make-an-input-field-grow-shrink-as-you-type-513l
     */
    function setInputWidth() {
        // Note that when the component is mounted (i.e. during onMount), the widthSpan and inputElement variables
        // do not yet have a value. Therefore, it is not useful to call this function from onMount!
        if (!!widthSpan && !!inputElement) {
            LOGGER.log(`setInputWidth for ${box?.id}`);
            let value = text ?? "";

            if (value.length === 0) {
                value = placeholder;
                if (value.length === 0) {
                    value = " ";
                }
            }

            // Ensure that HTML tags in value are encoded, otherwise they will be seen as HTML => done by textContent.
            widthSpan.textContent = value;
            inputWidth = `${widthSpan.offsetWidth + 2}px`; // small buffer for caret
        }
    }
    /*********************************************************************
     * END Functions to get the width of the element correct
     * *******************************************************************/

    /*********************************************************************
     * Functions that react when this component gets focus either through
     * the browser or from the editor
     * *******************************************************************/
    async function focusInput(from: FocusOrigin): Promise<void> {
        console.log(`focusInput for ${box?.id} from ${from}`);

        if (!inputElement || !box) {
            LOGGER.error("focusInput: no inputElement or box");
            return;
        }

        flushSync(); // make sure DOM/state are current
        isEnding = false;

        if (from === "UI") {
            // User interaction means the editor must be told which box is selected.
            // We do NOT touch the caret, because the browser already knows where it should go.
            if (editor.selectedBox !== box) { // Guards against a loop because editor.selectElementForBox calls setFocus!!!
                editor.selectElementForBox(box);
            }
            // inputElement already has focus, because this is called from onFocusIn
            return;
        }

        const alreadyFocused = document.activeElement === inputElement;

        if (from === "editor") {
            if (alreadyFocused) {
                console.log("skip focus/selection: already focused");
                return;
            }

            // The editor already knows this box is selected; now mirror the editor caret in the input.
            calculateCaret(editor.selectedCaretPosition);

            inputElement.focus();

            const fromPos = caretPosition.start >= 0 ? caretPosition.start : 0;
            const toPos = caretPosition.end >= 0 ? caretPosition.end : fromPos;

            console.log(`focusInput setting selection ${fromPos} ${toPos}`);
            inputElement.setSelectionRange(fromPos, toPos);
        }
    }
    function onFocusIn(): void {
        void focusInput("UI");
    }
    /**
     * This function determines the caret position of the <input> element programmatically.
     * The caret position is stored in 'from' and 'to', and used in 'startEditing'.
     * @param freCaret
     */
    function calculateCaret(freCaret: FreCaret): void {
        LOGGER.log(`${id}: setCaret ${freCaret.position} [${freCaret.from}, ${freCaret.to}]`);
        // No need to flush any pending updates, method is being called from the box.
        const currentValue = inputElement?.value ?? text ?? "";
        switch (freCaret.position) {
            case FreCaretPosition.RIGHT_MOST: // type nr 2
                caretPosition.start = caretPosition.end = currentValue.length;
                break;
            case FreCaretPosition.LEFT_MOST: // type nr 1
                caretPosition.start = 0;
                caretPosition.end = 0;
                break;
            case FreCaretPosition.UNSPECIFIED: // type nr 0
                caretPosition.start = 0;
                caretPosition.end = currentValue.length;
                break;
            case FreCaretPosition.INDEX: // type nr 3
                const len = currentValue.length;
                // make sure the given position is within the current text
                caretPosition.start = Math.max(0, Math.min(freCaret.from, len));
                caretPosition.end = Math.max(caretPosition.start, Math.min(freCaret.to, len));
                break;
            default:
                caretPosition.start = 0;
                caretPosition.end = currentValue.length;
                break;
        }
    }
    /************************************************************************
     * END Functions that react when this component gets focus either through
     * the browser or from the editor
     * **********************************************************************/

    /*********************************************************************
     * Functions handling the exit of this component
     * *******************************************************************/
    function endEditing(reason: EndEditingReason): void {
        if (isEnding) return;
        isEnding = true;
        LOGGER.log(`${id}: endEditing because ${reason}`);
        if (!box) return;

        if (reason === "escape") { // canceled by user
            // revert to original value
            text = originalText ?? "";
            setInputWidth();
            return;
            // Note that onFocusOut() may still run afterward and call:  endEditing("focusout");
            // To avoid a loop, the variable 'isEnding' is set.
        }

        if (dropdownShown) {
            allOptions = getOptions();
            let matchingOptions: SelectOption[] = MatchUtil.fullMatchingOptions(text, allOptions)
            if (matchingOptions.length === 1 && MatchUtil.isPrefixOf(text, matchingOptions[0].label)) {
                box.executeOption(editor, matchingOptions[0]); // the result of the execution is ignored
                if (isActionBox(box)) {
                    // ActionBox, action done, clear input text
                    text = '';
                }
            } else {
                // no valid option, restore the previous value
                text = originalText;
            }
            hideDropdown()
        } else {
            text = originalText;
        }
    }
    function onFocusOut(_event: FocusEvent): void {
        endEditing("focusout");
    }
    /*********************************************************************
     * END Functions handling the exit of this component
     * *******************************************************************/

    /*********************************************************************
     * Functions for handling keyboard events
     * *******************************************************************/
    function onInput(_event: Event): void {
        setInputWidth();
    }
    function onKeyDown(event: KeyboardEvent): void {
        LOGGER.log(
            `${id}: onKeyDown key=[${event.key}] ` +
            `alt=[${event.altKey}] shift=[${event.shiftKey}] ` +
            `ctrl=[${event.ctrlKey}] meta=[${event.metaKey}]`
        );

        const isCommandKey = event.ctrlKey || event.metaKey;

        // TAB or Shift-TAB → browser handles it
        if (event.key === TAB) {
            return;
        }
        // Pure modifier keys → ignore
        if (
            event.key === SHIFT ||
            event.key === CONTROL ||
            event.key === ALT ||
            event.key === "Meta"
        ) {
            return;
        }
        // Select All
        if (isSelectAllKey(event)) {
            return;
        }
        // Undo / Redo
        //    If hasChanges() → browser handles it
        //    else → Freon handles it
        if (isUndoKey(event) || isRedoKey(event)) {
            if (hasChanges()) {
                shouldBeHandledByBrowser.value = true;
                return;
            } else {
                shouldBeHandledByBrowser.value = false;
                return;
            }
        }
        // ENTER → endEditing
        if (event.key === ENTER) {
            event.preventDefault();
            event.stopPropagation();
            endEditing("enter");
            // go to the next editable element
            editor.selectNextLeaf();
            return;
        }
        // ESCAPE -> restore old value
        if (event.key === ESCAPE) {
            event.preventDefault();
            event.stopPropagation();
            endEditing("escape");
            // go to the next editable element
            editor.selectNextLeaf();
            return;
        }
        // HOME
        // If caret/selection can still move to start -> browser
        // else -> let Freon component handle it
        if (isHomeKey(event)) {
            if (!canMoveCaretToStart(inputElement)) {
                event.preventDefault();
                event.stopPropagation();
            }
            // TODO should FreonComponent handle this key stroke?
        }
        // END
        // If caret/selection can still move to end -> browser
        // else -> let Freon component handle it
        if (isEndKey(event)) {
            if (!canMoveCaretToEnd(inputElement)) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            // TODO should FreonComponent handle this key stroke?
        }
        // Ctrl+Backspace
        // Delete previous word if possible -> browser
        // else -> let Freon component handle it
        if (isDeletePreviousWordKey(event)) {
            if (!canDeletePreviousWord(inputElement)) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            // TODO should FreonComponent handle this key stroke?
        }
        // Ctrl+Delete
        // Delete next word if possible -> browser
        // else -> let Freon component handle it
        if (isDeleteNextWordKey(event)) {
            if (!canDeleteNextWord(inputElement)) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            // TODO should FreonComponent handle this key stroke?
        }
        // ARROW_LEFT
        //    Move caret in input if possible;
        //    otherwise let Freon select previous editable node
        if (event.key === ARROW_LEFT) {
            if (!canMoveCaretLeft(inputElement)) {
                endEditing('arrow-left');
                editor.selectPreviousLeafIncludingExpressionPreOrPost();
                event.preventDefault();
                event.stopPropagation();
                return;
            } else {
                event.stopPropagation();
                return;
            }
        }
        // ARROW_RIGHT
        //    Move caret in input if possible;
        //    otherwise let Freon select next editable node
        if (event.key === ARROW_RIGHT) {
            if (!canMoveCaretRight(inputElement)) {
                endEditing('arrow-right');
                editor.selectNextLeafIncludingExpressionPreOrPost();
                event.preventDefault();
                event.stopPropagation();
                return;
            } else {
                event.stopPropagation();
                return;
            }
        }
        // BACKSPACE
        //    If browser can still delete something here → browser
        //    else → Freon handles it?
        if (event.key === BACKSPACE) {
            if (canUseBackspace(inputElement)) {
                event.stopPropagation();
                return;
            } else {
                // todo decide how to handle this
                event.stopPropagation();
                event.preventDefault();
                return;
            }
        }
        // DELETE
        //    If browser can still delete something here → browser
        //    else → Freon handles it?
        if (event.key === DELETE) {
            if (canUseDelete(inputElement)) {
                event.stopPropagation();
                return;
            } else {
                // todo decide how to handle this
                event.stopPropagation();
                event.preventDefault();
                return;
            }
        }
        // Other command / alt combinations
        //    Leave for later or Freon-specific handling
        if (event.altKey || isCommandKey) {
            return;
        }
        // Default case:
        //     normal typing → browser handles it
    }
    /*********************************************************************
     * END Functions for handling keyboard events
     * *******************************************************************/
    
    /*********************************************************************
     * Functions for copy, cut and paste
     * *******************************************************************/
    function getSelectedText(): string {
        flushSync(); // flush any pending updates

        if (!inputElement) {
            return "";
        }

        const value = inputElement.value ?? text ?? "";
        const start = Math.max(0, inputElement.selectionStart ?? 0);
        const end = Math.max(start, inputElement.selectionEnd ?? start);

        inputElement.focus();                      // important, because focus is on the copy button
        return value.slice(start, end);
    }
    function deleteSelection(): void {
        flushSync(); // ensure DOM and state are aligned

        if (!inputElement) return;

        const value = inputElement.value ?? text ?? "";
        const start = inputElement.selectionStart ?? 0;
        const end = inputElement.selectionEnd ?? start;

        if (start === end) {
            // nothing selected → nothing to delete
            return;
        }

        const newValue = value.slice(0, start) + value.slice(end);

        // update both DOM and state
        inputElement.value = newValue;
        text = newValue;

        inputElement.focus();  // important, because focus is on the cut button
        // restore caret position
        inputElement.setSelectionRange(start, start);

        // keep autosize in sync
        setInputWidth();
    }
    function insertAtSelection(insertedText: string): void {
        flushSync();

        if (!inputElement) return;

        const safeInsert = insertedText ?? "";
        const value = inputElement.value ?? text ?? "";
        const start = Math.max(0, inputElement.selectionStart ?? 0);
        const end = Math.max(start, inputElement.selectionEnd ?? start);

        const newValue = value.slice(0, start) + safeInsert + value.slice(end);
        const newCaret = start + safeInsert.length;

        inputElement.value = newValue;
        text = newValue;
        inputElement.focus();                      // important, because focus is on the paste button
        inputElement.setSelectionRange(newCaret, newCaret);
        // editor.selectElementForBox(box);           // keeps editor selection aligned
        setInputWidth();
    }
    async function onPaste(e: ClipboardEvent) {
        LOGGER.log('TextDropdownComponent onPaste');
        shouldBeHandledByBrowser.value = true;
    }
    async function onCopy(e: ClipboardEvent) {
        LOGGER.log('TextDropdownComponent onCopy');
        shouldBeHandledByBrowser.value = true;
    }
    async function onCut(e: ClipboardEvent) {
        LOGGER.log('TextDropdownComponent onCut');
        shouldBeHandledByBrowser.value = true;
    }
    /*********************************************************************
     * END Functions for copy, cut and paste
     * *******************************************************************/

    const clientRectangle = (): ClientRectangle => {
        LOGGER.log(
            `clientRectangle: ${box?.id} input ${!inputElement} readonly ${!readonlyElement}`
        );

        if (notNullOrUndefined(inputElement)) {
            return inputElement.getBoundingClientRect();
        }
        if (notNullOrUndefined(readonlyElement)) {
            return readonlyElement.getBoundingClientRect();
        }
        return UndefinedRectangle;
    };

    /*********************************************************************
     * Functions for the dropdown
     * *******************************************************************/
    /* Helper function, to not repeat this everywhere */
    const setFiltered = (options: SelectOption[]): void => {
        console.log(`setFiltered ${options.map((o) => o.label)}`);
        filteredOptions = options;
    };

    let getOptions = (): SelectOption[] => {
        LOGGER.log(`getOptions for box(${box.id})` + box?.id)
        let result = box?.getOptions(editor);
        if (isNullOrUndefined(result)) {
            return [{ id: noOptionsId, label: '<no known options>' }];
        } else {
            return  makeOptionsUnique(result);
        }
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

    /* Function to handle dropdown positioning */
    function updateDropdownPos() {
        if (!dropdownAnchorEl || !dropdownPanelEl || !dropdownContentEl || !overlayRoot) return;

        const a = dropdownAnchorEl.getBoundingClientRect(); // viewport coords
        const p = dropdownContentEl.getBoundingClientRect();  // current size
        const o = overlayRoot.getBoundingClientRect();      // overlay coords

        const ow = o.width;
        const oh = o.height;

        // anchor position relative to overlay
        const anchorLeft = a.left - o.left;
        const anchorTop = a.top - o.top;
        const anchorBottom = a.bottom - o.top;

        // prefer below
        let left = anchorLeft;
        let top = anchorBottom;

        // if overflow right, shift left
        if (left + p.width > ow) {
            left = Math.max(0, ow - p.width);
        }

        // if overflow bottom, flip above
        if (top + p.height > oh) {
            top = Math.max(0, anchorTop - p.height);
        }

        // final clamp
        left = Math.max(0, Math.min(left, ow - p.width));
        top = Math.max(0, Math.min(top, oh - p.height));

        // make the dropdown height dependent on the available space
        const spaceBelow = oh - anchorBottom;
        const availableHeight =
            top === anchorBottom ? spaceBelow : anchorTop;

        dropdownPanelEl.style.left = `${left}px`;
        dropdownPanelEl.style.top = `${top}px`;
        dropdownPanelEl.style.minWidth = `${a.width}px`;
        dropdownContentEl.style.maxHeight = `${availableHeight}px`;
    }

    /* Function to handle dropdown closing */
    const hideDropdown = () => {
        dropdownShown = false;
        listeners.detach();
    };

    /* Function to handle dropdown opening */
    const showDropdown = async () => {
        console.log(`showDropdown: allOptions: ${box.getOptions(editor).map(o => o.id)}, box: ${box?.getSelectedOption()?.id}`)
        dropdownShown = true;
        // wait until DOM updates and styles/layout settle
        await tick();
        // wait two more frames
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        updateDropdownPos();
        listeners.attach();
    };

    /* Helper function to make sure that the list in the dropdown has unique elements */
    // todo this should be done in the box: getSelectedOption() should yield a unique list
    function makeOptionsUnique(options: SelectOption[]): SelectOption[] {
        console.log(`makeOptionsUnique options: ${options.map(o => o.label)}`);
        // Remove doubles, to avoid errors. Check on the id, because identical labels are allowed!
        const seen: string[] = [];
        const result: SelectOption[] = [];
        options.forEach((option) => {
            if (seen.includes(option.id)) {
                console.log(`makeOptionsUnique.Option box(${box.id})` + jsonAsString(option) + ' is a duplicate');
            } else {
                seen.push(option.id);
                result.push(option);
            }
        });
        return result;
    }
    /**
     * This custom event is triggered by a click in the dropdown. The option that is clicked
     * is set as text in the <input> and the editing state is ended.
     */
    const itemSelected = (sel: SelectOption) => {
        console.log(`itemSelected box(${box.id}) '${selected?.id}', allOptions: ${allOptions.map(o => o.label)}`);
        const index = allOptions.findIndex((o) => o.id === sel.id);
        if (index >= 0 && index < allOptions.length) {
            const chosenOption = allOptions[index];
            if (notNullOrUndefined(chosenOption)) {
                box.executeOption(editor, chosenOption); // the result of the execution is ignored
                if (isActionBox(box)) {
                    // ActionBox, action done, clear input text
                    text = '';
                }
            }
        }
        if (isActionBox(box)) {
            // clear text for an action box
            text = '';
        }
        // isEditing = false;
        hideDropdown();
    };
    /*********************************************************************
     * END Functions for the dropdown
     * *******************************************************************/

</script>

{#if readonly}
    <span class={`${cssClass ?? ""} text-dropdown-component`}>
        <span
            class="text-dropdown-component-input readonly"
            bind:this={readonlyElement}
        >
            {#if text && text.length > 0}
                {text}
            {:else}
                <span class="text-dropdown-component-placeholder">
                    {placeholder}
                </span>
            {/if}
        </span>
    </span>
{:else}
    <span
        {id}
        bind:this={dropdownAnchorEl}
        onkeydown={onKeyDown}
        oncontextmenu={() => endEditing("contextmenu")}
        tabindex="-1"
        class="text-dropdown-component {cssClass}"
        role="none"
    >
        <span class={`${cssClass ?? ""} text-dropdown-component`}>
            <input
                type="text"
                class="text-dropdown-component-input"
                style={`width: ${inputWidth};`}
                id="{id}-input"
                bind:this={inputElement}
                bind:value={text}
                oninput={onInput}
                onfocusin={onFocusIn}
                onfocusout={onFocusOut}
                onkeydown={onKeyDown}
                onpaste={onPaste}
                oncopy={onCopy}
                oncut={onCut}
                {placeholder}
                autocomplete="off"
                autocapitalize="off"
                spellcheck="false"
                name="freon_text_component"
            />

            <span class="text-dropdown-component-width" bind:this={widthSpan}></span>
        </span>
        {#if dropdownShown}
            <div
                class="text-dropdown-panel"
                use:portal={overlayRoot}
                bind:this={dropdownPanelEl}
            >
                <div class="dropdown-component-container" bind:this={dropdownContentEl}>
                    <DropdownComponent
                        bind:this={dropdownCmp}
                        bind:selected
                        bind:allOptions={allOptions}
                        bind:matchingOptions={filteredOptions}
                        selectionChanged={itemSelected}
                        filterOptions={useFilteredDropdown}
                    />
                </div>
            </div>
        {/if}
    </span>
{/if}

<style>
    .text-dropdown-component {
        font-size: var(--freon-inline-font-size);
        line-height: var(--freon-inline-line-height);
        height: var(--freon-inline-height);
        padding-inline: var(--freon-inline-padding-x);
    }
    /* === The magic: make input look like text === */
    .text-dropdown-component-input {
        border: none;
        outline: none;
        background: transparent;

        margin: 0;
        padding: 0;

        font: inherit;
        color: inherit;
        line-height: inherit;
        letter-spacing: inherit;

        min-width: 1ch;

        cursor: text;
        box-sizing: border-box;
        /*border-bottom: 1px solid transparent;*/
        /*transition: background-color 0.12s ease, border-color 0.12s ease;*/
    }

    /* optional: subtle editing affordance */
    .text-dropdown-component-input:focus {
        outline: none;
        /*border-bottom: 1px solid var(--color-accent);*/
        /*background-color: rgba(0, 0, 0, 0.05);*/
    }

    /* placeholder should look like text placeholder, not browser default */
    .text-dropdown-component-input::placeholder {
        color: inherit;
        opacity: 0.5;
    }

    /* hidden span for measuring width */
    .text-dropdown-component-width {
        position: absolute;
        visibility: hidden;
        white-space: pre;
        box-sizing: border-box;

        line-height: inherit;
        padding: 0;
        margin: 0;
        border: none;
        font: inherit;
        letter-spacing: inherit;
        line-height: inherit;
    }

    .text-dropdown-component-input.readonly {
        display: inline-block;
        min-width: 1ch;
        white-space: pre;
        cursor: default;
        /*transition: none;*/
    }

    .text-dropdown-component-placeholder {
        opacity: 0.5;
        display: inline-block;
    }
</style>
