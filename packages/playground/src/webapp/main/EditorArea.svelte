<div class="editorArea">
    <ProjectItComponent editor={editorEnvironment.editor}/>
</div>

<script lang="ts">
    import { ProjectItComponent } from "@projectit/core-svelte";
    import { editorEnvironment } from "../WebappConfiguration";
</script>

<style>
    .editorArea{
        max-width: 1500px;
    }
</style>
