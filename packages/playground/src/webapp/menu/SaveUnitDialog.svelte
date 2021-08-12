<Dialog width="290" bind:visible={$saveUnitDialogVisible}>
	<div slot="title" class="title">Save unit:</div>

	<p class="content">Unit is unnamed. Please, enter a name.</p>

	<Textfield
			name="unitname"
			autocomplete="off"
			bind:value={newName}
			bind:error="{localErrorMessage}"
			outlined="true"
			class="content"
	/>

	<div slot="actions" class="actions center">
		<Button color="var(--secondary)" on:click={() => handleCancel()}>Cancel</Button>
		<Button color="var(--color)" on:click={() => handleSubmit()}>Submit</Button>

	</div>

	<div slot="footer" class="footer">
		Under what name should the unit be saved?
	</div>
</Dialog>

<svelte:window on:keydown={handleKeydown}/>

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
		color: var(--color);
	}
	.title {
		color: var(--inverse-color);
	}
	.content {
		color: var(--color);
	}
</style>
