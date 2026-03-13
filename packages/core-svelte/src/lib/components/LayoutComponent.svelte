<script lang="ts">
    import { LAYOUT_LOGGER } from './ComponentLoggers.js';
    import { untrack, tick } from 'svelte';

    /**
     * This component shows a list of various boxes (no 'true' list). It can be shown
     * horizontally or vertically. In the latter case, the elements are each separated by
     * a break ('<br>').
     */
    import RenderComponent from './RenderComponent.svelte';
    import { type Box, FreLogger, ListDirection, type LayoutBox, notNullOrUndefined } from '@freon4dsl/core';
    import { componentId } from '../index.js';
    import ErrorMarker from './ErrorMarker.svelte';
    import type { FreComponentProps } from './svelte-utils/FreComponentProps.js';

    // Props
    let { editor, box, readonly }: FreComponentProps<LayoutBox> = $props();

    let LOGGER: FreLogger = LAYOUT_LOGGER;
    let id: string = $state('');
    let element: HTMLSpanElement = $state()!;
    let children: Box[] = $state([]);
    let isHorizontal: boolean = $state(true);

    let errorCls: string = $state(''); // CSS class name for when the node is erroneous
    let errMess: string[] = $state([]); // error message to be shown when element is hovered

    async function setFocus(): Promise<void> {
        if (notNullOrUndefined(element)) {
            element.focus();
        }
    }

    $effect(() => {
        // runs after the initial onMount
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
        // Use untrack to avoid triggering state_unsafe_mutation error in Svelte 5
        untrack(() => {
            refreshInternal('Refresh Layout box changed ' + box?.id);
        });
    });

    /** Internal refresh function. Should be wrapped in untrack() when called from effects. */
    const refreshInternal = (why?: string): void => {
        LOGGER.log('REFRESH LayoutComponent (' + why + ')' + box?.node?.freLanguageConcept());
        id = notNullOrUndefined(box) ? componentId(box) : 'layout-for-unknown-box';
        children = [...box.children];
        isHorizontal = box.getDirection() === ListDirection.HORIZONTAL;
        if (box.hasError) {
            errorCls = !isHorizontal
                ? 'layout-component-vertical-error'
                : 'layout-component-horizontal-error';
            errMess = box.errorMessages;
        } else {
            errorCls = '';
            errMess = [];
        }
    };

    /** External refresh function exposed to box.refreshComponent.
     *  Defers state mutations to after the current reactive cycle. */
    const refresh = (why?: string): void => {
        tick().then(() => {
            refreshInternal(why);
        });
    };
</script>


{#if readonly}
    <span
        class="layout-component {errorCls} {box.cssClass} readonly"
        {id}
        class:layout-component-horizontal={isHorizontal}
        class:layout-component-vertical={!isHorizontal}
        tabindex="-1"
    >
    {#if isHorizontal}
        {#each children as child (child.id)}
            <RenderComponent box={child} {editor} {readonly} />
        {/each}
    {:else}
        {#each children as child (child.id)}
            <!--            {#if i > 0 && i < children.length && !(isEmptyLineBox(children[i - 1]))}
                <br/>
            {/if}
-->
            <RenderComponent box={child} {editor} {readonly} />
        {/each}
    {/if}
</span>
{:else }
    {#if errMess.length > 0}
        <ErrorMarker {editor} {readonly} {box} />
    {/if}
    <span
        class="layout-component {errorCls} {box.cssClass}"
        {id}
        class:layout-component-horizontal={isHorizontal}
        class:layout-component-vertical={!isHorizontal}
        tabindex="-1"
        bind:this={element}
    >
    {#if isHorizontal}
        {#each children as child (child.id)}
            <RenderComponent box={child} {editor} {readonly} />
        {/each}
    {:else}
        {#each children as child (child.id)}
            <!--            {#if i > 0 && i < children.length && !(isEmptyLineBox(children[i - 1]))}
                <br/>
            {/if}
-->
            <RenderComponent box={child} {editor} {readonly} />
        {/each}
    {/if}
</span>
{/if}
