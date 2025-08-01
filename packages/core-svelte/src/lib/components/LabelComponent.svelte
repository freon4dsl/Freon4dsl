<script lang="ts">
    import { LABEL_LOGGER } from './ComponentLoggers.js';

    /**
     * This component shows a piece of non-editable text.
     */
    import { notNullOrUndefined, LabelBox } from '@freon4dsl/core';
    import { componentId } from '../index.js';
    import type { FreComponentProps } from './svelte-utils/FreComponentProps.js';

    let { box }: FreComponentProps<LabelBox> = $props();

    const LOGGER = LABEL_LOGGER;

    let id: string = notNullOrUndefined(box) ? componentId(box) : 'label-for-unknown-box';
    let element: HTMLSpanElement | undefined = $state(undefined);
    let style: string = $state('');
    let cssClass: string = $state('');
    let text: string = $state('');

    $effect(() => {
        // runs after the initial onMount
        if (notNullOrUndefined(box)) {
            box.refreshComponent = refresh;
        }
        // Evaluated and re-evaluated when the box changes.
        refresh('FROM component ' + box?.id);
    });

    const refresh = (why?: string) => {
        LOGGER.log('REFRESH LabelComponent (' + why + ')');
        if (notNullOrUndefined(box)) {
            text = box.getLabel();
            style = box.cssStyle;
            cssClass = box.cssClass;
        }
    };
</script>

<!-- todo the 'text' here may contain spaces and other nasty stuff, should clean it up before using it as class-->
<span class="label-component {text} {cssClass}" {style} bind:this={element} {id}>
    {text}
</span>
