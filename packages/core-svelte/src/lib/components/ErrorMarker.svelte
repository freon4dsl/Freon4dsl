<script lang="ts">
    import { tick } from 'svelte';
    import ErrorTooltip from '$lib/components/ErrorTooltip.svelte';
    import { Box } from '@freon4dsl/core';
    import { viewport } from '$lib/components/stores/AllStores.svelte.js';
    import type {ErrorProps, FreComponentProps} from "$lib";


    let { element, box }: ErrorProps = $props();

    let top = $state(10);
    let height = $state(8);

    async function calcPos() {
        await tick();
        if (element) {
            let elementRect = element.getBoundingClientRect();
            if (elementRect) {
                // console.log(`ErrorMarker top ${elementRect.top} bottom ${elementRect.bottom} height ${elementRect.height} viewport.top ${$viewport.top}`)
                // get the position of the element relative to the editor view
                top = elementRect.top - viewport.value.top;
            } else {
                console.log('No bounding rect');
            }
        } else {
            console.log('NO element');
        }
    }

    $effect(() => {
        // runs after the initial onMount
        calcPos();
    });

    function ignore(m: MouseEvent) {
        m.stopPropagation();
        m.preventDefault();
    }

    // todo Calculate parentLeft, or change it to parentRight. At the moment we assume that the ErrorMarker is at the left border of the FreonComponent.
</script>

<!-- svelte-ignore a11y_click_events_have_key_events-->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<span
    onclick={ignore}
    class="error-positioning"
    style="top: {top}px; height: {height}px;"
    role="contentinfo"
>
    <ErrorTooltip {box} hasErr={true} parentTop={top} parentLeft={2}>
        <span class="error-marker" style="height: {height}px;">&nbsp</span>
    </ErrorTooltip>
</span>
