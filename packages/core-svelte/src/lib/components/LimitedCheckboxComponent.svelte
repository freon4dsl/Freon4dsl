<script lang="ts">
    import {
        LimitedControlBox,
        FreEditor,
        FreLogger,
        SHIFT,
        CONTROL,
        ALT,
        SPACEBAR,
        ARROW_RIGHT,
        ARROW_LEFT, ARROW_DOWN, ARROW_UP
    } from "@freon4dsl/core";
    import {afterUpdate, onMount} from "svelte";
    import {MdCheckbox} from "@material/web/all.js";

    export let box: LimitedControlBox;
    export let editor: FreEditor;			// the editor

    const LOGGER = new FreLogger("LimitedCheckBoxComponent");

    let id: string = box.id;
    let currentNames: string[] = box.getNames();
    // let isChecked: boolean[] = [];
    let myEnum: string[] = box.getPossibleNames();
    let allElements: MdCheckbox[] = [];
    let ariaLabel: string = "toBeDone"; // todo ariaLabel
    let isHorizontal: boolean = false; // todo expose horizontal/vertical to user

    const onClick = (event) => {
        console.log("onClick")
        // prevent bubbling up
        event.stopPropagation();
    }

    function isChecked(nn: string): boolean {
        return currentNames.includes(nn);
    }

    function changed(name: string) {
        console.log("changed name: " + name)
        if (isChecked(name)) {
            currentNames.splice(currentNames.indexOf(name), 1);
        } else {
            currentNames.push(name);
        }
        box.setNames(currentNames);
        console.log("box names: " + box.getNames())
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
        LOGGER.log("REFRESH LimitedControlBox: " + why);
        currentNames = box.getNames();
        console.log("box names: " + box.getNames())
    };
    onMount(() => {
        currentNames = box.getNames();
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
    afterUpdate(() => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    function setFocusToNext() {
        for (let i = 0; i < allElements.length; i++) {
            if (document.activeElement === allElements[i]) {
                if (i === allElements.length - 1) {
                    allElements[0].focus()
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
                    allElements[allElements.length - 1].focus()
                } else {
                    allElements[i - 1].focus();
                }
                break;
            }
        }
    }

    const onKeyDown = (event) => {
        // space key should toggle the checkbox
        if (event.key !== SHIFT && event.key !== CONTROL && event.key !== ALT) { // ignore meta keys
            switch (event.key) { // only react to space key, other keys are handled by other components
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
    }

</script>

<span role="group" aria-labelledby={ariaLabel} id={id} class="checkbox-group" class:vertical="{!isHorizontal}">
	{#each myEnum as nn, i}
  <span class="single">
    <md-checkbox
            id="{id}-{nn}-{i}"
            value={nn}
            checked={isChecked(nn)}
            aria-label="checkbox-{nn}"
            role="checkbox"
            aria-checked={isChecked(nn)}
            tabindex={0}
            on:change={() => changed(nn)}
            on:click={onClick}
            on:keydown={onKeyDown}
            bind:this={allElements[i]}
    ></md-checkbox>
    <label for="{id}-{nn}-{i}" class="checkbox-label">{nn}</label>
  </span>
	{/each}
</span>

<style>
    .checkbox-group {
        font-size: var(--freon-limited-font-size);
        font-style: var(--freon-limited-font-style);
        font-weight: var(--freon-limited-font-weight);
        font-family: var(--freon-limited-font-family),sans-serif;
        margin: var(--freon-limited-margin);
        padding: var(--freon-limited-padding);
        padding-top: 2px;
        padding-bottom: 2px;
        border: none;
        color: var(--freon-limited-color, var(--mdc-theme-primary));
        background-color: var(--freon-limited-background-color, var(--mdc-theme-background));
        /*border: 1px solid var(--mdc-theme-text-hint-on-background, #ccc);*/
        --md-sys-color-primary: var(--freon-limited-color, var(--mdc-theme-primary));
        /*--md-sys-color-on-surface-variant: red; color for the one that is not checked */
        /* the following three variables determine the manner in which the focus-ring is shown */
        --md-focus-ring-duration: 0s; /* disabled animation */
        /*--md-focus-ring-active-width: 0px;*/
        /*--md-focus-ring-width: 0px;*/
    }
    .checkbox-group:hover,
    .checkbox-group:focus-within {
        border-radius: 0.1em;
        outline: var(--freon-limited-color, var(--mdc-theme-primary)) solid 1px;
        box-shadow: 0 0 10px var(--freon-limited-color, var(--mdc-theme-primary));
    }
    .checkbox-label {
        padding: 2px;
    }
    .single {
        padding-top: 0.2em;
        padding-bottom: 0.2em;
        display: flex;
    }
    .vertical {
        display: inline-block;
    }
</style>
