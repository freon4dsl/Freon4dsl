<script lang="ts">
    import '@material/web/slider/slider.js';
    import { NUMERICSLIDER_LOGGER } from '$lib/components/ComponentLoggers.js';
    import { MdSlider } from '@material/web/slider/slider.js';
    import { isNullOrUndefined, NumberControlBox } from '@freon4dsl/core';
    import { onMount } from 'svelte';
    import type { FreComponentProps } from '$lib/components/svelte-utils/FreComponentProps.js';

    const LOGGER = NUMERICSLIDER_LOGGER;

    // Props
    let { editor, box }: FreComponentProps<NumberControlBox> = $props();

    // Variables set from the box.
    // box.displayInfo is completely set, it is done in NumberControlBox constructor
    let id: string = box.id;
    let value: number = $state(box.getNumber());
    let min: number = $state(box.displayInfo!.min)!;
    let max: number = $state(box.displayInfo!.max)!;
    let step: number = $state(box.displayInfo!.step)!;
    let showMarks: boolean = $state(box.displayInfo!.showMarks)!;

    let sliderElement: MdSlider;

    const onChange = (event: Event) => {
        LOGGER.log(
            'NumericSliderComponent.onChange for box ' + box.role + ', value:' + sliderElement.value
        );
        value = !isNullOrUndefined(sliderElement.value) ? sliderElement.value : 0;
        box.setNumber(value);
        if (box.selectable) {
            editor.selectElementForBox(box);
        }
        event.stopPropagation();
    };

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
        LOGGER.log('REFRESH NumberControlBox: ' + why);
        value = box.getNumber();
    };

    onMount(() => {
        value = box.getNumber();
    });

    $effect(() => {
        // runs after the initial onMount
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    /**
     * Function dragStart is here to prevent the event bubbling up to a ListComponent, or other component
     * that supports drag and drop.
     * @param event
     */
    const dragStart = (event: MouseEvent & { currentTarget: EventTarget & HTMLInputElement }) => {
        event.preventDefault();
    };
</script>

<span class="numeric-slider-component" {id}>
    <md-slider
        labeled
        ticks={showMarks}
        {min}
        {max}
        {step}
        {value}
        draggable={true}
        ondragstart={dragStart}
        role="slider"
        aria-valuenow={value}
        tabindex={0}
        onchange={onChange}
        bind:this={sliderElement}
    >
    </md-slider>
</span>
