<script lang="ts">
    import RenderComponent from "./RenderComponent.svelte";
    import { onDestroy, onMount, afterUpdate } from "svelte";
    import { getRoot, OptionalBox, PiLogger, type PiEditor } from "@projectit/core";
    import { FOCUS_LOGGER, MOUNT_LOGGER } from "./ChangeNotifier";

    export let box: OptionalBox;//= new OptionalBox(null, "boxRole", null, null, null, "This is a box");
    export let editor: PiEditor;

    const LOGGER = new PiLogger("OptionalComponent").mute();
    let id: string = `${box.element.piId()}-${box.role}`;
    let childBox ;
    let mustShow = box.mustShow;
    let showByCondition = false;
    let element: HTMLDivElement = null;

    const refresh = (why?: string): void => {
        LOGGER.log("REFRESH OptionalBox");
        mustShow = box.mustShow;
        showByCondition =box.condition();
        childBox = box.box;
    };

    const setFocus = async (): Promise<void> => {
        FOCUS_LOGGER.log("OptionalComponent.setFocus on box " + box.role);
        if (mustShow || showByCondition) {
            box.box.firstEditableChild.setFocus();
        } else {
            box.whenNoShowingAlias.setFocus();
        }
    };

    onMount( () => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    afterUpdate( () => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    $: { // Evaluated and re-evaluated when the box changes.
        refresh(box?.$id);
    }
</script>

<div class="optional"
     tabIndex={0}
     bind:this={element}
     id="{id}"
>
    {#if mustShow || showByCondition}
        <RenderComponent box={childBox} editor={editor} />
    {:else}
        <RenderComponent box={box.whenNoShowingAlias} editor={editor} />
    {/if}
</div>

<style>
    .optional:empty:before {
        content: attr(data-placeholdertext);
    }

    .optional {
        padding: 3px;
        white-space: normal;
        display: inline-block;
    }
</style>
