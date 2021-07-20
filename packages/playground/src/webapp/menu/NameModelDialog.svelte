<Dialog width="290" bind:visible>
	<div slot="title" class="title">Give name to model</div>

	<Textfield
			name="modelname"
			autocomplete="off"
			bind:value={modelName}
			bind:error="{localErrorMessage}"
			outlined="true"
	/>

	<div slot="actions" class="actions center">
		<Button color="secondary" on:click={() => handleCancel()}>Cancel</Button>
		<Button color="primary" on:click={() => handleSubmit()}>Submit</Button>
	</div>

	<div slot="footer" class="footer">
		Please enter a name for the model
	</div>
</Dialog>

<script lang="ts">
	import {Button, Dialog, Textfield} from 'svelte-mui';
	import {currentModelName} from "../menu-ts-files/WebappStore";
	import {get} from 'svelte/store';
	import {EditorCommunication} from "../editor/EditorCommunication";

	export let visible: boolean = false;
	export let modelNames: string[];
	let modelName: string;
	let localErrorMessage: string = "";

	let props = {
		right: false,
		ripple: true,
		disabled: false,
	};

	// TODO dialog must also respond to enter key: submit

	const handleCancel = () => {
		// reset all variables
		modelName = "";
		localErrorMessage = "";
		visible = false;
	}

	const handleSubmit = () => {
		if (modelNames.includes(modelName)) {
			localErrorMessage = "Model with this name already exists";
		} else if (!modelName.match(/^[a-z,A-Z][a-z,A-Z,0-9,_]*$/)) {
			// TODO this message is too long, must use wrap
			localErrorMessage = "Name may contain only characters and numbers, and must start with a character.";
		} else {
			EditorCommunication.getInstance().setModelName(modelName);
			console.log("NameModelDialog::submit called, model is named: " + get(currentModelName));
			// reset all variables
			modelName = "";
			localErrorMessage = "";
			visible = false;
		}
	}
</script>

<style>
	.footer {
		text-align: center;
		margin-bottom: 1rem;
		font-size: 13px;
		color: var(--pi-darkblue);
	}
	.title {
		background: var(--pi-darkblue);
	}
</style>
