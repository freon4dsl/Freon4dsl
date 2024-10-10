<script lang="ts">
    import '@material/web/slider/slider.js';
    import { NUMERICSLIDER_LOGGER } from "$lib/components/ComponentLoggers.js";
    import {MdSlider} from "@material/web/slider/slider.js";
    import {FreEditor, NumberControlBox} from "@freon4dsl/core";
    import {afterUpdate, onMount} from "svelte";

    const LOGGER = NUMERICSLIDER_LOGGER

    export let editor: FreEditor;
    export let box: NumberControlBox;

    // Variables set from the box.
    // box.displayInfo is completely set, it is done in NumberControlBox constructor
    let id: string = box.id;
    let value: number = box.getNumber();
    let min: number = box.displayInfo.min;
    let max: number = box.displayInfo.max;
    let step: number = box.displayInfo.step;
    let showMarks: boolean = box.displayInfo.showMarks;
    // let discrete: boolean = box.displayInfo.discrete;

    //
    let sliderElement: MdSlider;

    const onChange = (event: Event) => {
        LOGGER.log("NumericSliderComponent.onChange for box " + box.role + ", value:" + sliderElement.value);
        value = (sliderElement.value !== null && sliderElement.value !== undefined) ? sliderElement.value : 0;
        box.setNumber(value);
        if (box.selectable) {
            editor.selectElementForBox(box);
        }
        event.stopPropagation();
    }

    /**
     * This function sets the focus on this element programmatically.
     * It is called from the box. Note that because focus can be set,
     * the html needs to have its tabindex set, and its needs to be bound
     * to a variable.
     */
    async function setFocus(): Promise<void> {
        sliderElement.focus();
    }
    const refresh = (why?: string): void => {
        LOGGER.log("REFRESH NumberControlBox: " + why);
        value = box.getNumber();
    };
    onMount(() => {
        value = box.getNumber();
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });
    afterUpdate(() => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    /**
     * Function dragStart is here to prevent the event bubbling up to a ListComponent, or other component
     * that supports drag and drop.
     * @param event
     */
    const dragStart = (event: MouseEvent & {currentTarget: EventTarget & HTMLInputElement; }) => {
        event.preventDefault();
    }
</script>

<span class="numeric-slider-component" id="{id}">
    <md-slider labeled
               ticks="{showMarks}"
               min={min}
               max={max}
               step={step}
               value={value}
               draggable={true}
               on:dragstart={dragStart}
               role="slider"
               aria-valuenow="{value}"
               tabindex={0}
               on:change={onChange}
               bind:this={sliderElement}>
    </md-slider>
</span>

