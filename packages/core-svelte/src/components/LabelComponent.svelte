<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { autorun } from "mobx";
    import { LabelBox, PiLogger } from "@projectit/core";
    import type { PiEditor } from "@projectit/core";
    import { AUTO_LOGGER, FOCUS_LOGGER } from "./ChangeNotifier";

    export let label = new LabelBox(null, "boxRole", "This is a box");
    export let editor: PiEditor;

    const LOGGER = new PiLogger("LabelComponent");

    onDestroy(() => {
        LOGGER.log("DESTROY LABEL  COMPONENT ["+ text + "]")
    });

    let element: HTMLDivElement =null;
    const setFocus = async (): Promise<void> => {
        LOGGER.log("LabelComponent.setFocus on " + element);
        if (element !== null) {
            // element.focus();
        }
    };

    onMount( () => {
       label.setFocus = setFocus;
    });

    let text: string;
    autorun( () => {
        text = label.getLabel();
        AUTO_LOGGER.log("LabelComponent ["+ text + "]")
    });

    const onFocusHandler = (e: FocusEvent) => {
        FOCUS_LOGGER.log("onFocus for box " + label.role);
        // if(!!e) {
        //     e.preventDefault();
        //     e.stopPropagation();
        // }
    }
    const onBlurHandler = (e: FocusEvent) => {
        FOCUS_LOGGER.log("onBlur for box " + label.role);
        // if(!!e) {
        //     e.preventDefault();
        //     e.stopPropagation();
        // }
    }

</script>

<div class="label"
     tabIndex={0}
     on:focus={onFocusHandler}
     on:blur={onBlurHandler}
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
