<script lang="ts">
    import { FRAGMENT_LOGGER } from "$lib/components/ComponentLoggers.js";
    import RenderComponent from "./RenderComponent.svelte";
    import { onMount, afterUpdate } from "svelte";
    import {FreLogger, type FreEditor, Box, FragmentBox} from "@freon4dsl/core";
    import { componentId } from "$lib/components/svelte-utils/index.js";

    export let box: FragmentBox;
    export let editor: FreEditor;

    const LOGGER = FRAGMENT_LOGGER
    let id: string;
    let childBox: Box;
    let cssClass: string;

    const refresh = (why?: string): void =>  {
        LOGGER.log("REFRESH FragmentComponent (" + why +")" + box?.node?.freLanguageConcept());
        if (!!box) {
            id = componentId(box);
            childBox = box.childBox;
            cssClass = box.cssClass;
        } else {
            id = 'element-for-unknown-box';
        }
    }

    async function setFocus(): Promise<void> {
        LOGGER.log("FragmentComponent.setFocus for box " + box.role);
        if (!!box) {
            box.childBox.setFocus();
        }
    }

    onMount( () => {
        box.refreshComponent = refresh;
        box.setFocus = setFocus;
    });

    afterUpdate( () => {
        box.refreshComponent = refresh;
        box.setFocus = setFocus;
    });

    $: { // Evaluated and re-evaluated when the box changes.
        refresh(box?.$id);
    }
</script>

<span class="fragment-component {cssClass}" id="{id}">
    <RenderComponent box={childBox} editor={editor}/>
</span>
