<script lang="ts">
    import { flushSync, tick } from "svelte"
    import { CHECKBOX_LOGGER } from './ComponentLoggers.js';

    /**
     * This component shows a boolean value as checkbox.
     */
    import { BooleanControlBox, FreLanguage, isNullOrUndefined, notNullOrUndefined } from "@freon4dsl/core"
    import { componentId } from '../index.js';
    import { onMount } from 'svelte';
    // import '@material/web/checkbox/checkbox.js';
    // import { MdCheckbox } from '@material/web/checkbox/checkbox.js';
    import type { FreComponentProps } from './svelte-utils/FreComponentProps.js';

    // Props
    let { editor, box }: FreComponentProps<BooleanControlBox> = $props();

    const LOGGER = CHECKBOX_LOGGER;

    let id: string = notNullOrUndefined(box) ? componentId(box) : 'checkbox-for-unknown-box';
    let inputElement: HTMLInputElement;
    let value = $state((box as BooleanControlBox).getBoolean());

    let indeterminate = $state((box as BooleanControlBox).getBoolean() === null || (box as BooleanControlBox).getBoolean() === undefined);
    let isOptional: boolean = false
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
        LOGGER.log('REFRESH BooleanCheckBoxComponent: ' + why);
        value = box.getBoolean();
    };

    onMount(() => {
        value = box.getBoolean();
    });

    $effect(() => {
        // runs after the initial onMount
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
        isOptional = FreLanguage.getInstance().classifierProperty(box.node.freLanguageConcept(), box.propertyName)?.isOptional || false
        // LOGGER.log(`EFFECT for '${box.propertyName}', property '${property?.name}' optional '${property?.isOptional} `)
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
        value = box.getBoolean() // inputElement.checked;
        if (isOptional) {
            if (isNullOrUndefined(value)) {
                box.setBoolean(false)
                indeterminate = false
            } else if (value === true) {
                box.setBoolean(undefined)
                indeterminate = true
            } else {
                box.setBoolean(true)
                indeterminate = false
            }
        } else {
            if (value === true) {
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
    <input {id} class="boolean-checkbox-component {box.cssClass}"
        type="checkbox"
        aria-label={id}
        aria-checked="mixed"
        onclick={onClick}
        bind:indeterminate
        bind:this={inputElement}
        checked={value}
        role="checkbox"
        tabindex="0"
    >
<!--</span>-->
