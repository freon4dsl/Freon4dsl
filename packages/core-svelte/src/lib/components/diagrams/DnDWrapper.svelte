<script lang="ts">
    /**
     * The DiagramComponent, with a wrapper arouind it that supports drag and drop.
     * The drag and drop actions needs to be defined in the DiagramComponent.
     */
    import { SvelteFlowProvider } from '@xyflow/svelte';
    import DnDProvider from './DnDProvider.svelte';
    import DiagramComponent from "$lib/components/diagrams/DiagramComponent.svelte";
    import { DiagramBox, FreEditor } from "@freon4dsl/core";

    export let box: DiagramBox;
    export let editor: FreEditor

</script>

<SvelteFlowProvider>
    <DnDProvider>
        <DiagramComponent box={box} editor={editor} />
    </DnDProvider>
</SvelteFlowProvider>
