<script lang="ts">
    import { INDENT_LOGGER } from './ComponentLoggers.js';

    /**
     * This component indents the child of its (Indent)Box.
     * Every indent is 8px wide.
     */
    import { Box, isNullOrUndefined } from '@freon4dsl/core';
    import RenderComponent from './RenderComponent.svelte';
    import type { IndentBox } from '@freon4dsl/core';
    import { componentId } from '../index.js';
    import type { FreComponentProps } from './svelte-utils/FreComponentProps.js';

    // Props
    let { editor, box }: FreComponentProps<IndentBox> = $props();

    const LOGGER = INDENT_LOGGER;

    const indentWidth: number = 8;
    let style: string = $state(`margin-left: ${box?.indent * indentWidth}px;`);
    let id: string = !isNullOrUndefined(box) ? componentId(box) : 'indent-for-unknown-box';
    let child: Box | undefined = $state();

    $effect(() => {
        // runs after the initial onMount
        box.refreshComponent = refresh;
        // Evaluated and re-evaluated when the box changes.
        refresh(box?.$id);
    });

    const refresh = (why?: string): void => {
        LOGGER.log(
            'REFRESH Indent for box (' + why + ') ' + box?.role + ' child ' + box?.child?.role
        );
        child = box?.child;
        style = `margin-left: ${box?.indent * indentWidth}px;`;
    };
</script>

{#if !isNullOrUndefined(child)}
    <span {style} {id}>
        <RenderComponent box={child} {editor} />
    </span>
{/if}
