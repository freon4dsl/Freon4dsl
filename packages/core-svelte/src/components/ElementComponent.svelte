<script lang="ts">
    import RenderComponent from "./RenderComponent.svelte";
    import { onDestroy, onMount, afterUpdate } from "svelte";
    import { PiLogger, type PiEditor, ElementBox } from "@projectit/core";
    import { FOCUS_LOGGER, MOUNT_LOGGER } from "./ChangeNotifier";

    export let elementBox: ElementBox;//= new OptionalBox(null, "boxRole", null, null, null, "This is a box");
    export let editor: PiEditor;

    const LOGGER = new PiLogger("ElementComponent").mute();
    let id: string = `${elementBox.element.piId()}-${elementBox.role}`;
    let childBox = elementBox.content ;

    const dirty = (): void =>  {
        console.log("DIRTY ElementBox for " + elementBox.element.piLanguageConcept() + "-" + elementBox.element.piId());
        childBox = elementBox.content;
    }

    onMount( () => {
        elementBox.dirty = dirty;
    });
    
    afterUpdate( () => {
        elementBox.dirty = dirty;
    });

</script>

<RenderComponent box={childBox} editor={editor} />

<style>
</style>
