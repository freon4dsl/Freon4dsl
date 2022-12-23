<script lang="ts">
    import RenderComponent from "./RenderComponent.svelte";
    import { onMount, afterUpdate } from "svelte";
    import { PiLogger, type PiEditor, ElementBox } from "@projectit/core";

    export let box: ElementBox;
    export let editor: PiEditor;

    const LOGGER = new PiLogger("ElementComponent");
    let id: string;
    let childBox ;

    const refresh = (why?: string): void =>  {
        LOGGER.log("REFRESH ElementComponent (" + why +")" + box?.element?.piLanguageConcept());
        if (!!box) {
            id = `${box?.element?.piId()}-${box?.role}`;
            childBox = box.content;
        }
    }

    onMount( () => {
        box.refreshComponent = refresh;
    });

    afterUpdate( () => {
        box.refreshComponent = refresh;
    });

    $: { // Evaluated and re-evaluated when the box changes.
        refresh(box?.$id);
    }
</script>

<RenderComponent box={childBox} editor={editor} />

<style>
</style>
