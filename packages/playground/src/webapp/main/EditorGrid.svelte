<script>
    import { ProjectItComponent } from "@projectit/core-svelte";
    import { editorEnvironment } from "../WebappConfiguration";
    import StatusBar from "./StatusBar.svelte";
    import { noUnitAvailable } from "../WebappStore";
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
    <!-- {#if ($noUnitAvailable)}-->
    <!--    <div class="message">-->
    <!--        Please, select, create, or import Unit to be shown.-->
    <!--    </div>-->
    <!--{:else}-->
    <!--    <StatusBar/>-->
    <!--    <ProjectItComponent editor={editorEnvironment.editor}/>-->
    <!--{/if}-->
</div>
