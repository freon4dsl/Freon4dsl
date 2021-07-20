<div class="editorArea">
<!--    tmp to see whether the names are set-->
    <h5>Showing unit <i>{unitName}</i> of model <i>{modelName}</i></h5>
<!--    end tmp-->
    <ProjectItComponent editor={editorEnvironment.editor}/>
</div>

<script lang="ts">
    import { ProjectItComponent } from "@projectit/core-svelte";
    import { currentUnitName, currentModelName } from "../menu-ts-files/WebappStore";
    import { get } from 'svelte/store';
    import { editorEnvironment } from "../WebappConfiguration";
    import { EditorCommunication } from "../editor/EditorCommunication";

    // initialize content in the ProjectItComponent
    EditorCommunication.getInstance().newModel("<unnamedModel>");

    // tmp to see whether the names are set
    let modelName: string;
    let unitName: string;
    currentModelName.subscribe(() => {modelName = get(currentModelName)})
    currentUnitName.subscribe(() => {unitName = get(currentUnitName)})
    // end tmp

</script>
<style>
    .editorArea{
        max-width: 1500px;
    }
</style>
