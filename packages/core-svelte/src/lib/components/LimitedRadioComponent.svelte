<script lang="ts">
    import { LIMITEDRADIO_LOGGER } from '$lib/components/ComponentLoggers.js';
    import {
        ALT,
        ARROW_DOWN,
        ARROW_LEFT,
        ARROW_RIGHT,
        ARROW_UP,
        AST,
        CONTROL,
        isNullOrUndefined,
        LimitedControlBox,
        SHIFT
    } from '@freon4dsl/core';
    import { onMount } from 'svelte';
    import { MdRadio } from '@material/web/all.js';
    import type { FreComponentProps } from '$lib/components/svelte-utils/FreComponentProps.js';

    // Props
    let { editor, box }: FreComponentProps<LimitedControlBox> = $props();

    const LOGGER = LIMITEDRADIO_LOGGER;

    let id: string = box.id;
    let myEnum = box.getPossibleNames();
    let currentValue: string = $state(box.getNames()[0]);
    let allElements: MdRadio[] = $state([]);
    let ariaLabel: string = 'toBeDone'; // todo ariaLabel
    let isHorizontal: boolean = false; // todo expose horizontal/vertical to user

    function findSelectedElement(): MdRadio | undefined {
        let selected: MdRadio | undefined = undefined;
        for (let i = 0; i < myEnum.length; i++) {
            if (myEnum[i] === currentValue) {
                selected = allElements[i];
            }
        }
        return selected;
    }

    /**
     * This function sets the focus on this element programmatically.
     * It is called from the box. Note that because focus can be set,
     * the html needs to have its tabindex set, and its needs to be bound
     * to a variable.
     */
    async function setFocus(): Promise<void> {
        let selected = findSelectedElement();
        if (!isNullOrUndefined(selected)) {
            selected.focus();
        }
    }

    const refresh = (why?: string): void => {
        LOGGER.log('REFRESH LimitedControlBox: ' + why);
        currentValue = box.getNames()[0];
    };

    onMount(() => {
        currentValue = box.getNames()[0];
    });

    $effect(() => {
        // runs after the initial onMount
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    const onChange = (event: MouseEvent) => {
        // @ts-expect-error it is known that the target has a 'value' prop
        currentValue = event.target!['value'];
        AST.change(() => {
            box.setNames([currentValue]);
        });
        editor.selectElementForBox(box);
        event.stopPropagation();
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
    {id}
    class="limited-radio-component-group"
    class:limited-radio-component-vertical={!isHorizontal}
>
    {#each myEnum as nn, i}
        <span class="limited-radio-component-single">
            <md-radio
                id="{id}-{nn}-{i}"
                name="{id}-group"
                role="radio"
                tabindex="0"
                aria-checked={currentValue === nn}
                value={nn}
                checked={currentValue === nn}
                aria-label="radio-control-{nn}"
                onclick={onClick}
                onchange={onChange}
                onkeydown={onKeyDown}
                bind:this={allElements[i]}
            ></md-radio>
            <label class="limited-radio-component-label" for="{id}-{nn}-{i}">{nn}</label>
        </span>
    {/each}
</span>
