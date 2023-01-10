<svelte:options immutable={true}/>
<script lang="ts">
    import RenderComponent from "./RenderComponent.svelte";
    import { onMount, afterUpdate } from "svelte";
    import { PiLogger, type PiEditor, ElementBox } from "@projectit/core";
    import { componentId } from "./svelte-utils";

    export let box: ElementBox;
    export let editor: PiEditor;

    const LOGGER = new PiLogger("ElementComponent");
    let id: string;
    let childBox ;

    const refresh = (why?: string): void =>  {
        LOGGER.log("REFRESH ElementComponent (" + why +")" + box?.element?.piLanguageConcept());
        if (!!box) {
            id = componentId(box);
            childBox = box.content;
        } else {
            id = 'element-for-unknown-box';
        }
    }

    async function setFocus(): Promise<void> {
        LOGGER.log("ListComponent.setFocus for box " + box.role);
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

<RenderComponent box={childBox} editor={editor} />
