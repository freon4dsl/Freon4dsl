<Dialog width="290" bind:visible={$newModelDialogVisible}>
	<div slot="title" class="title">New model</div>

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
		Please enter the name of the new model
	</div>
</Dialog>

<script lang="ts">
	import {Button, Dialog, Textfield} from 'svelte-mui';
	import { currentModelName, modelNames, newModelDialogVisible } from "../WebappStore";
	import {EditorCommunication} from "../editor/EditorCommunication";

	let modelName: string;
	let localErrorMessage: string = "";

	let props = {
		right: false,
		ripple: true,
		disabled: false,
	};

	// TODO dialog must also respond to enter key: submit

	function resetVariables() {
		modelName = "";
		localErrorMessage = "";
		$newModelDialogVisible = false;
	}

	const handleCancel = () => {
		// reset all variables
		resetVariables();
	}

	const handleSubmit = () => {
		if ($modelNames.includes(modelName)) {
			localErrorMessage = "Model with this name already exists";
		} else if (!modelName.match(/^[a-z,A-Z][a-z,A-Z,0-9,_]*$/)) {
			// TODO this message is too long, must use wrap
			localErrorMessage = "Name may contain only characters and numbers, and must start with a character.";
		} else {
			EditorCommunication.getInstance().newModel(modelName);
			console.log("Submit called, new model is named: " + $currentModelName);
			// reset all variables
			resetVariables();
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
