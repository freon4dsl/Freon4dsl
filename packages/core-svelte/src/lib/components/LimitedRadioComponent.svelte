<script lang="ts">
    import { LIMITEDRADIO_LOGGER } from "$lib/components/ComponentLoggers.js";
    import {
        ALT, ARROW_DOWN,
        ARROW_LEFT,
        ARROW_RIGHT, ARROW_UP, AST,
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

    const LOGGER = LIMITEDRADIO_LOGGER

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
        AST.change( () => {
            box.setNames([currentValue]);
        })
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

<span role="radiogroup" aria-labelledby={ariaLabel} id={id} class="limited-radio-component-group" class:limited-radio-component-vertical="{!isHorizontal}">
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
                on:click={onClick}
                on:change={onChange}
                on:keydown={onKeyDown}
                bind:this={allElements[i]}
        ></md-radio>
        <label class="limited-radio-component-label" for="{id}-{nn}-{i}">{nn}</label>
      </span>
	{/each}
</span>
