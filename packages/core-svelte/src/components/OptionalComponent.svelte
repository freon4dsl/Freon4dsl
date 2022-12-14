<script lang="ts">
    import RenderComponent from "./RenderComponent.svelte";
    import { onDestroy, onMount, afterUpdate } from "svelte";
    import { getRoot, OptionalBox, PiLogger, type PiEditor } from "@projectit/core";
    import { FOCUS_LOGGER, MOUNT_LOGGER } from "./ChangeNotifier";

    export let optionalBox: OptionalBox;//= new OptionalBox(null, "boxRole", null, null, null, "This is a box");
    export let editor: PiEditor;

    const LOGGER = new PiLogger("OptionalComponent").mute();
    let id: string = `${optionalBox.element.piId()}-${optionalBox.role}`;
    let childBox ;
    let mustShow = optionalBox.mustShow;
    let showByCondition = false;
    let element: HTMLDivElement = null;

    const refresh = (): void => {
        LOGGER.log("DIRTY OptionalBox");
        mustShow = optionalBox.mustShow;
        showByCondition =optionalBox.condition();
        childBox = optionalBox.box;
    };

    const setFocus = async (): Promise<void> => {
        FOCUS_LOGGER.log("OptionalComponent.setFocus on box " + optionalBox.role);
        if (mustShow || showByCondition) {
            optionalBox.box.firstEditableChild.setFocus();
        } else {
            optionalBox.whenNoShowingAlias.setFocus();
        }
    };

    onMount( () => {
        optionalBox.setFocus = setFocus;
        optionalBox.refreshComponent = refresh;
    });

    afterUpdate( () => {
        optionalBox.setFocus = setFocus;
        optionalBox.refreshComponent = refresh;
    });

    refresh();

</script>

<div class="optional"
     tabIndex={0}
     bind:this={element}
     id="{id}"
>
    {#if mustShow || showByCondition}
        <RenderComponent box={optionalBox.box} editor={editor} />
    {:else}
        <RenderComponent box={optionalBox.whenNoShowingAlias} editor={editor} />
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
