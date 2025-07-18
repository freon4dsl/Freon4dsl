<script lang="ts">
    import { LIMITEDCHECKBOX_LOGGER } from './ComponentLoggers.js';
    import {
        SHIFT,
        CONTROL,
        ALT,
        SPACEBAR,
        ARROW_RIGHT,
        ARROW_LEFT,
        ARROW_DOWN,
        ARROW_UP
    } from '@freon4dsl/core';
    import type { LimitedControlBox } from '@freon4dsl/core';
    import { onMount } from 'svelte';
    import { MdCheckbox } from '@material/web/checkbox/checkbox.js';
    import type { FreComponentProps } from './svelte-utils/FreComponentProps.js';

    // Props
    let { editor, box }: FreComponentProps<LimitedControlBox> = $props();

    const LOGGER = LIMITEDCHECKBOX_LOGGER;

    let id: string = box.id;
    let currentNames: string[] = $state(box.getNames());
    let myEnum: string[] = box.getPossibleNames();
    let allElements: MdCheckbox[] = $state([]);
    let ariaLabel: string = 'toBeDone'; // todo ariaLabel
    let isHorizontal: boolean = false; // todo expose horizontal/vertical to user

    const onClick = (event: MouseEvent) => {
        // console.log("onClick")
        // prevent bubbling up
        event.stopPropagation();
    };

    function isChecked(nn: string): boolean {
        return currentNames.includes(nn);
    }

    function changed(name: string) {
        // console.log("changed name: " + name)
        if (isChecked(name)) {
            currentNames.splice(currentNames.indexOf(name), 1);
        } else {
            currentNames.push(name);
        }
        box.setNames(currentNames);
        // console.log("box names: " + box.getNames())
        editor.selectElementForBox(box);
    }

    /**
     * This function sets the focus on this element programmatically.
     * It is called from the box. Note that because focus can be set,
     * the html needs to have its tabindex set, and its needs to be bound
     * to a variable.
     */
    async function setFocus(): Promise<void> {
        allElements[0].focus();
    }

    const refresh = (why?: string): void => {
        LOGGER.log('REFRESH LimitedControlBox: ' + why);
        currentNames = box.getNames();
        // console.log("box names: " + box.getNames())
    };

    onMount(() => {
        currentNames = box.getNames();
    });

    $effect(() => {
        // runs after the initial onMount
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
        // Evaluated and re-evaluated when the box changes.
        refresh('Refresh limited checkbox box changed ' + box?.id);
    });

    function setFocusToNext() {
        for (let i = 0; i < allElements.length; i++) {
            if (document.activeElement === allElements[i]) {
                if (i === allElements.length - 1) {
                    allElements[0].focus();
                } else {
                    allElements[i + 1].focus();
                }
                break;
            }
        }
    }

    function setFocusToPrevious() {
        for (let i = 0; i < allElements.length; i++) {
            if (document.activeElement === allElements[i]) {
                if (i === 0) {
                    allElements[allElements.length - 1].focus();
                } else {
                    allElements[i - 1].focus();
                }
                break;
            }
        }
    }

    const onKeyDown = (event: KeyboardEvent) => {
        // space key should toggle the checkbox
        if (event.key !== SHIFT && event.key !== CONTROL && event.key !== ALT) {
            // ignore meta keys
            switch (
                event.key // only react to space key, other keys are handled by other components
            ) {
                case SPACEBAR: {
                    event.stopPropagation();
                    // event.preventDefault();
                    break;
                }
                case ARROW_RIGHT: {
                    if (isHorizontal) {
                        setFocusToNext();
                        event.stopPropagation();
                        event.preventDefault();
                    }
                    break;
                }
                case ARROW_LEFT: {
                    if (isHorizontal) {
                        setFocusToPrevious();
                        event.stopPropagation();
                        event.preventDefault();
                    }
                    break;
                }
                case ARROW_UP: {
                    if (!isHorizontal) {
                        setFocusToPrevious();
                        event.stopPropagation();
                        event.preventDefault();
                    }
                    break;
                }
                case ARROW_DOWN: {
                    if (!isHorizontal) {
                        setFocusToNext();
                        event.stopPropagation();
                        event.preventDefault();
                    }
                    break;
                }
            }
        }
    };
</script>

<span
    role="group"
    aria-labelledby={ariaLabel}
    {id}
    class="limited-checkbox-component-group {box.cssClass}"
    class:limited-checkbox-component-vertical={!isHorizontal}
>
    {#each myEnum as nn, i}
        <span class="limited-checkbox-component-single">
            <md-checkbox
                id="{id}-{nn}-{i}"
                value={nn}
                checked={isChecked(nn)}
                aria-label="checkbox-{nn}"
                role="checkbox"
                aria-checked={isChecked(nn)}
                tabindex={0}
                onchange={() => changed(nn)}
                onclick={onClick}
                onkeydown={onKeyDown}
                bind:this={allElements[i]}
            ></md-checkbox>
            <label for="{id}-{nn}-{i}" class="limited-checkbox-component-label">{nn}</label>
        </span>
    {/each}
</span>
