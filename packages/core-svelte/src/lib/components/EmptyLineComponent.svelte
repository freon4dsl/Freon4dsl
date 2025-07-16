<script lang="ts">
    /**
     * This component shows an empty line in the projection.
     */
    import { componentId } from '../index.js';
    import type { FreComponentProps } from './svelte-utils/FreComponentProps.js';
    import type { EmptyLineBox } from '@freon4dsl/core';
    import { isNullOrUndefined } from '@freon4dsl/core';

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let { editor, box }: FreComponentProps<EmptyLineBox> = $props();
    let id: string = isNullOrUndefined(box) ? componentId(box) : 'empty-line-for-unknown-box';
</script>

<span {id} class="{box.cssClass}">
    <br />
</span>
