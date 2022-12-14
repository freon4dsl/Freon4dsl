<script lang="ts">
    import RenderComponent from "./RenderComponent.svelte";
    import { onMount, afterUpdate } from "svelte";
    import { PiLogger, type PiEditor, ElementBox } from "@projectit/core";

    export let box: ElementBox;//= new OptionalBox(null, "boxRole", null, null, null, "This is a box");
    export let editor: PiEditor;

    const LOGGER = new PiLogger("ElementComponent");
    let id: string = `${box?.element?.piId()}-${box?.role}`;
    let childBox = box?.content ;

    const refresh = (): void =>  {
        console.log("DIRTY ElementBox for " + box?.element?.piLanguageConcept() + "-" + box?.element?.piId());
        if (!!box) {
            childBox = box.content;
        }
    }

    onMount( () => {
        box.refreshComponent = refresh;
        refresh();
    });

    afterUpdate( () => {
        box.refreshComponent = refresh;
        refresh();
    });

    refresh();

</script>

<RenderComponent box={childBox} editor={editor} />

<style>
</style>
