<svelte:options immutable={true}/>
<script lang="ts">
    import { ELEMENT_LOGGER } from "$lib/components/ComponentLoggers.js";
    import RenderComponent from "./RenderComponent.svelte";
    import { onMount, afterUpdate } from "svelte";
    import { type FreEditor, ElementBox, Box } from "@freon4dsl/core";
    import { componentId } from "./svelte-utils/index.js";

    export let box: ElementBox;
    export let editor: FreEditor;

    const LOGGER = ELEMENT_LOGGER
    let id: string;
    let childBox: Box ;

    const refresh = (why?: string): void =>  {
        LOGGER.log("REFRESH ElementComponent (" + why +")" + box?.node?.freLanguageConcept());
        if (!!box) {
            id = componentId(box);
            childBox = box.content;
        } else {
            id = 'element-for-unknown-box';
        }
    }

    async function setFocus(): Promise<void> {
        LOGGER.log("ElementComponent.setFocus for box " + box.role);
        if (!!box) {
            box.content.setFocus();
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

<RenderComponent box={childBox} editor={editor}/>
