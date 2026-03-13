<script lang="ts">
    /**
     * This component shows an empty line in the projection.
     */
    import { componentId } from '../index.js';
    import type { FreComponentProps } from './svelte-utils/FreComponentProps.js';
    import type { EmptyLineBox } from '@freon4dsl/core';
    import { isNullOrUndefined } from '@freon4dsl/core';

    let { box, readonly }: FreComponentProps<EmptyLineBox> = $props();
    let id: string = $derived(isNullOrUndefined(box) ? componentId(box) : 'empty-line-for-unknown-box');
</script>

<span {id} class="{box.cssClass}" class:readonly={readonly}>
    <br />
</span>
