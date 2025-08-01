<script lang="ts">
    import { FRAGMENT_LOGGER } from './ComponentLoggers.js';
    import RenderComponent from './RenderComponent.svelte';
    import { Box, notNullOrUndefined } from '@freon4dsl/core';
    import type { FragmentBox } from '@freon4dsl/core';
    import { componentId } from './svelte-utils/index.js';
    import type { FreComponentProps } from './svelte-utils/FreComponentProps.js';

    let { editor, box }: FreComponentProps<FragmentBox> = $props();

    const LOGGER = FRAGMENT_LOGGER;
    let id: string = $state('');
    let childBox: Box | undefined = $state(undefined);
    let cssClass: string = $state('');

    const refresh = (why?: string): void => {
        LOGGER.log('REFRESH FragmentComponent (' + why + ') ' + box?.node?.freLanguageConcept());
        if (notNullOrUndefined(box)) {
            id = componentId(box);
            childBox = box.childBox;
            cssClass = box.cssClass;
        } else {
            id = 'element-for-unknown-box';
        }
    };

    async function setFocus(): Promise<void> {
        LOGGER.log('FragmentComponent.setFocus for box ' + box.role);
        if (notNullOrUndefined(box)) {
            box.childBox.setFocus();
        }
    }

    $effect(() => {
        // runs after the initial onMount
        box.refreshComponent = refresh;
        box.setFocus = setFocus;
        // Evaluated and re-evaluated when the box changes.
        refresh(box?.$id);
    });
</script>

{#if notNullOrUndefined(childBox)}
    <span class="fragment-component {cssClass}" {id}>
        <RenderComponent box={childBox} {editor} />
    </span>
{/if}
