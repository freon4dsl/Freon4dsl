<script lang="ts">
    import RenderComponent from "./RenderComponent.svelte";
    import { onMount, afterUpdate } from "svelte";
    import { FreLogger, type FreEditor, ElementBox, Box } from "@freon4dsl/core";
    import { componentId } from "./svelte-utils/index.js";

    export let box: ElementBox;
    export let editor: FreEditor;

    const LOGGER = new FreLogger("FragmentComponent");
    let id: string;
    let childBox: Box;
    let cssClass: string;

    const refresh = (why?: string): void =>  {
        LOGGER.log("REFRESH FragmentComponent (" + why +")" + box?.node?.freLanguageConcept());
        if (!!box) {
            id = componentId(box);
            childBox = box.content;
            cssClass = box.cssClass;
        } else {
            id = 'element-for-unknown-box';
        }
    }

    async function setFocus(): Promise<void> {
        LOGGER.log("FragmentComponent.setFocus for box " + box.role);
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

<span class="fragment-component {cssClass}">
    <RenderComponent box={childBox} editor={editor}/>
</span>
