<script lang="ts">
    import { isNullOrUndefined, type SvgBox } from '@freon4dsl/core';
    import { onMount } from 'svelte';
    import { componentId } from '$lib';
    import type { FreComponentProps } from '$lib/components/svelte-utils/FreComponentProps.js';
    import { LABEL_LOGGER } from '$lib/components/ComponentLoggers.js';

    let { box }: FreComponentProps<SvgBox> = $props();

    let id: string = $state('');
    let svgPath: string = $state('');
    let portWidth: number = $state(0);
    let portHeight: number = $state(0);
    let viewBoxWidth: number = $state(0);
    let viewBoxHeight: number = $state(0);
    let css: string = $state('');

    $effect(() => {
        // runs after the initial onMount
        box.refreshComponent = refresh;
    });

    const refresh = (why?: string) => {
        LABEL_LOGGER.log('Refresh SVG component ' + why);
        id = !isNullOrUndefined(box) ? componentId(box) : 'SVG-for-unknown-box';
        svgPath = box.svgPath;
        portWidth = box.viewPortWidth;
        portHeight = box.viewPortHeight;
        viewBoxWidth = box.viewBoxWidth;
        viewBoxHeight = box.viewBoxHeight;
        css = box.cssClass;
    };

    refresh();
</script>

<!-- Note that width and height in the svg tag set the size of the viewport, -->
<!-- whereas, the width and height in the viewBox set the size of the svg itself, -->
<!-- which means that it might, or might not fit in the viewport. -->
<svg
    class={css}
    width={portWidth}
    height={portHeight}
    viewBox="0 0 {viewBoxWidth} {viewBoxHeight}"
    {id}
>
    <path d={svgPath} style={box.cssStyle} />
</svg>
