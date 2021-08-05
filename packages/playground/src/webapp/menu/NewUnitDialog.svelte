<Dialog width="290" bind:visible={$newUnitDialogVisible}>
	<div slot="title" class="title">New unit</div>

	<Textfield
			name="unitname"
			autocomplete="off"
			bind:value={newName}
			bind:error="{localErrorMessage}"
			outlined="true"
	/>

	{#each get(unitTypes) as name}
		<Radio {...props} bind:group={group} value={name}>
			<span class="item-name">{name}</span>
		</Radio>
	{/each}

	<div slot="actions" class="actions center">
		<Button color="var(--secondary)" on:click={() => handleCancel()}>Cancel</Button>
		<Button color="var(--color)" on:click={() => handleSubmit()}>Submit</Button>

	</div>

	<div slot="footer" class="footer">
		Please enter the name of the new unit
	</div>

</Dialog>

<script lang="ts">
	import { Button, Dialog, Radio, Textfield } from 'svelte-mui';
	import { unitNames, unitTypes } from "../WebappStore";
	import { get } from 'svelte/store';
	import { EditorCommunication } from "../editor/EditorCommunication";
	import { newUnitDialogVisible } from "../WebappStore";

	// all unit names in a model must be unique
	let newName: string = "";

	// take care of the type of unit to be created
	let group: string;
	$: group = $unitTypes[0];

	// if something is wrong show this message
	let localErrorMessage: string = "";

	// props for all of the radio buttons
	let props = {
		right: false,
		ripple: true,
		disabled: false,
		color: "var(--color)"
	};

	const handleCancel = () => {
		// console.log("Cancel called");
		$newUnitDialogVisible = false;
	}

	// TODO dialog must also respond to enter key: submit
	const handleSubmit = () => {
		if ($unitNames.includes(newName)) {
			localErrorMessage = "Unit with this name already exists";
		} else if (!newName.match(/^[a-z,A-Z][a-z,A-Z,0-9,_]*$/)) {
			// TODO this message is too long, must use wrap
			localErrorMessage = "Name may contain only characters and numbers, and must start with a character.";
		} else {
			if (newName?.length > 0) {
				EditorCommunication.getInstance().newUnit(newName, group);
			}
			// console.log("Submit called, unit created: " + get(currentUnitName));
			$newUnitDialogVisible = false;
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
	.item-name {
		color: var(--color);
	}
</style>
