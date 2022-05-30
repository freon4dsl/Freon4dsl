<div class='editor-part'>
    {#if ($noUnitAvailable)}
        <div class="message">
        <div class="mdc-typography--subtitle1">
            Please, select, create, or import Unit to be shown.
        </div>
            </div>
    {:else}
        <ProjectItComponent editor={editorEnvironment.editor}/>
    {/if}
</div>

<script lang="ts">
    import { ProjectItComponent } from "@projectit/core-svelte";
    import { editorEnvironment } from "../../config/WebappConfiguration";
    import { noUnitAvailable } from "../stores/ModelStore";
    // TODO check the height of all elements so that scrollbars are shown correctly
</script>

<style>
    .editor-part {
        height: 100%;
    }
    .message {
        margin: 30px;
        text-align: center;
    }
</style>
