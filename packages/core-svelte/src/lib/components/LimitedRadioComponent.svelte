<script lang="ts">
    import { LIMITEDRADIO_LOGGER } from './ComponentLoggers.js';
    import {
        ALT,
        ARROW_DOWN,
        ARROW_LEFT,
        ARROW_RIGHT,
        ARROW_UP,
        AST,
        CONTROL,
        notNullOrUndefined,
        LimitedControlBox,
        SHIFT
    } from '@freon4dsl/core';
    import { onMount } from 'svelte';
    import type { FreComponentProps } from './svelte-utils/FreComponentProps.js';

    // Props
    let { editor, box }: FreComponentProps<LimitedControlBox> = $props();

    const LOGGER = LIMITEDRADIO_LOGGER;

    let id: string = box.id;
    let myEnum = box.getPossibleNames();
    let currentValue: string = $state(box.getNames()[0]);
    let allElements: HTMLInputElement[] = $state([]);
    let ariaLabel: string = box.propertyName;
    let isHorizontal: boolean = box.horizontal;

    function findSelectedElement(): HTMLInputElement | undefined {
        let selected: HTMLInputElement | undefined = undefined;
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
        if (notNullOrUndefined(selected)) {
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
        // Evaluated and re-evaluated when the box changes.
        refresh('Refresh limited radio box changed ' + box?.id);
    });

    const onChange = (event: Event & {
        currentTarget: EventTarget & HTMLInputElement;
    }) => {
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
  class="limited-radio-component-group  {box.cssClass}"
  class:limited-radio-component-vertical={!isHorizontal}
>
    {#each myEnum as nn, i}
        <span class="limited-radio-component-single">
            <label class="limited-radio-component-label">
                <input
                  class="limited-radio-component-input"
                  type="radio"
                  id="{id}-{nn}-{i}"
                  name="{id}-group"
                  tabindex="0"
                  aria-checked={currentValue === nn}
                  value={nn}
                  checked={currentValue === nn}
                  aria-label="radio-control-{nn}"
                  onclick={onClick}
                  onchange={onChange}
                  onkeydown={onKeyDown}
                  bind:this={allElements[i]}
                />
                {nn}
            </label>
        </span>
    {/each}
</span>
