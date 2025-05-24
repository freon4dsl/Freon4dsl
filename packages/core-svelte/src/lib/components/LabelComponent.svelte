<script lang="ts">
    import { LABEL_LOGGER } from '$lib/components/ComponentLoggers.js';

    /**
     * This component shows a piece of non-editable text.
     */
    import { onMount } from 'svelte';
    import { isNullOrUndefined, LabelBox } from '@freon4dsl/core';
    import { componentId } from '$lib';
    import type { FreComponentProps } from '$lib/components/svelte-utils/FreComponentProps.js';

    let { box }: FreComponentProps<LabelBox> = $props();

    const LOGGER = LABEL_LOGGER;

    let id: string = !isNullOrUndefined(box) ? componentId(box) : 'label-for-unknown-box';
    let element: HTMLSpanElement | undefined = $state(undefined);
    let style: string = $state('');
    let cssClass: string = $state('');
    let text: string = $state('');

    $effect(() => {
        // runs after the initial onMount
        if (!isNullOrUndefined(box)) {
            box.refreshComponent = refresh;
        }
    });

    const refresh = (why?: string) => {
        LOGGER.log('REFRESH LabelComponent (' + why + ')');
        if (!isNullOrUndefined(box)) {
            text = box.getLabel();
            style = box.cssStyle;
            cssClass = box.cssClass;
        }
    };

    $effect(() => {
        // Evaluated and re-evaluated when the box changes.
        refresh('FROM component ' + box?.id);
    });
</script>

<!-- todo the 'text' here may contain spaces and other nasty stuff, should clean it up before using it as class-->
<span class="label-component {text} {cssClass}" {style} bind:this={element} {id}>
    {text}
</span>
