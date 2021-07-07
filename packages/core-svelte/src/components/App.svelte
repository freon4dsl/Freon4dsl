<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import type { VerticalListBox, Box } from "@projectit/core";
	import { PiEditor, PiLogger } from "@projectit/core";
	import type { PiElement, PiProjection } from "@projectit/core";
	import { ExampleActions } from "../model/ExampleActions";
	import ProjectItComponent from "./ProjectItComponent.svelte";
	import { createModel } from "../model/Example";
	import { SvelteAttribute } from "../model/SvelteAttribute";
	import { SvelteEntity } from "../model/SvelteEntity";
	import type { SvelteModel } from "../model/SvelteModel";
	import { SvelteProjection } from "../model/SvelteProjection";
	import DropdownComponent from "./DropdownComponent.svelte";
	import { autorun, action } from "mobx";
	import RenderComponent from "./RenderComponent.svelte";

	export let name;

	let x = 1; // observable.box(1);
	const model: SvelteModel = createModel();
	const actions = new ExampleActions();
	const projection: PiProjection = new SvelteProjection();
	const editor: PiEditor = new PiEditor(projection, actions)
	editor.rootElement = model;

	PiLogger.unmuteAllLogs();
	const update = () => {
		console.log("Changeing model name")
		x++;
		model.modelUnits[0].name = "+" + model.modelUnits[0].name + "_!";
	};
	const addEntity = () => {
		// Inside action or multiple updates will be triggered by mobx.
		action(() => {
			const ent = SvelteEntity.create({ name: "Entity next " + x })
			model.modelUnits[0].entities.push(ent);
			model.modelUnits[0].name = model.modelUnits[0].name + "_!";
			console.log("AddEntity " + model.modelUnits[0].entities);
		})();
	};
	const addAttribute = () => {
		// Inside action or multiple updates will be triggered by mobx.
		action(() => {
			const att = SvelteAttribute.create({ name: "Attribute " + x++ })
			model.modelUnits[0].entities[0].attributes.push(att);
			// console.log("AddAttribute ");
		})();
	};
	const delEntity = () => {
		action(() => {
			model.modelUnits[0].entities.splice(1, 1);
			// console.log("delete [" + model.modelUnits[0].entities.length + "]");
		})();
	};

	const selected = (event: CustomEvent) => {
		console.log("App.selected " + event.detail.label);
	}

	let element: PiElement;
	let text: string;
	// let project: Box = null;
	// let oldProject: Box = project;
	let kids: number;

	autorun(() => {
		// project = editor.rootBox;
		console.log("AUTORUN App.svelte");
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
