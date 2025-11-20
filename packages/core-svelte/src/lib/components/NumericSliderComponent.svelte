<script lang="ts">
    import { NUMERICSLIDER_LOGGER } from './ComponentLoggers.js';
    import { notNullOrUndefined } from '@freon4dsl/core';
    import type { NumberControlBox } from '@freon4dsl/core';
    import { onMount } from 'svelte';
    import type { FreComponentProps } from './svelte-utils/FreComponentProps.js';

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

    let inputElement: HTMLInputElement;
    let tooltip: HTMLSpanElement;
    let trackWrapper: HTMLSpanElement;

    const onChange = (event: Event) => {
        LOGGER.log(
          'NumericSliderComponent.onChange for box ' + box.role + ', value:' + inputElement?.value
        );
        value = notNullOrUndefined(inputElement.value) ? Number(inputElement.value) : 0;
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
        inputElement.focus();
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
        // Evaluated and re-evaluated when the box changes.
        refresh('Refresh numeric slider box changed ' + box?.id);
    });

    /**
     * Function dragStart is here to prevent the event bubbling up to a ListComponent, or other components
     * that supports drag and drop.
     * @param event
     */
    const dragStart = (event: DragEvent) => {
        event.preventDefault();
    };

    /**
     * Function styles the slider track and thumb based on the current value of the inputElement
     */
    function updateSlider() {
        if (!inputElement || !tooltip || !trackWrapper) return;

        const innerValue = Number(value);
        const range = max - min || 1; // avoid divide by zero
        const ratioRaw = (innerValue - min) / range;
        const ratio = Math.min(1, Math.max(0, ratioRaw)); // clamp 0–1
        const percent = ratio * 100;

        inputElement.style.setProperty('--percent', String(percent));

        const wrapperWidth = trackWrapper.clientWidth;
        const styles = getComputedStyle(trackWrapper);
        const thumbSizeVar = styles.getPropertyValue('--numeric-slider-thumb-size').trim();
        const thumbWidth = thumbSizeVar.endsWith('px')
          ? Number(thumbSizeVar.replace('px', ''))
          : 18;

        const x = ratio * (wrapperWidth - thumbWidth) + thumbWidth / 2;

        tooltip.style.left = `${x}px`;
    }

    $effect(() => {
        updateSlider();
    });
</script>

<span
  bind:this={trackWrapper}
  class="numeric-slider-component {box.cssClass}"
  draggable={true}
  {id}
  ondragstart={dragStart}
  role="slider"
  aria-valuenow={value}
  tabindex={0}
>
		<input
      bind:this={inputElement}
      bind:value
      class="numeric-slider-input"
      max={max}
      min={min}
      step={step}
      type="range"
      onchange={onChange}
    />
		<span aria-hidden="true" bind:this={tooltip} class="numeric-slider-tooltip">{value}</span>
	</span>
