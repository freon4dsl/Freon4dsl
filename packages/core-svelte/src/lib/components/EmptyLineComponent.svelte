<script lang="ts">
    /**
     * This component shows an empty line in the projection.
     */
    import { componentId } from '$lib';
    import type { FreComponentProps } from '$lib/components/svelte-utils/FreComponentProps.js';
    import { EmptyLineBox, isNullOrUndefined } from '@freon4dsl/core';

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let { editor, box }: FreComponentProps<EmptyLineBox> = $props();
    let id: string = isNullOrUndefined(box) ? componentId(box) : 'empty-line-for-unknown-box';
</script>

<span {id}>
    <br />
</span>
