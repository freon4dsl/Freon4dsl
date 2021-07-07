<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { autorun } from "mobx";
    import { OptionalBox, PiLogger } from "@projectit/core";
    import type { PiEditor } from "@projectit/core";
    import { AUTO_LOGGER } from "./ChangeNotifier";

    export let optionalBox = new OptionalBox(null, "boxRole", null, null, null, "This is a box");
    export let editor: PiEditor;

    const LOGGER = new PiLogger("OptionalComponent").mute();

    onDestroy(() => {
        LOGGER.log("DESTROY OPTIONAL COMPONENT ["+ text + "]")
    });

    let element: HTMLDivElement =null;
    const setFocus = (): void => {
        LOGGER.log("OptionalComponent.set focus on " + element);
        if (element !== null) {
            element.focus();
        }
    };

    onMount( () => {
        optionalBox.setFocus = setFocus;
    });

    let text: string;
    autorun( () => {
        text = "Dummy OptionalBox";
        AUTO_LOGGER.log("AUTORUN OPTIONAL COMPONENT ["+ text + "]")
    });
</script>

<div class="optional"
     tabIndex={0}
     bind:this={element}
>
    {text}
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
