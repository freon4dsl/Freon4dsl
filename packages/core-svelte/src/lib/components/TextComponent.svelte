<script lang="ts">
    import { TEXT_LOGGER } from "./ComponentLoggers.js"
    import {
        componentId, computeInputWidth, deleteSelectionFromInput,
        type FreComponentProps,
        getSelectedTextFromInput, insertAtSelectionInInput,
        resetCaretPosition,
        type TextCaretPosition, type TextInputClipboardContext
    } from "./index.js"
    import { shouldBeHandledByBrowser } from "./stores/AllStores.svelte"
    import {
        FreLanguage,
        notNullOrUndefined,
        TextBox,
        isTextBox,
        ActionBox,
        isActionBox,
        BehaviorExecutionResult,
        UndefinedRectangle,
        type ClientRectangle, FreCaret, FreCaretPosition, CharAllowed, FreEditor,
        ARROW_LEFT, ENTER, ARROW_RIGHT, BACKSPACE, DELETE, SHIFT,
        CONTROL, ALT, TAB, ESCAPE
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
    import { flushSync } from "svelte"
    import ErrorTooltip from './ErrorTooltip.svelte';
    import ErrorMarker from './ErrorMarker.svelte';

    const LOGGER = TEXT_LOGGER;

    type FocusOrigin = "UI" | "editor";
    type EndEditingReason =
        | "focusout"
        | "enter"
        | "escape"
        | "arrow-left"
        | "arrow-right"
        | "goto-next"
        | "goto-previous";

    // Props
    let { editor, box, readonly = false }: FreComponentProps<TextBox> = $props();

    // Variables dependent upon the box, the prop 'text' is one of these.
    // an id for the HTML element
    // svelte-ignore state_referenced_locally
    let id: string = $state(notNullOrUndefined(box) ? componentId(box) : 'text-with-unknown-box');
    // the placeholder when value of text component is not present
    // svelte-ignore state_referenced_locally
    let placeholder: string = $state(notNullOrUndefined(box) ? camelCaseToReadable(box.placeHolder) : '<..>');
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
    let caretPosition: TextCaretPosition = $state({ start: -1, end: -1 });

    // variable to guard against loops
    let isEnding = false;

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
            const newPlaceholder = camelCaseToReadable(box.placeHolder);
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
            box.setCaret = calculateCaret;
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
    /*********************************************************************
     * END Helper functions
     * *******************************************************************/

    /*********************************************************************
     * Functions to get the width of the element correct
     * *******************************************************************/
    /* effect to keep the width of the HTML correct */
    $effect(() => {
        // make this effect reactive to model changes
        const _text = text;
        const _placeholder = placeholder;

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
        LOGGER.log(`focusInput for ${box?.id} from ${from}`);

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

        let textToStore: string | undefined = text;
        /* When the value of an optional property of type string is the empty string, we store it as 'undefined'. */
        // TODO this should still be tested
        const propDef = FreLanguage.getInstance().classifierProperty(box.node.freLanguageConcept(), box.propertyName);
        if (propDef && propDef.propertyKind === "primitive" && propDef.type === "string" && propDef.isOptional && text === "") {
            textToStore = undefined;
        }
        // store the current value in the textbox
        LOGGER.log(`   save text using box.setText(${textToStore})`);
        if (textToStore !== box.getText()) {
            LOGGER.log(`   text is new value`);
            box.setText(textToStore);
        }
        // Note: originalText is not updated here.
        // We rely on the model -> refresh loop to synchronize local state
        // after box.setText(...). Because editing ends here, any transient
        // mismatch between text and originalText is acceptable.
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
        if (!box) return;
        const caretPos =
            inputElement?.selectionStart ??
            inputElement?.value?.length ??
            text.length;
        switch (box.isCharAllowed(text, event.key, caretPos)) {
            case CharAllowed.OK:
                // add char to text, handled by browser
                return;

            case CharAllowed.NOT_OK:
                LOGGER.log('KeyPressAction.NOT_OK');
                event.preventDefault();
                event.stopPropagation();
                return;

            case CharAllowed.GOTO_NEXT:
                handleGoToNext(event, editor);
                return;

            case CharAllowed.GOTO_PREVIOUS:
                handleGoToPrevious(event, editor);
                return;
        }
    }
    function handleGoToPrevious(event: KeyboardEvent, editor: FreEditor) {
        LOGGER.log('handleGoToPrevious event ' + event.key);
        endEditing('goto-previous');
        editor.selectPreviousLeafIncludingExpressionPreOrPost();
        event.preventDefault();
        event.stopPropagation();
    }
    function handleGoToNext(event: KeyboardEvent, editor: FreEditor) {
        LOGGER.log('handleGoToNext event ' + event.key);
        endEditing('goto-next');
        editor.selectNextLeafIncludingExpressionPreOrPost();
        editor.selectedCaretPosition = FreCaret.RIGHT_MOST
        // Now try whether the typed character triggers an action.
        if (isActionBox(editor.selectedBox)) {
            const actionBox = editor.selectedBox as ActionBox;
            const executionResult: BehaviorExecutionResult = actionBox.tryToExecute(
                event.key,
                editor
            );
            if (executionResult !== BehaviorExecutionResult.EXECUTED) {
                actionBox.rememberText(event.key)
            }
        }
        event.preventDefault();
        event.stopPropagation();
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
</script>

{#if readonly}
    <span class={`${cssClass ?? ""} text-component`}>
        <span
            class="text-component-input readonly"
            bind:this={readonlyElement}
        >
            {#if text && text.length > 0}
                {text}
            {:else}
                <span class="text-component-placeholder">
                    {placeholder}
                </span>
            {/if}
        </span>
    </span>
{:else}
    {#if errMess.length > 0 && box.isFirstInLine}
        <ErrorMarker {editor} {readonly} {box} />
    {/if}
    <ErrorTooltip {editor} {readonly} {box} {hasErr} parentTop={0} parentLeft={0}>
    <span class={`${cssClass ?? ""} text-component`}>
        <input
            type="text"
            class="text-component-input"
            style={`width: ${inputWidth};`}
            id="{id}-input"
            bind:this={inputElement}
            bind:value={text}
            oninput={onInput}
            onfocusin={onFocusIn}
            onfocusout={onFocusOut}
            onkeydown={onKeyDown}
            onpaste={() => handleClipboard("onPaste")}
            oncopy={() => handleClipboard("onCopy")}
            oncut={() => handleClipboard("onCut")}
            {placeholder}
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            name="freon_text_component"
        />

        <span class="text-component-width" bind:this={widthSpan}></span>
    </span>
    </ErrorTooltip>
{/if}
