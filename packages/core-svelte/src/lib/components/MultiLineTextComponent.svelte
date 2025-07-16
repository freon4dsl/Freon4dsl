<script lang="ts">
    import { MULTILINETEXT_LOGGER } from './ComponentLoggers.js';
    import { componentId } from '../index.js';
    import { isNullOrUndefined, MultiLineTextBox } from '@freon4dsl/core';
    import type { FreComponentProps } from './svelte-utils/FreComponentProps.js';

    // Probably needed to code/encode HTML inside <TextArea>
    // import { replaceHTML } from "./svelte-utils/index.js";

    const LOGGER = MULTILINETEXT_LOGGER;

    // Props
    let { box }: FreComponentProps<MultiLineTextBox> = $props();

    // Local variables
    let id: string = $state(''); // an id for the html element
    id = !isNullOrUndefined(box) ? componentId(box) : 'text-with-unknown-box';
    let textArea: HTMLTextAreaElement; // the text area element on the screen
    const placeholder = $derived(() => box.placeHolder);
    let text: string = $state('');

    /**
     */
    $effect(() => {
        // runs after the initial onMount
        LOGGER.log('Start afterUpdate id: ' + id);
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    /**
     * This function sets the focus on this element programmatically.
     * It is called from the box.
     */
    export async function setFocus(): Promise<void> {
        LOGGER.log('setFocus ' + id);
        if (!isNullOrUndefined(textArea)) {
            textArea.focus();
        }
    }

    /**
     * When this component loses focus, do everything that is needed to end the editing state.
     */
    const onFocusOut = () => {
        LOGGER.log('onFocusOut ' + id);
        if (text !== box.getText()) {
            LOGGER.log(`   text is new value`);
            box.setText(text);
        } else {
            LOGGER.log('Text is unchanged: ' + text);
        }
    };

    const refresh = () => {
        LOGGER.log('REFRESH ' + box?.node?.freId() + ' (' + box?.node?.freLanguageConcept() + ')');
        text = box.getText();
    };

    function onKeyDown(keyEvent: KeyboardEvent) {
        LOGGER.log('Key Event: ' + keyEvent.code);
        keyEvent.stopPropagation();
    }

    refresh();
</script>

<textarea
    class="{box.cssClass} multilinetext-box multiline-text-component"
    {id}
    onfocusout={onFocusOut}
    onkeydown={onKeyDown}
    spellcheck="false"
    bind:this={textArea}
    {placeholder}
    bind:value={text}
></textarea>
