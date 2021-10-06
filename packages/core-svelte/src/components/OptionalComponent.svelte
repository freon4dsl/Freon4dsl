<script lang="ts">
    import RenderComponent from "./RenderComponent.svelte";
    import { onDestroy, onMount, afterUpdate } from "svelte";
    import { autorun } from "mobx";
    import { OptionalBox, PiLogger } from "@projectit/core";
    import type { PiEditor } from "@projectit/core";
    import { AUTO_LOGGER, FOCUS_LOGGER } from "./ChangeNotifier";

    export let optionalBox = new OptionalBox(null, "boxRole", null, null, null, "This is a box");
    export let editor: PiEditor;

    const LOGGER = new PiLogger("OptionalComponent");

    onDestroy(() => {
        LOGGER.log("DESTROY OPTIONAL COMPONENT ["+ text + "]")
    });

    let mustShow = false;
    let showByCondition = false;

    let element: HTMLDivElement =null;
    const setFocus = async (): Promise<void> => {
        FOCUS_LOGGER.log("OptionalComponent.setFocus on box " + optionalBox.role);
        if (!!element) {
            element.focus();
        }
    };

    onMount( () => {
        optionalBox.setFocus = setFocus;
    });
    afterUpdate( () => {
        optionalBox.setFocus = setFocus;
    });

    let text: string;
    autorun( () => {
        mustShow = optionalBox.mustShow;
        showByCondition = optionalBox.showByCondition;
        text = "Dummy OptionalBox";
        AUTO_LOGGER.log("OptionalComponent ["+ text + "]")
    });
</script>

<div class="optional"
     tabIndex={0}
     bind:this={element}
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
        font-weight: bold;
        padding: 3px;
        white-space: normal;
        display: inline-block;
    }
</style>
