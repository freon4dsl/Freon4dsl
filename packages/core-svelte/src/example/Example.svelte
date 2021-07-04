<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import { PiEditor, PiLogger } from "@projectit/core";
	import type { PiElement, PiProjection } from "@projectit/core";
	import { ExampleActions } from "../model/ExampleActions";
	import ProjectItComponent from "../components/ProjectItComponent.svelte";
	import { ExampleEnvironment } from "./environment/gen/ExampleEnvironment";
	import { createModel } from "./ExampleModel";
	import DropdownComponent from "../components/DropdownComponent.svelte";
	import { autorun, action } from "mobx";
	import { Entity } from "./language/gen/Entity";
	import { ExModel } from "./language/gen/ExModel";

	export let name;

	let x = 1; // observable.box(1);
	const model: ExModel = createModel();
	const actions = new ExampleActions();
	const env = new ExampleEnvironment();
	const editor: PiEditor = env.editor;
	editor.rootElement = model;

	PiLogger.unmuteAllLogs();
	const update = () => {
		console.log("Changeing model name")
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
	const addAttribute = () => {
		// Inside action or multiple updates will be triggered by mobx.
		action(() => {
			// const att = SvelteAttribute.create({ name: "Attribute " + x++ })
			// model.modelUnits[0].entities[0].attributes.push(att);
			// console.log("AddAttribute ");
		})();
	};
	const delEntity = () => {
		action(() => {
			// model.modelUnits[0].entities.splice(1, 1);
			// console.log("delete [" + model.modelUnits[0].entities.length + "]");
		})();
	};

	const selected = (event: CustomEvent) => {
		console.log("ExmpleApp.selected " + event.detail.label);
	}

	let element: PiElement;
	let text: string;
	// let project: Box = null;
	// let oldProject: Box = project;
	let kids: number;

	autorun(() => {
		// project = editor.rootBox;
		console.log("AUTORUN ExamopleApp.svelte");
		// kids = (project as VerticalListBox).children[1].children.length;
		// console.log("================= project is " + project.kind + "  kids is "+ kids);
	});
</script>

	<main class="main">
		<b>Hello {name}!</b><br/>
		------------------------------------------
		<br/>
		<ProjectItComponent editor={editor}/>
		<br>
		<button name="name change" on:click={update}>name change</button>
		<button on:click={addEntity}>add entity</button>
		<button on:click={delEntity}>delete entity</button>
		<button on:click={addAttribute}>add attribute</button>
		<br/>
		Aantal: {kids}
		<DropdownComponent
				getOptions={() => {return [{id: "1", label:"one"}, {id: "2", label:"two"}]}}
				on:pi-ItemSelected={selected}
				selectedOptionId="2"
		/>
	</main>

<style>
	main {
		/*text-align: left;*/
		padding: 1em;
		max-width: 1500px;
		margin: 0 auto;
	}

	h1 {
		color: blue;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

</style>
