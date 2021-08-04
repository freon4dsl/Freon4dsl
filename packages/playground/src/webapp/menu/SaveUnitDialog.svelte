<Dialog width="290" bind:visible={$saveUnitDialogVisible}>
	<div slot="title">Save unit:</div>

	<p>Unit is unnamed. Please, enter a name.</p>

	<Textfield
			name="unitname"
			autocomplete="off"
			bind:value={newName}
			bind:error="{localErrorMessage}"
			outlined="true"
	/>

	<div slot="actions" class="actions center">
		<Button color="secondary" on:click={() => handleCancel()}>Cancel</Button>
		<Button color="primary" on:click={() => handleSubmit()}>Submit</Button>
	</div>

	<div slot="footer" class="footer">
		Under what name should the unit be saved?
	</div>
</Dialog>

<script lang="ts">
	import {Button, Textfield, Dialog} from 'svelte-mui';
	// get the unit names because all unit names in a model must be unique
	import {currentUnitName, saveUnitDialogVisible, unitNames} from "../WebappStore";
	import {EditorCommunication} from "../editor/EditorCommunication";

	let newName: string;
	let localErrorMessage: string = "";

	let props = {
		right: false,
		ripple: true,
		disabled: false,
	};

	const handleCancel = () => {
		console.log("Cancel called, unit called: " + newName);
		localErrorMessage = "";
		newName = "";
		$saveUnitDialogVisible = false;
	}

	const handleSubmit = () => {
		if ($unitNames.includes(newName)) {
			localErrorMessage = "Unit with this name already exists";
		} else if (!newName.match(/^[a-z,A-Z][a-z,A-Z,0-9,_]*$/)) {
			// TODO this message is too long, must use wrap
			localErrorMessage = "Name may contain only characters and numbers, and must start with a character.";
		} else {
			EditorCommunication.getInstance().setUnitName(newName);
			EditorCommunication.getInstance().saveCurrentUnit();
			console.log("Submit called, unit name: " + $currentUnitName);
			localErrorMessage = "";
			newName = "";
			$saveUnitDialogVisible = false;
		}
	}
</script>

<style>
	.footer {
		text-align: center;
		margin-bottom: 1rem;
		font-size: 13px;
	}
	/*.footer a {*/
	/*	color: #f50057;*/
	/*	padding-left: 1rem;*/
	/*}*/
</style>
