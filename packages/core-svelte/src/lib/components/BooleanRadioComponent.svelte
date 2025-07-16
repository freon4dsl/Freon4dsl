<script lang="ts">
    import { RADIO_LOGGER } from './ComponentLoggers.js';

    /**
     * This component shows a boolean value as checkbox.
     */
    import {
        ALT,
        ARROW_DOWN,
        ARROW_LEFT,
        ARROW_RIGHT,
        ARROW_UP,
        BooleanControlBox,
        CONTROL,
        isNullOrUndefined,
        SHIFT
    } from '@freon4dsl/core';
    import { onMount } from 'svelte';
    import { MdRadio } from '@material/web/all.js';
    import type { FreComponentProps } from './svelte-utils/FreComponentProps.js';

    const LOGGER = RADIO_LOGGER;

    let { editor, box }: FreComponentProps<BooleanControlBox> = $props();

    let id: string = box.id;
    let trueElement: MdRadio;
    let falseElement: MdRadio;
    let currentValue: boolean = $state(box.getBoolean());
    let ariaLabel = 'toBeDone'; // todo create useful aria-label
    let isHorizontal: boolean = false; // todo expose horizontal/vertical to user

    /**
     * This function sets the focus on this element programmatically.
     * It is called from the box. Note that because focus can be set,
     * the html needs to have its tabindex set, and its needs to be bound
     * to a variable.
     */
    async function setFocus(): Promise<void> {
        if (currentValue === true) {
            trueElement.focus();
        } else if (currentValue === false) {
            falseElement.focus();
        }
    }

    const refresh = (why?: string): void => {
        LOGGER.log('REFRESH BooleanControlBox: ' + why);
        currentValue = box.getBoolean();
    };

    onMount(() => {
        currentValue = box.getBoolean();
    });

    $effect(() => {
        // runs after the initial onMount
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    const onChange = (event: MouseEvent & { currentTarget: EventTarget & HTMLInputElement }) => {
        if (!isNullOrUndefined(event.target)) {
            LOGGER.log(
                'BooleanRadioComponent.onChange for box ' +
                    box.role +
                    ', value:' +
                    event.target['value' as keyof EventTarget]
            );
            currentValue = event.currentTarget.value as unknown as boolean;
            box.setBoolean(currentValue);
            editor.selectElementForBox(box);
            event.stopPropagation();
        }
    };

    const onClick = (event: MouseEvent & { currentTarget: EventTarget & HTMLInputElement }) => {
        event.stopPropagation();
    };

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== SHIFT && event.key !== CONTROL && event.key !== ALT) {
            // ignore meta keys
            switch (
                event.key // only react to arrow keys, other keys are handled by other components
            ) {
                case ARROW_LEFT:
                case ARROW_RIGHT:
                case ARROW_UP:
                case ARROW_DOWN: {
                    event.stopPropagation();
                    event.preventDefault();
                }
            }
        }
    };
</script>

<span
    role="radiogroup"
    aria-labelledby={ariaLabel}
    class="boolean-radio-component-group {box.cssClass}"
    class:boolean-radio-component-vertical={!isHorizontal}
    {id}
>
    <span class="boolean-radio-component-single">
        <md-radio
            id="{id}-trueOne"
            name="{id}-group"
            role="radio"
            tabindex="0"
            aria-checked={currentValue === true}
            value={true}
            checked={currentValue === true}
            aria-label="radio-control-true"
            onclick={onClick}
            onchange={onChange}
            onkeydown={onKeyDown}
            bind:this={trueElement}
        ></md-radio>
        <label for="{id}-trueOne" class="boolean-radio-component-label">{box.labels.yes}</label>
    </span>
    <span class="boolean-radio-component-single">
        <md-radio
            id="{id}-falseOne"
            name="{id}-group"
            role="radio"
            tabindex="0"
            aria-checked={currentValue === false}
            value={false}
            checked={currentValue === false}
            aria-label="radio-control-false"
            onclick={onClick}
            onchange={onChange}
            onkeydown={onKeyDown}
            bind:this={falseElement}
        ></md-radio>
        <label class="boolean-radio-component-label" for="{id}-falseOne">{box.labels.no}</label>
    </span>
</span>
