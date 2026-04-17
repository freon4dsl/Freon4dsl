<script lang="ts">
    import { ELEMENT_LOGGER } from './ComponentLoggers.js';
    import RenderComponent from './RenderComponent.svelte';
    import { type Box, type ElementBox, notNullOrUndefined } from '@freon4dsl/core';
    import { componentId } from '../index.js';
    import type { FreComponentProps } from './svelte-utils/FreComponentProps.js';

    let { editor, box, readonly = false }: FreComponentProps<ElementBox> = $props();

    const LOGGER = ELEMENT_LOGGER;
    let id: string = $state('');

    let childBox: Box | undefined = $state(undefined);
    let tabbable: number = 0; // todo get the value from the box, depending on the editor configuration

    const refresh = (why?: string): void => {
        LOGGER.log('REFRESH ElementComponent (' + why + ')' + box?.node?.freLanguageConcept());
        if (notNullOrUndefined(box)) {
            id = componentId(box);
            childBox = box.content;
        } else {
            id = 'element-for-unknown-box';
        }
    };

    async function setFocus(): Promise<void> {
        LOGGER.log('ElementComponent.setFocus for box ' + box.role);
        if (notNullOrUndefined(box)) {
            box.content.setFocus();
        }
    }

    $effect(() => {
        // runs after the initial onMount
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
        // Evaluated and re-evaluated when the box changes.
        refresh(box?.$id);
    });
</script>

{#if notNullOrUndefined(childBox)}
    <span class="element-component element-component-{box.node.freLanguageConcept()}" tabindex={tabbable}>
        <RenderComponent box={childBox} {editor} {readonly} />
    </span>
{/if}
