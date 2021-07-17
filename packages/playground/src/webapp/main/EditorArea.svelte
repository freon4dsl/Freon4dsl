<div class="editorArea">
    <h4>Showing unit <i>{unitName}</i> of model <i>{modelName}</i></h4>
<!--    <img src ="/img/editor-screenshot-april-6-2020.png" alt ="Editor Content">-->
    <ProjectItComponent  editor={editor}/>
    <LabelComponent editor={editor}/>
<!--    <OptionalComponent editor={editor}/> TODO this one makes the size of the view too small to show an editor-->
    <br>
    <button name="name change" on:click={update}>name change</button>
    <button on:click={addEntity}>add entity</button>
    <br/>
    Aantal: {kids}
    <DropdownComponent
            getOptions={() => {return [{id: "1", label:"one"}, {id: "2", label:"two"}, {id: "3", label: "drie"}]}}
            on:pi-ItemSelected={selected}
            selectedOptionId="2"
            open={true}
    />
</div>

<script lang="ts">
    import { ProjectItComponent, DropdownComponent, LabelComponent, OptionalComponent } from "@projectit/core-svelte";
    import { currentUnitName, currentModelName } from "../menu-ts-files/WebappStore";
    import {get} from 'svelte/store';
    import {ExampleEnvironment} from "../../example/environment/gen/ExampleEnvironment";
    import {PiEditor} from "@projectit/core";
    import {Entity, ExModel} from "../../example/language/gen";
    import {createModel} from "../ExampleModel";
    import {action} from "mobx";

    // const createModel= (): ExModel => {
    //     console.log("createModel called");
    //     const result = new ExModel();
    //     result.name = "My First Svelte Example Model";
    //     console.log("setting model name");
    //     currentModelName.set(result.name);
    //     const e1 = new  Entity();
    //     e1.name = "SvelteEntity"
    //     result.entities.push(e1)
    //     return result;
    // }

    // added to get real editor view inserted
    console.log("DOING IT");
    console.log("\n");
    const model: ExModel = createModel();
    console.log("DONE");
    const env = new ExampleEnvironment();
    const editor: PiEditor = env.editor;
    editor.rootElement = model;

    let x = 1;
    let kids: number = 122;
    const update = () => {
        console.log("Changing model name")
        x++;
        model.name = "+" + model.name + "_!";
    };
    const addEntity = () => {
        // Inside action or multiple updates will be triggered by mobx.
        action(() => {
            const ent = Entity.create({ name: "Entity next " + x })
            model.entities.push(ent);
            model.name = model.name + "_!";
            console.log("AddEntity " + ent.name);
        })();
    };
    const selected = (event: CustomEvent) => {
        console.log("ExmpleApp.selected " + event.detail.label);
    }
    //
    let modelName: string;
    let unitName: string;
    currentModelName.subscribe(() => {modelName = get(currentModelName)})
    currentUnitName.subscribe(() => {unitName = get(currentUnitName)})

</script>
<style>
    .editorArea{
        max-width: 1500px;
    }
</style>
