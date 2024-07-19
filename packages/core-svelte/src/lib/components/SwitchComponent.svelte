<!-- This component was copied from https://github.com/hperrin/svelte-material-ui/blob/master/packages/switch/src/Switch.svelte,
and stripped down to the parts that Freon needs. -->

<script lang="ts">
    import {type MDCSwitchRenderAdapter, MDCSwitchRenderFoundation, type MDCSwitchState} from '@material/switch';
    import {afterUpdate, onMount} from 'svelte';
    import Ripple from '@smui/ripple';
    import {BooleanControlBox, FreEditor, FreLogger} from "@freon4dsl/core";
    import {classMap} from "@smui/common/internal";

    const LOGGER = new FreLogger("RadioComponent");

    export let editor: FreEditor;
    export let box: BooleanControlBox;

    let id: string = box.id;
    let checked: boolean = box.getBoolean();

    let element: HTMLButtonElement;
    let instance: MDCSwitchRenderFoundation;
    let internalClasses: { [k: string]: boolean } = {};
    let rippleElement: HTMLDivElement;
    let rippleActive = false;

    // 'selected' and 'state' are needed for the MDCSwitchRenderFoundation
    let selected = checked === undefined ? false : checked;
    let state = {
        get disabled() {
            return false;
        },
        set disabled(value) {
        },
        get processing() {
            return false;
        },
        set processing(value) {
        },
        get selected() {
            return selected;
        },
        set selected(value) {
            selected = value;
        },
    } as MDCSwitchState;

    /**
     * This function sets the focus on this element programmatically.
     * It is called from the box. Note that because focus can be set,
     * the html needs to have its tabindex set, and its needs to be bound
     * to a variable.
     */
    async function setFocus(): Promise<void> {
        element.focus();
    }
    const refresh = (why?: string): void => {
        LOGGER.log("REFRESH BooleanControlBox: " + why);
        checked = box.getBoolean();
    };
    afterUpdate(() => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    onMount(() => {
        checked = box.getBoolean();
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
        instance = new MDCSwitchRenderFoundation({
            addClass,
            hasClass,
            isDisabled: () => false,
            removeClass,
            setAriaChecked: () => {
                // Handled automatically.
            },
            setDisabled: (value) => {
            },
            state,
        } as MDCSwitchRenderAdapter);

        instance.init();
        instance.initFromDOM();

        return () => {
            instance.destroy();
        };
    });

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

    function handleClick(event){
        instance.handleClick();
        checked = !checked;
        box.setBoolean(checked);
        if (box.selectable) {
            editor.selectElementForBox(box);
        }
        event.stopPropagation();
        LOGGER.log("Value is: "+ box.getBoolean());
    }

</script>

<button
        bind:this={element}
        use:Ripple={{
    unbounded: true,
    active: rippleActive,
    rippleElement,
    addClass,
    removeClass
  }}
        class={classMap({
		'freon-switch': true,
    'mdc-switch': true,
    ...internalClasses,
  })}
        type="button"
        role="switch"
        aria-checked={checked}
        on:click={handleClick}
>
    <div class="mdc-switch__track" />
    <div class="mdc-switch__handle-track">
        <div class="mdc-switch__handle">
            <div class="mdc-switch__shadow">
                <div class="mdc-elevation-overlay" />
            </div>
            <div class="mdc-switch__ripple" bind:this={rippleElement} />
            <div class='mdc-switch__icons'>
                <svg
                        class="mdc-switch__icon mdc-switch__icon--on"
                        viewBox="0 0 24 24"
                >
                    <path
                            d="M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z"
                    />
                </svg>
                <svg
                        class="mdc-switch__icon mdc-switch__icon--off"
                        viewBox="0 0 24 24"
                >
                    <path d="M20 13H4v-2h16v2z" />
                </svg>
            </div>
        </div>
    </div>
</button>

<style>
    /* Because not all colors of the material switch follow the theme colors,
    we set them here, one by one. */
    .freon-switch {
        --switch-track-color: color-mix(in srgb,var(--switch-color),#fff 75%);
        --switch-hover-color: color-mix(in srgb,var(--switch-color),#000 25%);
        --mdc-theme-primary: var(--switch-color);
        /* The default for these in @material/switch is a light pink */
        --mdc-switch-selected-track-color: var(--switch-track-color);
        --mdc-switch-selected-hover-track-color: var(--switch-track-color);
        --mdc-switch-selected-focus-track-color: var(--switch-track-color);
        --mdc-switch-selected-pressed-track-color: var(--switch-track-color);
        /* The default for these in @material/switch  is a dark purple */
        --mdc-switch-selected-hover-handle-color: var(--switch-hover-color);
        --mdc-switch-selected-focus-handle-color: var(--switch-hover-color);
        --mdc-switch-selected-pressed-handle-color: var(--switch-hover-color);
    }
</style>
