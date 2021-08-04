<Dialog width="350" bind:visible={$deleteUnitDialogVisible}>
	<div slot="title">Deleting unit:</div>

	<div>
		"{$currentUnitName}" of model "{$currentModelName}"
	</div>

	<div slot="actions" class="actions center">
		<Button color="secondary" on:click={() => handleCancel()}>Cancel</Button>
		<Button color="primary" on:click={() => handleSubmit()}>Submit</Button>
	</div>

	<div slot="footer" class="footer">
		Do you really want to delete this unit from the server?
	</div>
</Dialog>

<script lang="ts">
	import {Button, Dialog} from 'svelte-mui';
	import {currentModelName, deleteUnitDialogVisible} from "../WebappStore";
	import {EditorCommunication} from "../editor/EditorCommunication";
	import { currentUnitName } from "../WebappStore";

	let props = {
		right: false,
		ripple: true,
		disabled: false,
	};
	const handleCancel = () => {
		console.log("Cancel called ");
		$deleteUnitDialogVisible = false;
	}

	const handleSubmit = () => {
		console.log("Submit called, unit to be deleted: " + $currentUnitName + "." + $currentModelName);
		EditorCommunication.getInstance().deleteCurrentUnit();
		$deleteUnitDialogVisible = false;
	}
</script>

<style>
	.footer {
		text-align: center;
		margin-bottom: 1rem;
		font-size: 13px;
	}
</style>
