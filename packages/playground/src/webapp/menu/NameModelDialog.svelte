<Dialog width="290" bind:visible={$nameModelDialogVisible}>
	<div slot="title" class="title">Give name to model</div>

	<Textfield
			name="modelname"
			autocomplete="off"
			bind:value={modelName}
			bind:error="{localErrorMessage}"
			outlined="true"
			class="content"
	/>

	<div slot="actions" class="actions center">
		<Button color="var(--secondary)" on:click={() => handleCancel()}>Cancel</Button>
		<Button color="var(--theme-colors-color)" on:click={() => handleSubmit()}>Submit</Button>

	</div>

	<div slot="footer" class="footer">
		Please enter a name for the model
	</div>
</Dialog>

<svelte:window on:keydown={handleKeydown}/>

<script lang="ts">
	import {Button, Dialog, Textfield} from 'svelte-mui';
	import {EditorCommunication} from "../editor/EditorCommunication";
	import { nameModelDialogVisible, modelNames } from "../WebappStore";
	import { saveUnitInternal } from "../menu-ts-files/MenuUtils";

	let modelName: string;
	let localErrorMessage: string = "";

	let props = {
		right: false,
		ripple: true,
		disabled: false,
	};

	const handleCancel = () => {
		// reset all variables
		modelName = "";
		localErrorMessage = "";
		$nameModelDialogVisible = false;
	}

	const handleSubmit = () => {
		if ($modelNames.includes(modelName)) {
			localErrorMessage = "Model with this name already exists";
		} else if (!modelName.match(/^[a-z,A-Z][a-z,A-Z,0-9,_]*$/)) {
			// TODO this message is too long, must use wrap
			localErrorMessage = "Name may contain only characters and numbers, and must start with a character.";
		} else {
			EditorCommunication.getInstance().setModelName(modelName);
			// console.log("NameModelDialog::submit called, model is named: " + get(currentModelName));
			// reset all variables
			modelName = "";
			localErrorMessage = "";
			$nameModelDialogVisible = false;
			// back to normal flow
			saveUnitInternal();
		}
	}

	const handleKeydown = (event) => {
		switch (event.keyCode) {
			case 13: { // Enter key
				handleSubmit();
				break;
			}
		}
	}
</script>

<style>
	.footer {
		text-align: center;
		margin-bottom: 1rem;
		font-size: 13px;
		color: var(--theme-colors-color);
	}
	.title {
		color: var(--theme-colors-inverse_color);
	}
	.content {
		color: var(--theme-colors-color);
	}
</style>
