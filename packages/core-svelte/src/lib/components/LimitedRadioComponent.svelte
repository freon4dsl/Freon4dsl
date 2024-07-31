<script lang="ts">
    import {
        ALT, ARROW_DOWN,
        ARROW_LEFT,
        ARROW_RIGHT, ARROW_UP,
        CONTROL,
        FreEditor,
        FreLogger,
        LimitedControlBox,
        SHIFT
    } from "@freon4dsl/core";
    import {afterUpdate, onMount} from "svelte";
    import {MdRadio} from "@material/web/all.js";

    export let box: LimitedControlBox;
    export let editor: FreEditor;			// the editor

    const LOGGER = new FreLogger("LimitedRadioComponent");

    let id: string = box.id;
    let myEnum = box.getPossibleNames();
    let currentValue: string = box.getNames()[0];
    let allElements: MdRadio[] = [];
    let ariaLabel: string = "toBeDone"; // todo ariaLabel
    let isHorizontal: boolean = false; // todo expose horizontal/vertical to user

    function findSelectedElement(): MdRadio {
        let selected: MdRadio = null;
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
        if (!!selected) {
            selected.focus();
        }
    }
    const refresh = (why?: string): void => {
        LOGGER.log("REFRESH LimitedControlBox: " + why);
        currentValue = box.getNames()[0];
    };
    onMount(() => {
        currentValue = box.getNames()[0];
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
    afterUpdate(() => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
    const onChange = (event: MouseEvent) => {
        currentValue = event.target["value"];
        box.setNames([currentValue]);
        editor.selectElementForBox(box);
        event.stopPropagation();
    }
    const onClick = (event: MouseEvent & {currentTarget: EventTarget & HTMLInputElement; }) => {
        event.stopPropagation();
    }
    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== SHIFT && event.key !== CONTROL && event.key !== ALT) { // ignore meta keys
            switch (event.key) { // only react to arrow keys, other keys are handled by other components
                case ARROW_LEFT:
                case ARROW_RIGHT:
                case ARROW_UP:
                case ARROW_DOWN: {
                    event.stopPropagation();
                    event.preventDefault();
                }
            }
        }
    }
</script>

<span role="radiogroup" aria-labelledby={ariaLabel} id={id} class="radiogroup" class:vertical="{!isHorizontal}">
	{#each myEnum as nn, i}
      <span class="single">
        <md-radio
                id="{id}-{nn}-{i}"
                name="{id}-group"
                role="radio"
                tabindex="0"
                aria-checked={currentValue === nn}
                value={nn}
                checked={currentValue === nn}
                aria-label="radio-control-{nn}"
                on:click={onClick}
                on:change={onChange}
                on:keydown={onKeyDown}
                bind:this={allElements[i]}
        ></md-radio>
        <label class="freon-radio-label" for="{id}-{nn}-{i}">{nn}</label>
      </span>
	{/each}
</span>

<style>
    .radiogroup {
        font-size: var(--freon-limited-font-size);
        font-style: var(--freon-limited-font-style);
        font-weight: var(--freon-limited-font-weight);
        font-family: var(--freon-limited-font-family),sans-serif;
        margin: var(--freon-limited-margin);
        padding: var(--freon-limited-padding);
        padding-top: 2px;
        padding-bottom: 2px;
        border: none;
        color: var(--freon-limited-text-color, var(--mdc-theme-primary));
        background-color: var(--freon-limited-background-color, var(--mdc-theme-background));
        /*border: 1px solid var(--mdc-theme-text-hint-on-background, #ccc);*/
        --md-sys-color-primary: var(--freon-limited-color, var(--mdc-theme-primary));
        /*--md-sys-color-on-surface-variant: red; color for the one that is not checked */
        /* the following three variables determine the manner in which the focus-ring is shown */
        --md-focus-ring-duration: 0s; /* disabled animation */
        --md-focus-ring-active-width: 0px;
        --md-focus-ring-width: 0px;
    }
    .radiogroup:hover,
    .radiogroup:focus-within {
        border-radius: 0.1em;
        outline: var(--freon-limited-color, var(--mdc-theme-primary)) solid 1px;
        box-shadow: 0 0 10px var(--freon-limited-color, var(--mdc-theme-primary));
    }
    .single {
        padding-top: 0.2em;
        padding-bottom: 0.2em;
        display: flex;
    }
    .vertical {
        display: inline-block;
    }
    .freon-radio-label {
        margin-left: 4px;
        margin-top: 2px;
    }
</style>
