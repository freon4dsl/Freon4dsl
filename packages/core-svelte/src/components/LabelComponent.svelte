<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { autorun } from "mobx";
    import { LabelBox, PiLogger } from "@projectit/core";
    import type { PiEditor } from "@projectit/core";
    import { AUTO_LOGGER } from "./ChangeNotifier";

    export let label = new LabelBox(null, "boxRole", "This is a box");
    export let editor: PiEditor;

    const LOGGER = new PiLogger("LabelComponent").mute();

    onDestroy(() => {
        LOGGER.log("DESTROY LABEL  COMPONENT ["+ text + "]")
    });

    let element: HTMLDivElement =null;
    const setFocus = (): void => {
        LOGGER.log("LabelComponent.set focus on " + element);
        if (element !== null) {
            element.focus();
        }
    };

    onMount( () => {
       label.setFocus = setFocus;
    });

    let text: string;
    autorun( () => {
        text = label.getLabel();
        AUTO_LOGGER.log("AUTORUN LABEL  COMPONENT ["+ text + "]")
    });
</script>

<div class="label"
     tabIndex={0}
     bind:this={element}
>
    {text}
</div>

<style>
    .label:empty:before {
        content: attr(data-placeholdertext);
    }

    .label {
        font-weight: bold;
        padding: 3px;
        white-space: normal;
        display: inline-block;
    }
</style>
