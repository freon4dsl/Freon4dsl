<script lang="ts">
    /**
     * This component shows a boolean value as checkbox.
     */
    import { type BooleanControlBox, FreLanguage, isNullOrUndefined, notNullOrUndefined } from "@freon4dsl/core"
    import { componentId } from '../index.js';
    import { onMount } from 'svelte';
    import type { FreComponentProps } from './svelte-utils/FreComponentProps.js';
    import { CHECKBOX_LOGGER } from './ComponentLoggers.js';

    // Props
    let { editor, box, readonly }: FreComponentProps<BooleanControlBox> = $props();

    const LOGGER = CHECKBOX_LOGGER;

    let id: string = $derived(notNullOrUndefined(box) ? componentId(box) : 'checkbox-for-unknown-box');
    let inputElement: HTMLInputElement;
    let checked = $derived(box.getBoolean());

    let indeterminate = $derived(box.getBoolean() === null || box.getBoolean() === undefined);
    let isOptional: boolean = false
    /**
     * This function sets the focus on this element programmatically.
     * It is called from the box. Note that because focus can be set,
     * the HTML needs to have its tabindex set, and its needs to be bound
     * to a variable.
     */
    async function setFocus(): Promise<void> {
        inputElement.focus();
    }

    const refresh = (why?: string): void => {
        LOGGER.log('REFRESH BooleanCheckBoxComponent: ' + why + ` set to ${box.getBoolean()} checked is ${checked}`);
        // NB 
        // checked = box.getBooolen() doesn't work, although ity should
        checked = !checked
    };

    onMount(() => {
        LOGGER.log("onMOUNT runs now")
        checked = box.getBoolean();
    });

    $effect(() => {
        // runs after the initial onMount
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
        isOptional = FreLanguage.getInstance().classifierProperty(box.node.freLanguageConcept(), box.propertyName)?.isOptional || false
        // LOGGER.log(`EFFECT for '${box.propertyName}', property '${property?.name}' optional '${property?.isOptional}' `)
        // isOptional = (isNullOrUndefined(property) ? false : property.isOptional)        
    });

    /**
     * Deal with three values login ourselves
     * @param event
     */
    const onClick= (event: Event) => {
        event.stopPropagation();
        LOGGER.log(
            `ONCLICK IN  box for '${box.propertyName}' value: ${box.getBoolean()} indeterminate: ${indeterminate} isOptional: ${isOptional}`
        );
        checked = box.getBoolean() // inputElement.checked;
        if (isOptional) {
            if (isNullOrUndefined(checked)) {
                box.setBoolean(false)
                indeterminate = false
            } else if (checked === true) {
                box.setBoolean(undefined)
                indeterminate = true
            } else {
                box.setBoolean(true)
                indeterminate = false
            }
        } else {
            if (checked === true) {
                box.setBoolean(false)
            } else {
                box.setBoolean(true)
            }
        }
        LOGGER.log(
            `ONCLICK OUT box value: ${box.getBoolean()} indeterminate: ${indeterminate}`
        );
    }
</script>

<!--<span {id} class="boolean-checkbox-component {box.cssClass}">-->
    <!-- svelte-ignore a11y_click_events_have_key_events   -->
    <input {id} class="boolean-checkbox-component {box.cssClass} class:readonly={readonly}"
        type="checkbox"
        aria-label={id}
        aria-checked="mixed"
        onclick={onClick}
        bind:indeterminate
           bind:checked
        bind:this={inputElement}
        tabindex="0"
        disabled={readonly}
    >
<!--</span>-->
