<script lang="ts">
    import { ELEMENT_LOGGER } from './ComponentLoggers.js';
    import RenderComponent from './RenderComponent.svelte';
    import { Box, ElementBox, isNullOrUndefined } from '@freon4dsl/core';
    import { componentId } from '../index.js';
    import type { FreComponentProps } from './svelte-utils/FreComponentProps.js';

    let { editor, box }: FreComponentProps<ElementBox> = $props();

    const LOGGER = ELEMENT_LOGGER;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let id: string = $state('');

    let childBox: Box | undefined = $state(undefined);

    const refresh = (why?: string): void => {
        LOGGER.log('REFRESH ElementComponent (' + why + ')' + box?.node?.freLanguageConcept());
        if (!isNullOrUndefined(box)) {
            id = componentId(box);
            childBox = box.content;
        } else {
            id = 'element-for-unknown-box';
        }
    };

    async function setFocus(): Promise<void> {
        LOGGER.log('ElementComponent.setFocus for box ' + box.role);
        if (!isNullOrUndefined(box)) {
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

{#if !isNullOrUndefined(childBox)}
    <RenderComponent box={childBox} {editor} />
{/if}
