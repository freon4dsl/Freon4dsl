<script lang="ts">
    import { OPTIONAL_LOGGER } from '$lib/components/ComponentLoggers.js';

    /**
     * This component display an optional part. It either shows the content of the
     * corresponding OptionalBox, or its placeholder.
     */
    import RenderComponent from './RenderComponent.svelte';
    import { OptionalBox2, Box, isNullOrUndefined } from '@freon4dsl/core';
    import { componentId } from '$lib';
    import type { FreComponentProps } from '$lib/components/svelte-utils/FreComponentProps.js';

    // Props
    let { editor, box }: FreComponentProps<OptionalBox2> = $props();

    const LOGGER = OPTIONAL_LOGGER;
    let id: string = $state(''); // an id for the html element showing the optional
    id = !isNullOrUndefined(box) ? componentId(box) : 'optional2-for-unknown-box';
    let childBox: Box = $state()!;
    let optionalBox: Box = $state()!;
    let mustShow = $state(false);
    let showByCondition = $state(false);
    let contentComponent: RenderComponent | undefined = $state();
    let placeholderComponent: RenderComponent | undefined = $state();

    const refresh = (why?: string): void => {
        LOGGER.log('REFRESH OptionalBox2: ' + why);
        mustShow = box.mustShow;
        showByCondition = box.condition();
        childBox = box.content;
        optionalBox = box.placeholder;
    };

    async function setFocus(): Promise<void> {
        LOGGER.log('setFocus on box ' + box.role);
        if (
            mustShow ||
            (showByCondition &&
                !!contentComponent &&
                !isNullOrUndefined(box.content.firstEditableChild))
        ) {
            box.content.firstEditableChild!.setFocus();
        } else if (!isNullOrUndefined(placeholderComponent)) {
            box.placeholder.setFocus();
        } else {
            LOGGER.error('OptionalComponent2 ' + id + ' has no elements to put focus on');
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

<span class="optional-component {box.cssClass}" {id}>
    {#if mustShow || showByCondition}
        <span class="optional-component-show">
            <RenderComponent box={childBox} {editor} bind:this={contentComponent} />
        </span>
    {:else}
        <span class="optional-component-hide">
            <RenderComponent box={optionalBox} {editor} bind:this={placeholderComponent} />
        </span>
    {/if}
</span>
