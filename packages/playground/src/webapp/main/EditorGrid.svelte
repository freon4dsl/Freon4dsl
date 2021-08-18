<script>
    import { ProjectItComponent } from "@projectit/core-svelte";
    import { editorEnvironment } from "../WebappConfiguration";
    import StatusBar from "./StatusBar.svelte";

    let orientation = "rows";
    let fixed = false;
    let fixedPos = 20;

</script>

<style>
    .editor-grid {
        position: relative;
        width: 100%;
        height: 100%;

    }
</style>

<div class="editor-grid">
    <StatusBar/>
    <ProjectItComponent editor={editorEnvironment.editor}/>
</div>
