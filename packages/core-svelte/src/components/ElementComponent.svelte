<script lang="ts">
    import RenderComponent from "./RenderComponent.svelte";
    import { onMount, afterUpdate } from "svelte";
    import { PiLogger, type PiEditor, ElementBox } from "@projectit/core";

    export let elementBox: ElementBox;//= new OptionalBox(null, "boxRole", null, null, null, "This is a box");
    export let editor: PiEditor;

    const LOGGER = new PiLogger("ElementComponent").mute();
    let id: string = `${elementBox.element.piId()}-${elementBox.role}`;
    let childBox = elementBox.content ;

    const refresh = (): void =>  {
        console.log("DIRTY ElementBox for " + elementBox.element.piLanguageConcept() + "-" + elementBox.element.piId());
        childBox = elementBox.content;
    }

    onMount( () => {
        elementBox.refreshComponent = refresh;
    });
    
    afterUpdate( () => {
        elementBox.refreshComponent = refresh;
    });

</script>

<RenderComponent box={childBox} editor={editor} />

<style>
</style>
