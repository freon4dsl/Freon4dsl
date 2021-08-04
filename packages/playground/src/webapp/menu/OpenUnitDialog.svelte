<Dialog width="290" bind:visible={$openUnitDialogVisible}>
	<div slot="title">Open unit:</div>

	{#each $unitNames as name}
		<Radio {...props} bind:group={internalSelected} value={name}>
			<span>{name}</span>
		</Radio>
	{/each}

	<div slot="actions" class="actions center">
		<Button color="secondary" on:click={() => handleCancel()}>Cancel</Button>
		<Button color="primary" on:click={() => handleSubmit()}>Submit</Button>
	</div>

	<div slot="footer" class="footer">
		Which unit would you like to open?
	</div>
</Dialog>

<script lang="ts">
	import {Button, Radio, Dialog} from 'svelte-mui';
	import {currentUnitName, openUnitDialogVisible, unitNames} from "../WebappStore";
	import {EditorCommunication} from "../editor/EditorCommunication";

	let internalSelected: string = $currentUnitName;

	let props = {
		right: false,
		ripple: true,
		disabled: false,
	};
	const handleCancel = () => {
		console.log("Cancel called, unit selected: " + internalSelected);
		$openUnitDialogVisible = false;
	}

	const handleSubmit = () => {
		EditorCommunication.getInstance().openModelUnit(internalSelected);
		console.log("Submit called, unit selected: " + $currentUnitName);
		$openUnitDialogVisible = false;
	}
</script>

<style>
	.footer {
		text-align: center;
		margin-bottom: 1rem;
		font-size: 13px;
	}
</style>
