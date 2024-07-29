<!-- This component was copied from https://github.com/hperrin/svelte-material-ui/blob/master/packages/slider/src/Slider.svelte,
and stripped down to the parts that Freon needs. -->

<script lang="ts">
    import {FreEditor, FreLogger, NumberControlBox} from "@freon4dsl/core";
    import {MDCSliderFoundation, Thumb, TickMark} from '@material/slider';
    import {afterUpdate, onMount} from 'svelte';
    import Ripple from '@smui/ripple';
    import {classMap} from "@smui/common/internal";

    const LOGGER = new FreLogger("SwitchComponent");

    export let editor: FreEditor;
    export let box: NumberControlBox;

    let discrete: boolean = box.displayInfo.discrete;
    let tickMarks: boolean = box.displayInfo.showMarks;
    let step: number = box.displayInfo.step;
    let min: number = box.displayInfo.min;
    let max: number = box.displayInfo.max;
    let id: string = box.id;
    let value: number = box.getNumber();

    let valueToAriaValueTextFn: (value: number, thumb: Thumb) => string
        = ( value ) => `${value}`;

    let element: HTMLDivElement;
    let instance: MDCSliderFoundation;
    let input: HTMLInputElement;
    let thumbEl: HTMLDivElement;
    let thumbKnob: HTMLDivElement;
    let internalClasses: { [k: string]: boolean } = {};
    let thumbClasses: { [k: string]: boolean } = {};
    let inputAttrs: { [k: string]: string | undefined } = {};
    let trackActiveStyles: { [k: string]: string } = {};
    let thumbStyles: { [k: string]: string } = {};
    let thumbRippleActive: boolean = false;
    let currentTickMarks: TickMark[];

    if (tickMarks && step > 0) {
        if (typeof value === 'number') {
            const numberOfMarks = Math.floor((max - min) / step) + 1;
            if (numberOfMarks > 0) {
                currentTickMarks = Array(numberOfMarks); // creates an array of length 'numberOfMarks'
                for (let i = 0; i < numberOfMarks; i++) {
                    if ((min + i * step) <= value) {
                        currentTickMarks[i] = TickMark.ACTIVE;
                    } else {
                        currentTickMarks[i] = TickMark.INACTIVE;
                    }
                }
            }
        }
    }

    if (typeof value === 'number') {
        const percent = value / (max - min);
        trackActiveStyles.transform = `scaleX(${percent})`;
        thumbStyles.left = `calc(${percent * 100}% -24px)`;
        thumbStyles.size = `24px`;
    }

    let previousValue = value;
    $: if (instance) {
        if (previousValue !== value && typeof value === 'number') {
            instance.setValue(value);
        }
        previousValue = value;
        // Needed for range start to take effect.
        instance.layout();
    }

    async function setFocus(): Promise<void> {
        element.focus();
    }
    const refresh = (why?: string): void => {
        LOGGER.log("REFRESH NumberControlBox: " + why);
        value = box.getNumber();
    };
    afterUpdate(() => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    onMount(() => {
        value = box.getNumber();
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
        instance = new MDCSliderFoundation(
            {
                hasClass,
                addClass,
                removeClass,
                addThumbClass,
                removeThumbClass,
                getAttribute: (attribute) => element.getAttribute(attribute),
                getInputValue: (thumb: Thumb) =>
                    `${value ?? 0}`,
                setInputValue: (val, thumb: Thumb) => {
                    value = Number(val);
                    previousValue = value;
                },
                getInputAttribute: getInputAttr,
                setInputAttribute: addInputAttr,
                removeInputAttribute: removeInputAttr,
                focusInput: (thumb: Thumb) => {
                    input.focus();
                },
                isInputFocused: (thumb: Thumb) =>
                    input ===
                    document.activeElement,
                getThumbKnobWidth: (thumb: Thumb) =>
                    thumbKnob.getBoundingClientRect().width,
                getThumbBoundingClientRect: (thumb: Thumb) =>
                    thumbEl.getBoundingClientRect(),
                getBoundingClientRect: () => element.getBoundingClientRect(),
                getValueIndicatorContainerWidth: (thumb: Thumb) => {
                    return thumbEl
                        .querySelector<HTMLElement>(`.mdc-slider__value-indicator-container`)!
                        .getBoundingClientRect().width;
                },
                isRTL: () => getComputedStyle(element).direction === 'rtl',
                setThumbStyleProperty: addThumbStyle,
                removeThumbStyleProperty: removeThumbStyle,
                setTrackActiveStyleProperty: addTrackActiveStyle,
                removeTrackActiveStyleProperty: removeTrackActiveStyle,
                // Handled by Svelte.
                setValueIndicatorText: (_value, _thumb) => undefined,
                getValueToAriaValueTextFn: () => valueToAriaValueTextFn,
                updateTickMarks: (tickMarks) => {
                    currentTickMarks = tickMarks;
                },
                setPointerCapture: (pointerId) => {
                    element.setPointerCapture(pointerId);
                },
                registerEventHandler: (evtType, handler) => {
                    element.addEventListener(evtType, handler);
                },
                deregisterEventHandler: (evtType, handler) => {
                    element.removeEventListener(evtType, handler);
                },
                registerThumbEventHandler: (thumb, evtType, handler) => {
                    thumbEl.addEventListener(evtType, handler);
                },
                deregisterThumbEventHandler: (thumb, evtType, handler) => {
                    thumbEl.removeEventListener(evtType, handler);
                },
                registerInputEventHandler: (thumb, evtType, handler) => {
                    input.addEventListener(evtType, handler);
                },
                deregisterInputEventHandler: (thumb, evtType, handler) => {
                    input.removeEventListener(evtType, handler);
                },
                registerBodyEventHandler: (evtType, handler) => {
                    document.body.addEventListener(evtType, handler);
                },
                deregisterBodyEventHandler: (evtType, handler) => {
                    document.body.removeEventListener(evtType, handler);
                },
                registerWindowEventHandler: (evtType, handler) => {
                    window.addEventListener(evtType, handler);
                },
                deregisterWindowEventHandler: (evtType, handler) => {
                    window.removeEventListener(evtType, handler);
                },
            });

        instance.init();
        instance.layout({ skipUpdateUI: true });

        return () => {
            instance.destroy();
        };
    });

    // The functions hasClass, addClass, and removeClass are used by the MDC to set the tickmarks
    function hasClass(className) {
        return className in internalClasses
            ? internalClasses[className]
            : element.classList.contains(className);
    }

    function addClass(className) {
        if (!internalClasses[className]) {
            internalClasses[className] = true;
        }
    }

    function removeClass(className) {
        if (!(className in internalClasses) || internalClasses[className]) {
            internalClasses[className] = false;
        }
    }

    function addThumbClass(className, thumb) {
        if (!thumbClasses[className]) {
            thumbClasses[className] = true;
        }
    }

    function removeThumbClass(className, thumb) {
        if (!(className in thumbClasses) || thumbClasses[className]) {
            thumbClasses[className] = false;
        }
    }

    function addThumbStyle(name, value, thumb) {
        if (thumbStyles[name] != value) {
            if (name === 'size') {
                // This is a hack, better ways to do this appreciated.
                // Keep the old value, it is somehow overwritten by the SMUI Ripple, that calculates a very large ripple size.
                thumbStyles.size = `24px`;
            } else
                if (value === '' || value == null) {
                delete thumbStyles[name];
                thumbStyles = thumbStyles;
            } else {
                thumbStyles[name] = value;
            }
        }
    }

    function removeThumbStyle(name, thumb) {
        if (name in thumbStyles) {
            delete thumbStyles[name];
            thumbStyles = thumbStyles;
        }
    }

    function getInputAttr(name, thumb) {
        // Some custom logic for "value", since Svelte doesn't seem to actually
        // set the attribute, just the DOM property.
        if (name === 'value') {
            return `${value}`;
        }
        return name in inputAttrs
            ? inputAttrs[name] ?? null
            : input.getAttribute(name);
    }

    function addInputAttr(name, value, thumb) {
        if (inputAttrs[name] !== value) {
            inputAttrs[name] = value;
        }
    }

    function removeInputAttr(name, thumb) {
        if (!(name in inputAttrs) || inputAttrs[name] != null) {
            inputAttrs[name] = undefined;
        }
    }

    function addTrackActiveStyle(name, value) {
        if (trackActiveStyles[name] != value) {
            if (value === '' || value == null) {
                delete trackActiveStyles[name];
                trackActiveStyles = trackActiveStyles;
            } else {
                trackActiveStyles[name] = value;
            }
        }
    }

    function removeTrackActiveStyle(name) {
        if (name in trackActiveStyles) {
            delete trackActiveStyles[name];
            trackActiveStyles = trackActiveStyles;
        }
    }

</script>

<span
        bind:this={element}
        id="{id}"
        class={Object.entries({
	'freon-slider': true,
    'mdc-slider': true,
    'mdc-slider--discrete': discrete,
    'mdc-slider--tick-marks': discrete && tickMarks,
    ...internalClasses,
  })
    .filter(([name, value]) => name !== '' && value)
    .map(([name]) => name)
    .join(' ')}
>
    <input
            bind:this={input}
            class='mdc-slider__input'
            type="range"
            {step}
            {min}
            {max}
            bind:value
            on:blur
            on:focus
            {...inputAttrs}
    />
    <div class="mdc-slider__track">
        <div class="mdc-slider__track--inactive" />
        <div class="mdc-slider__track--active">
            <div
                    class="mdc-slider__track--active_fill"
                    style={Object.entries(trackActiveStyles)
          .map(([name, value]) => `${name}: ${value};`)
          .join(' ')}
            />
        </div>
        {#if discrete && tickMarks && step > 0}
            <div class="mdc-slider__tick-marks">
                {#each currentTickMarks as tickMark}
                    <div
                        class={tickMark === TickMark.ACTIVE
              ? 'mdc-slider__tick-mark--active'
              : 'mdc-slider__tick-mark--inactive'}
                    />
                {/each}
            </div>
        {/if}
    </div>
    <div
            bind:this={thumbEl}
            use:Ripple={{
        unbounded: true,
        active: thumbRippleActive,
        eventTarget: input,
        activeTarget: input,
        addClass: (className) => addThumbClass(className, Thumb.END),
        removeClass: (className) => removeThumbClass(className, Thumb.END),
        addStyle: (name, value) => addThumbStyle(name, value, Thumb.END),
      }}
            class={classMap({
        'mdc-slider__thumb': true,
        ...thumbClasses,
      })}
            style={Object.entries(thumbStyles)
        .map(([name, value]) => `${name}: ${value};`)
        .join(' ')}
    >
        {#if discrete}
            <div class="mdc-slider__value-indicator-container" aria-hidden="true">
                <div class="mdc-slider__value-indicator">
                    <span class="mdc-slider__value-indicator-text">{value}</span>
                </div>
            </div>
        {/if}
        <div bind:this={thumbKnob} class="mdc-slider__thumb-knob" />
    </div>
</span>

<style>
    .freon-slider {
        --mdc-theme-primary: var(--freon-numeric-slider-color, var(--mdc-theme-primary));
        width: 250px;
    }
</style>
