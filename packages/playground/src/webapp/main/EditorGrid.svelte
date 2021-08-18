<script>
    import { ProjectItComponent } from "@projectit/core-svelte";
    import { editorEnvironment } from "../WebappConfiguration";
    import StatusBar from "./StatusBar.svelte";
    import { initializing } from "../WebappStore";
</script>

<style>
    .editor-grid {
        position: relative;
        width: 100%;
        height: 100%;
    }
    .message {
        padding: 12px;
    }
</style>

<div class="editor-grid">
     {#if ($initializing)}
        <div class="message">
            Please, select Model and Unit to be shown.
        </div>
    {:else}
        <StatusBar/>
        <ProjectItComponent editor={editorEnvironment.editor}/>
    {/if}
</div>
