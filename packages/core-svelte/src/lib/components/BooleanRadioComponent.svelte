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
        CONTROL, FreLanguage,
        notNullOrUndefined,
        SHIFT
    } from "@freon4dsl/core"
    import { onMount } from 'svelte';
    import type { FreComponentProps } from './svelte-utils/FreComponentProps.js';

    const LOGGER = RADIO_LOGGER;

    let { editor, box }: FreComponentProps<BooleanControlBox> = $props();

    let id: string = box.id;
    let trueElement: HTMLInputElement;
    let falseElement: HTMLInputElement;
    let undefinedElement: HTMLInputElement;
    let currentValue: boolean | undefined = $state(box.getBoolean());
    let ariaLabel = 'toBeDone'; // todo create useful aria-label
    let isHorizontal: boolean = false; // todo expose horizontal/vertical to user
    let isOptional: boolean = $state(false); // is set in $effect to optionality from box

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
        } else if (currentValue === "unknown") {
            undefinedElement.focus();
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
        isOptional = FreLanguage.getInstance().classifierProperty(box.node.freLanguageConcept(), box.propertyName)?.isOptional || false
    });

    const onChange = (event: Event & {
        currentTarget: EventTarget & HTMLInputElement;
    }) => {
        if (notNullOrUndefined(event.target)) {
            LOGGER.log(
                'BooleanRadioComponent.onChange for box ' +
                    box.role +
                    ', value:' +
                    event.target['value' as keyof EventTarget]
            );
            const tmp = event.currentTarget.value
            if (tmp === "unknown") {
                // Using value "unknown", as undefined does not work with radio button
                currentValue = undefined
            } else if (typeof tmp === "boolean") {
                currentValue = tmp
            } else if (typeof tmp === "string") {
                currentValue = tmp === "true"
            } else {
                LOGGER.error(`unkown value in BooleanRadioComponent: '${tmp}'`)
            }
            box.setBoolean(currentValue);
            editor.selectElementForBox(box);
            event.stopPropagation();
        }
    };

    const onClick = (event: MouseEvent & { currentTarget: EventTarget & HTMLLabelElement }) => {
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
    class="freon-radio-group boolean-radio-component-group {box.cssClass}"
    class:freon-radio-group-vertical={!isHorizontal}
    {id}
>
    <span class="freon-radio-item boolean-radio-component-single">
        <label class="freon-radio-label boolean-radio-component-label" onclick={onClick}>
            <input
                type="radio"
                id="{id}-trueOne"
                name="{id}-group"
                tabindex="0"
                aria-checked={currentValue === true}
                value={true}
                checked={currentValue === true}
                aria-label="radio-control-true"
                onchange={onChange}
                onkeydown={onKeyDown}
                bind:this={trueElement}
            />
            {box.labels.yes}
        </label>
    </span>
    <span class="freon-radio-item boolean-radio-component-single">
        <label class="freon-radio-label boolean-radio-component-label" onclick={onClick}>
            <input
                type="radio"
                id="{id}-falseOne"
                name="{id}-group"
                tabindex="0"
                aria-checked={currentValue === false}
                value={false}
                checked={currentValue === false}
                aria-label="radio-control-false"
                onchange={onChange}
                onkeydown={onKeyDown}
                bind:this={falseElement}
            />
            {box.labels.no}
        </label>
    </span>
    {#if isOptional} 
        <span class="freon-radio-item boolean-radio-component-single">
            <label class="freon-radio-label boolean-radio-component-label" onclick={onClick}>
                <input
                    type="radio"
                    id="{id}-undefinedOne"
                    name="{id}-group"
                    tabindex="0"
                    aria-checked={currentValue === undefined}
                    value="unknown"
                    checked={currentValue === undefined}
                    aria-label="radio-control-undefined"
                    onchange={onChange}
                    onkeydown={onKeyDown}
                    bind:this={undefinedElement}
                />
                {box.labels.unknown}
            </label>
        </span>
    {/if}
</span>


