<script lang="ts">
    import { TEXTDROPDOWN_LOGGER } from "./ComponentLoggers.js"
    import {
        componentId, computeInputWidth, deleteSelectionFromInput,
        type FreComponentProps,
        getSelectedTextFromInput, insertAtSelectionInInput,
        resetCaretPosition,
        type TextInputClipboardContext
    } from "./index.js"
    import { shouldBeHandledByBrowser } from "./stores/AllStores.svelte"
    import {
        notNullOrUndefined,
        isNullOrUndefined,
        UndefinedRectangle,
        type ClientRectangle,
        FreCaret,
        ARROW_LEFT, ARROW_UP, ARROW_DOWN, ENTER, ARROW_RIGHT, BACKSPACE, DELETE, SHIFT,
        CONTROL, ALT, TAB, ESCAPE,
        type AbstractChoiceBox,
        type SelectOption,
        isActionBox,
        isReferenceBox,
        isSelectBox,
        MatchUtil, BehaviorExecutionResult,
        isExpressionPreOrPost
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
    } from "./svelte-utils/TextComponentUtils.js"
    import { flushSync, tick } from "svelte"
    import DropdownComponent from "./DropdownComponent.svelte"
    import type DropdownCmp from "./DropdownComponent.svelte"
    import { portal, useOverlayListeners, usePaneContext } from "./svelte-utils/OverlayPane.js"
    import ArrowUp from "./images/ArrowUp.svelte"
    import ErrorTooltip from './ErrorTooltip.svelte';
    import ErrorMarker from './ErrorMarker.svelte';
    import { computeDropdownLayout } from "$lib/components/svelte-utils/DropdownUtils.js"

    const LOGGER = TEXTDROPDOWN_LOGGER;

    type BoxType = 'action' | 'select';
    type FocusOrigin = "UI" | "editor";
    type CaretPosition = { start: number, end: number };
    type EndEditingReason =
        | "cancelled"       // the user has canceled the action
        | "matched";        // the user selection has been executed

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
    // True if box is a reference box and referred is in the same unit
    let selectAbleReference: boolean = $state(false)
    // indicates which type of box we are dealing with
    let boxType: BoxType = $derived(isActionBox(box) ? 'action'  : 'select' );
    // Indicates whether the user can use the TAB key to enter this component.
    // Tab skips spaces before and after operators, which have specific roles.
    // todo still needed?
    let tabindex: number = $derived(notNullOrUndefined(box?.role)
        ? isExpressionPreOrPost(box)
            ? -1
            : 0
        : 0);

    // Variables for showing errors
    let errorCls: string = $state(''); // CSS class name for when the node is erroneous
    let errMess: string[] = $state([]); // error message to be shown when element is hovered
    let hasErr: boolean = $state(false); // indicates whether this box has errors

    // Variables for the HTML parts
    let inputElement: HTMLInputElement | undefined = $state();
    let widthSpan: HTMLSpanElement | undefined = $state();
    let readonlyElement: HTMLSpanElement | undefined = $state();
    let inputWidth = $state("1ch");

    // Variables for the caret position
    let caretPosition: CaretPosition = $state({ start: -1, end: -1 });

    // Variable to let us know whether to open the dropdown when this component receives focus
    let openDropdownOnFocus = $state(false);

    // Variable to let us know whether auto execution behavior is expected when this component receives focus
    // This is the case when the box is an actionBox, and only one option is available in allOptions.
    let autoExecuteSingleActionOnFocus = $state(false);

    /* ========	The following variables are extra compared to the TextComponent =========== */

    // The dropdown part of this component
    let dropdownCmp: DropdownCmp | undefined = $state(undefined);
    let dropdownShown: boolean = $state(false); // when true the dropdown element is shown
    let selected: SelectOption | undefined = $state(undefined); // the selected option in the dropdown
    let filteredOptions: SelectOption[] = $state([]); // the list of filtered options that are shown in the dropdown
    let allOptions: SelectOption[] = $state([]); // all options from the box
    let useFilteredDropdown: boolean = $state(false); // which type of dropdown to use todo get this value from the edit config */
    const noOptions: SelectOption = { id: 'noOptions', label: '<no known options>' }; // constant for when the box has no options

    // Elements for the use of the overlay to position the dropdown menu
    const pane = usePaneContext();
    let overlayRoot: HTMLElement | null = $state(null);
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
            text = box.getText()

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
            if (isSelectBox(box)) {
                // box may use a null value, which we cannot pass to dropdown
                // therefore, we alter it here.
                const tmp = box.getSelectedOption();
                if (isNullOrUndefined(tmp)) {
                    selected = undefined;
                } else {
                    selected = tmp;
                }
            }
            // NB Not in an else if, because isSelectBox() is also true for ReferenceBox
            if (isReferenceBox(box)) {
                selectAbleReference = box.isSelectAble()
            }
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
            selectAbleReference = isReferenceBox(box) && box.isSelectAble()
            // the following are needed for copy/cut/paste from the webapp
            box.getSelectedText = getSelectedText;
            box.insertAtSelection = insertAtSelection;
            box.deleteSelection = deleteSelection;
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
    function executeOption(option: SelectOption): void {
        LOGGER.log(`executeOption`)
        box.executeOption(editor, option); // the result of the execution is ignored
        if (isActionBox(box)) {
            // ActionBox, action done, clear input text
            text = '';
        } else {
            // set it here, because the loop setting the model element back to the input takes too long
            text = option.label;
        }
        endEditing("matched");
    }

    function executeSingleAction(): boolean {
        if (isActionBox(box) && allOptions.length === 1 && allOptions[0].id !== noOptions.id) {
            openDropdownOnFocus = false; // reset just to be sure
            executeOption(allOptions[0]);
            // todo the selection is not right after execution, it should be the first editable child of the new node
            return true;
        }
        return false
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
            inputWidth = computeInputWidth(text, placeholder, widthSpan);
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
        LOGGER.log(`focusInput for ${box?.id} from ${from} boxText is ${box.getText()}`);

        if (!inputElement || !box) {
            LOGGER.error("focusInput: no inputElement or box");
            return;
        }

        flushSync(); // make sure DOM/state are current

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
                LOGGER.log("skip focus/selection: already focused");
                return;
            }

            // The editor already knows this box is selected; now mirror the editor caret in the input.
            calculateCaret(editor.selectedCaretPosition);

            inputElement.focus();

            const fromPos = caretPosition.start >= 0 ? caretPosition.start : 0;
            const toPos = caretPosition.end >= 0 ? caretPosition.end : fromPos;

            LOGGER.log(`focusInput setting selection ${fromPos} ${toPos}`);
            inputElement.setSelectionRange(fromPos, toPos);
        }
    }
    /* Marks that upcoming focus was mouse-triggered. */
    function onPointerDown(): void {
        // See requirement 18
        if (document.activeElement !== inputElement) {
            openDropdownOnFocus = true;
            autoExecuteSingleActionOnFocus = true;
        } else if (!dropdownShown) {
            // TAB → click case: no focus event will come, so act now
            allOptions = getOptions();
            void showDropdown();
        }
    }
    /* Opens dropdown only when focus was mouse-triggered. */
    function onFocusIn(): void {
        void focusInput("UI"); // the 'void' is used to show that the returned promise is ignored

        allOptions = getOptions();
        if (autoExecuteSingleActionOnFocus) {
            autoExecuteSingleActionOnFocus = false;

            executeSingleAction();
        }

        if (openDropdownOnFocus) {
            openDropdownOnFocus = false;
            void showDropdown(); // showDropdown() already calls updateFilteredOptions()
        }
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
        caretPosition = resetCaretPosition(freCaret, currentValue)
    }
    /************************************************************************
     * END Functions that react when this component gets focus either through
     * the browser or from the editor
     * **********************************************************************/

    /*********************************************************************
     * Functions handling the exit of this component
     * *******************************************************************/
    function endEditing(reason: EndEditingReason): void {
        LOGGER.log(`${id}: endEditing because ${reason}`);

        if (reason === "cancelled" ) { // canceled by user
            // revert to original value
            text = originalText ?? "";
            setInputWidth();
        }
        if (reason === "matched") {
            setInputWidth(); // text has already been set in executeOption
        }
        hideDropdown();
    }
    function onFocusOut(event: FocusEvent): void {
        openDropdownOnFocus = false; // reset, just in case

        const next = event.relatedTarget as Node | null;
        // check whether focus stays 'within' this component
        const insideComponent = next &&
            (
                dropdownAnchorEl?.contains(next) ||
                dropdownPanelEl?.contains(next) ||
                dropdownContentEl?.contains(next)
            );

        if (!insideComponent) {
            endEditing("cancelled");
        }
    }
    /*********************************************************************
     * END Functions handling the exit of this component
     * *******************************************************************/

    /*********************************************************************
     * Functions for handling keyboard events
     * *******************************************************************/
    function onInput(_event: Event): void {
        // if (dropdownShown) {
            updateFilteredOptionsSoon();
        // }
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
            updateFilteredOptions()
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
        // ENTER -> show dropdown if it is not shown,
        // else choose selection from dropdown
        if (event.key === ENTER) {
            event.preventDefault();
            event.stopPropagation();

            if (!dropdownShown) {
                if (executeSingleAction() ) {
                    return;
                }
                allOptions = getOptions();
                void showDropdown();
                return;
            } else {
                if (selected) { // is set by DropdownComponent!
                    executeOption(selected)
                } else {
                    editor.setUserMessage("No valid selection");
                }
            }
            return;
        }
        // ESCAPE -> hide the dropdown when shown, else restore original inputElement.value
        if (event.key === ESCAPE) {
            event.preventDefault();
            event.stopPropagation();
            if (dropdownShown) {
                hideDropdown();
            } else {
                text = originalText ?? ""
                setInputWidth()
                updateFilteredOptions()
            }
            return;
        }
        // HOME
        // If caret/selection can still move to start -> browser
        // else -> let Freon component handle it
        if (isHomeKey(event)) {
            if (canMoveCaretToStart(inputElement)) {
                updateFilteredOptionsSoon()
                event.stopPropagation();
                return;
            } else {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
        }
        // END
        // If caret/selection can still move to end -> browser
        // else -> let Freon component handle it
        if (isEndKey(event)) {
            if (canMoveCaretToEnd(inputElement)) {
                updateFilteredOptionsSoon()
                event.stopPropagation();
                return;
            } else {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
        }
        // Ctrl+Backspace
        // Delete previous word if possible -> browser
        // else -> let Freon component handle it
        if (isDeletePreviousWordKey(event)) {
            if (canDeletePreviousWord(inputElement)) {
                updateFilteredOptionsSoon()
                event.stopPropagation();
                return;
            } else {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
        }
        // Ctrl+Delete
        // Delete next word if possible -> browser
        // else -> let Freon component handle it
        if (isDeleteNextWordKey(event)) {
            if (canDeleteNextWord(inputElement)) {
                updateFilteredOptionsSoon()
                event.stopPropagation();
                return;
            } else {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
        }
        // ARROW_LEFT
        //    Move caret in input if possible and update the filtered options;
        //    otherwise let Freon select previous editable node
        if (event.key === ARROW_LEFT) {
            if (canMoveCaretLeft(inputElement)) {
                updateFilteredOptionsSoon()
                event.stopPropagation();
                return;
            } else {
                editor.selectPreviousLeafIncludingExpressionPreOrPost();
                endEditing('cancelled');
                // LOGGER.log('arrow-left');
                event.preventDefault();
                event.stopPropagation();
                return;
            }
        }
        // ARROW_RIGHT
        //    Move caret in input if possible and update the filtered options;
        //    otherwise let Freon select next editable node
        if (event.key === ARROW_RIGHT) {
            if (canMoveCaretRight(inputElement)) {
                updateFilteredOptionsSoon()
                event.stopPropagation();
                return;
            } else {
                editor.selectNextLeafIncludingExpressionPreOrPost();
                endEditing('cancelled');
                event.preventDefault();
                event.stopPropagation();
                return;
            }
        }
        // ARROW_DOWN or ARROW_UP
        //    Move selection in dropdown
        if (event.key === ARROW_DOWN || event.key === ARROW_UP) {
            if (dropdownShown) {
                event.preventDefault();
                // move selection down in dropdown
                dropdownCmp?.onArrowKey(event);
            }
            // else
            // NOTE No explicit call to endEditing needed, as these events are handled by the FreonComponent,
            // and if the selection leaves this component, a focusOut event will occur, which does exactly this.
            return;
        }
        // BACKSPACE
        //    If browser can still delete something here → browser
        //    else → Freon handles it?
        if (event.key === BACKSPACE) {
            if (canUseBackspace(inputElement)) {
                updateFilteredOptionsSoon()
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
                updateFilteredOptionsSoon()
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

    /* Functions to be triggered by external cut/copy/paste buttons.
     * They are used through the box.
     */
    function getSelectedText(): string {
        return getSelectedTextFromInput(setContextForClipboard());
    }
    function deleteSelection(): void {
        deleteSelectionFromInput(setContextForClipboard());
    }
    function insertAtSelection(insertedText: string): void {
        insertAtSelectionInInput(insertedText, setContextForClipboard());
    }
    /* Helper function to set the context in which the common clipboard functions are being used. */
    function setContextForClipboard(): TextInputClipboardContext {
        return {
            inputElement,
            text,
            setText: (value: string) => {
                text = value;
            },
            afterChange: () => {
                setInputWidth();
                updateFilteredOptions();
            }
        };
    }
    /* The only function that is triggered by the UI in this component itself */
    function handleClipboard(action: string): void {
        LOGGER.log(`TextDropdownComponent ${action}`);
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
    function refreshOverlayRoot() {
        overlayRoot = pane?.getOverlayRoot() ?? null;
    }
    /* Function to handle dropdown positioning */
    function updateDropdownPos() {
        if (!dropdownAnchorEl || !dropdownPanelEl || !dropdownContentEl || !overlayRoot) return;

        const layout = computeDropdownLayout(
            dropdownAnchorEl.getBoundingClientRect(),
            dropdownContentEl.getBoundingClientRect(),
            overlayRoot.getBoundingClientRect()
        );

        dropdownPanelEl.style.left = `${layout.left}px`;
        dropdownPanelEl.style.top = `${layout.top}px`;
        dropdownPanelEl.style.minWidth = `${layout.minWidth}px`;
        dropdownContentEl.style.maxHeight = `${layout.maxHeight}px`;
    }
    /* Function to handle dropdown closing */
    const hideDropdown = () => {
        dropdownShown = false;
        selected = undefined;
        filteredOptions = [noOptions];
        listeners.detach();
    };
    /* Function to handle dropdown opening */
    const showDropdown = async () => {
        LOGGER.log(`showDropdown: allOptions: ${allOptions.map(o => o.id)}, box: ${box?.getSelectedOption()?.id}`)

        refreshOverlayRoot();
        dropdownShown = true;
        // wait until DOM updates and styles/layout settle
        await tick();
        // Compute the visible options before measuring the dropdown panel
        updateFilteredOptions()
        // wait one more frame
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        // now calc the position of the dropdown
        if (dropdownShown) {
            updateDropdownPos();
            listeners.attach();
        }
    };
    function getOptions(): SelectOption[] {
        LOGGER.log(`getOptions for box(${box?.id})`)
        let result = box?.getOptions(editor);
        if (isNullOrUndefined(result)) {
            return [noOptions];
        } else {
            return result;
        }
    }
    /*
     * Handles mouse caret movement / selection changes after they are complete.
     * We use mouse up here, because after mouse drag / caret placement / selection,
     * mouseup is the safer moment. click is less precise for selection scenarios.
     */
    function onMouseUpInInput(): void {
        if (dropdownShown) {
            updateFilteredOptionsSoon();
        }
    }
    /* Updates filteredOptions -- after the DOM has settled */
    function updateFilteredOptionsSoon(): void {
        requestAnimationFrame(() => { // wait for the DOM to settle, otherwise the selection start and end are incorrect
            if (!dropdownShown) {
                allOptions = getOptions();
                void showDropdown(); // this one does the updateFilteredOptions()
            } else {
                updateFilteredOptions();
            }
        });
    }
    function updateFilteredOptions() {
        LOGGER.log(`updateFilteredOptions box(${box?.id}) for ${box?.kind}`);
        if (!inputElement) return;

        // make sure allOptions has a value
        if (!allOptions || allOptions.length === 0) {
            allOptions = getOptions();
        }
        // if it still does not have a value, return
        if (!allOptions || allOptions.length === 0) {
            filteredOptions = [noOptions];
            return;
        }
        // else find the prefix before the caret and filter the options
        const start = inputElement.selectionStart ?? 0;
        const end = inputElement.selectionEnd ?? start;

        // use the *start* of selection as caret anchor
        const caretPos = Math.min(start, end);
        const prefix = text.substring(0, caretPos);
        filteredOptions = MatchUtil.partiallyMatchingOptions(prefix, allOptions);

        // selection should follow the current filter result, not the previous dropdown navigation state
        if (filteredOptions.length > 0) {
            selected = filteredOptions[0];
        } else {
            selected = allOptions[0];
        }

        tryAutoCommitOnCurrentInput(caretPos);
    }
    function tryAutoCommitOnCurrentInput(caretPos: number): void {
        LOGGER.log(`tryAutoCommitOnCurrentInput box(${box?.id}) for ${box?.kind} caret pos ${caretPos} text '${text}', original text '${originalText}'`);

        if (text === originalText) {
            LOGGER.log('no execution')
            return;
        }
        if (isActionBox(box)) {
            // Try to match a regular expression, and execute the action that is associated with it
            const result = box.tryToMatchRegExpAndExecuteAction(text, editor);
            if (result === BehaviorExecutionResult.EXECUTED) {
                endEditing("matched");
                return;
            }
        }

        const prefix = text.substring(0, caretPos);
        const onlyOption = filteredOptions[0];
        // Only one option and has been fully typed in, use this option without waiting for the ENTER key
        if (
            filteredOptions.length === 1 &&
            prefix.length === onlyOption.label.length &&
            MatchUtil.isPrefixOf(prefix, onlyOption.label)
        ) {
            executeOption(filteredOptions[0]);
        }
    }
    /**
     * This custom event is triggered by a click in the dropdown. The option that is clicked
     * is set as text in the <input> and the editing state is ended.
     */
    const itemSelected = (sel: SelectOption) => {
        LOGGER.log(`itemSelected box(${box?.id}) '${sel?.id}'`);
        if (!box || !sel) return;

        executeOption(sel);
    }
    /*********************************************************************
     * END Functions for the dropdown
     * *******************************************************************/

    /*********************************************************************
     * Functions for the button to go to the referred node
     * *******************************************************************/
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
    /*********************************************************************
     * END Functions for the button to go to the referred node
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
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <span
        {id}
        bind:this={dropdownAnchorEl}
        oncontextmenu={() => endEditing("cancelled")}
        tabindex={-1}
        class="text-box-{boxType} text-dropdown-component {cssClass} {errorCls}"
        role="none"
    >
        {#if errMess.length > 0 && box.isFirstInLine}
            <ErrorMarker {editor} {readonly} {box} />
        {/if}
        <ErrorTooltip {editor} {readonly} {box} {hasErr} parentTop={0} parentLeft={0}>
            <span class={`${cssClass ?? ""} text-dropdown-component`} tabindex={-1}>
                <input
                    type="text"
                    class="text-dropdown-component-input"
                    style={`width: ${inputWidth};`}
                    id="{id}-input"
                    bind:this={inputElement}
                    bind:value={text}
                    onpointerdown={onPointerDown}
                    onfocusin={onFocusIn}
                    onfocusout={onFocusOut}
                    oninput={onInput}
                    onkeydown={onKeyDown}
                    onmouseup={onMouseUpInInput}
                    onpaste={() => handleClipboard("onPaste")}
                    oncopy={() => handleClipboard("onCopy")}
                    oncut={() => handleClipboard("onCut")}
                    {placeholder}
                    autocomplete="off"
                    autocapitalize="off"
                    spellcheck={false}
                    name="freon_text_component"
                    {tabindex}
                />

                <span class="text-dropdown-component-width" bind:this={widthSpan}></span>
            </span>
            {#if selectAbleReference && text?.trim().length > 0}
                <button
                    class="reference-button"
                    {id}
                    onclick={(event) => selectReferred(event)}
                    tabindex={-1}
                >
                    <ArrowUp />
                </button>
            {/if}
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
        </ErrorTooltip>
    </span>
{/if}
