<script lang="ts">
    import { tick } from 'svelte';
    import ErrorTooltip from '$lib/components/ErrorTooltip.svelte';
    import type { FreComponentProps } from "$lib";
    import {Box} from "@freon4dsl/core";

    let { editor, box }: FreComponentProps<Box> = $props();

    let top = $state(0);
    let height = $state(0);

    async function calcPos() {
        await tick();
        const elementRect = box.getClientRectangle();
        const editorRect = editor.getClientRectangle();
        if (elementRect && editorRect) {
            // console.log(`ErrorMarker top ${elementRect.y} left ${elementRect.x}, viewport.top ${editorRect.y}, viewport.left ${editorRect.x}`)
            // Get the position of the element relative to the editor view.
            top = elementRect.y - editorRect.y;
        } else {
            console.log('No bounding rect');
        }
    }

    $effect(() => {
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
    <ErrorTooltip {box} {editor} hasErr={true} parentTop={top} parentLeft={2}>
        <span class="error-marker" style="height: {height}px;">&nbsp</span>
    </ErrorTooltip>
</span>
