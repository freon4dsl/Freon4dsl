<script lang="ts">
    import { CHECKBOX_LOGGER } from './ComponentLoggers.js';

    /**
     * This component shows a boolean value as checkbox.
     */
    import { BooleanControlBox, isNullOrUndefined } from '@freon4dsl/core';
    import { componentId } from '../index.js';
    import { onMount } from 'svelte';
    import '@material/web/checkbox/checkbox.js';
    import { MdCheckbox } from '@material/web/checkbox/checkbox.js';
    import type { FreComponentProps } from './svelte-utils/FreComponentProps.js';

    // Props
    let { editor, box }: FreComponentProps<BooleanControlBox> = $props();

    const LOGGER = CHECKBOX_LOGGER;

    let id: string = !isNullOrUndefined(box) ? componentId(box) : 'checkbox-for-unknown-box';
    let inputElement: MdCheckbox;
    let value = $state((box as BooleanControlBox).getBoolean());

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
        LOGGER.log('REFRESH BooleanControlBox: ' + why);
        value = box.getBoolean();
    };

    onMount(() => {
        value = box.getBoolean();
    });

    $effect(() => {
        // runs after the initial onMount
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    const onClick = (event: MouseEvent) => {
        event.stopPropagation();
        LOGGER.log(
            'CheckBoxComponent.onClick for box ' + box.role + ', box value: ' + box.getBoolean()
        );
    };

    const onChange = (event: MouseEvent) => {
        value = inputElement.checked;
        box.setBoolean(value);
        if (box.selectable) {
            editor.selectElementForBox(box);
        }
        event.stopPropagation();
        LOGGER.log(
            'CheckBoxComponent.onClick for box ' + box.role + ', box value: ' + box.getBoolean()
        );
    };
</script>

<span {id} class="boolean-checkbox-component {box.cssClass}">
    <!-- svelte-ignore a11y_click_events_have_key_events   -->
    <md-checkbox
        aria-label={id}
        aria-checked="mixed"
        onclick={onClick}
        onchange={onChange}
        bind:this={inputElement}
        checked={value}
        role="checkbox"
        tabindex="0"
    ></md-checkbox>
</span>
