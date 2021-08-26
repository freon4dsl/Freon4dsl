<script>
    import { ProjectItComponent } from "@projectit/core-svelte";
    import { editorEnvironment } from "../WebappConfiguration";
    import StatusBar from "./StatusBar.svelte";
    import { noUnitAvailable } from "../webapp-ts-utils/WebappStore";
</script>

<style>
    .editor-grid {
        position: absolute;
        width: 100%;
        height: 100%;
    }
    .message {
        padding: 12px;
    }
    .editor {
        position: relative;
        width: 100%;
        height: calc(100% - var(--pi-statusbar-height));
    }
</style>

<div class="editor-grid">
     {#if ($noUnitAvailable)}
        <div class="message">
            Please, select, create, or import Unit to be shown.
        </div>
    {:else}
        <StatusBar/>
         <div class="editor">
           <ProjectItComponent editor={editorEnvironment.editor}/>
         </div>
    {/if}
</div>
