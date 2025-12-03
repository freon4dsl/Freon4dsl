<script lang="ts">
    import { type ButtonBox } from '@freon4dsl/core';
    import { BUTTON_LOGGER } from './ComponentLoggers.js';
    import type { FreComponentProps } from './svelte-utils/FreComponentProps.js';

    let { editor, box }: FreComponentProps<ButtonBox> = $props();

    const LOGGER = BUTTON_LOGGER;
    LOGGER.show();

    let id: string = box.id;
    let thisButton: HTMLButtonElement;

    /**
     * This function sets the focus on this element programmatically.
     * It is called from the box. Note that because focus can be set,
     * the html needs to have its tabindex set, and its needs to be bound
     * to a variable.
     */
    async function setFocus(): Promise<void> {
        thisButton.focus();
    }
    const refresh = (why?: string): void => {
        LOGGER.log('REFRESH ButtonBox: ' + why);
    };
    $effect(() => {
        // runs after the initial onMount
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
    const onClick = (event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) => {
        LOGGER.log('execute action');
        box.executeAction(editor);
        event.stopPropagation();
    };
</script>

<button
    class="button-component-ripple button-component {box.cssClass}"
    class:button-component-empty={box.text.length === 0}
    {id}
    onclick={onClick}
    bind:this={thisButton}
>
    <span>{box.text}</span>
</button>
