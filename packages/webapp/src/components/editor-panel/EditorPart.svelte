<div class='editor-part'>
    <StatusBar/>
    <LinearProgress indeterminate closed="{!$editorProgressShown}" class="my-colored-bar"/>

    {#if ($noUnitAvailable)}
        <div class="message">
        <div class="mdc-typography--subtitle1">
            Please, select, create, or import Unit to be shown.
        </div>
            </div>
    {:else}
        <div class="editor">
            <ProjectItComponent editor={editorEnvironment.editor}/>
        </div>
    {/if}
</div>

<script lang="ts">
    import LinearProgress from '@smui/linear-progress';

    import StatusBar from "./StatusBar.svelte";
    import { ProjectItComponent } from "@projectit/core-svelte";
    import { editorEnvironment } from "../../config/WebappConfiguration";
    import { noUnitAvailable, editorProgressShown } from "../../stores/ModelStore";

</script>

<style>
    .message {
        margin: 30px;
        text-align: center;
    }
</style>
