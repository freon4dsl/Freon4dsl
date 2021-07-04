<div class="editorArea">
    <h4>REALLY! Showing unit <i>{unitName}</i> of model <i>{modelName}</i></h4>
    <ProjectItComponent editor={editor}/>
</div>

<script lang="ts">
    import { PiEditor } from "@projectit/core";
    import ProjectItComponent from "../../../../../../core-svelte/src/components/ProjectItComponent.svelte";
    import { ExampleActions } from "../../example/editor/gen/ExampleActions";
    import { ExampleEnvironment } from "../../example/environment/gen/ExampleEnvironment";
    import { Entity } from "../../example/language/gen/Entity";
    import { ExModel } from "../../example/language/gen/ExModel";
    import { currentUnitName, currentModelName } from "../menu-ts-files/WebappStore";
    import { get } from "svelte/store";

    const createModel = (): ExModel => {
        const result = new ExModel();
        result.name = "My First Svelte Example Moddel";
        const e1 = new  Entity();
        e1.name = "SvelteEntity"
        result.entities.push(e1)
        return result;
    }

    const model: ExModel = createModel();
    const actions = new ExampleActions();
    const env = ExampleEnvironment.getInstance();
    const editor: PiEditor = env.editor as PiEditor;
    editor.rootElement = model;


    let modelName: string;
    let unitName: string;
    currentModelName.subscribe(() => {
        modelName = get(currentModelName);
    });
    currentUnitName.subscribe(() => {
        unitName = get(currentUnitName);
    });

</script>
<style>
    .editorArea{
        max-width: 1500px;
    }
</style>
