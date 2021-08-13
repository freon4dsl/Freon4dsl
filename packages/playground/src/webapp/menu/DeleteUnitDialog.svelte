<Dialog width="350" bind:visible={$deleteUnitDialogVisible}>
	<div slot="title" class="title">Deleting unit:</div>

	<div class="content">
		"{$currentUnitName}" of model "{$currentModelName}"
	</div>

	<div slot="actions" class="actions center">
		<Button color="var(--secondary)" on:click={() => handleCancel()}>Cancel</Button>
		<Button color="var(--color)" on:click={() => handleSubmit()}>Submit</Button>
	</div>

	<div slot="footer" class="footer">
		Do you really want to delete this unit from the server?
	</div>
</Dialog>

<svelte:window on:keydown={handleKeydown}/>

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
