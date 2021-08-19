<Dialog width="350" bind:visible={$deleteUnitDialogVisible} on:keydown={handleKeydown}>
	<div slot="title" class="title">Deleting unit</div>

	<div class="content">
		Do you really want to delete unit "{$toBeDeleted.name}" from the server?
	</div>

	<div slot="actions" class="actions center">
		<Button color="var(--secondary)" on:click={() => handleCancel()}>Cancel</Button>
		<Button color="var(--theme-colors-color)" on:click={() => handleSubmit()}>Submit</Button>
	</div>

	<div slot="footer" class="footer">
		This action cannot be undone!
	</div>
</Dialog>


<script lang="ts">
	import {Button, Dialog} from 'svelte-mui';
	import { currentModelName, deleteUnitDialogVisible, toBeDeleted } from "../WebappStore";
	import {EditorCommunication} from "../editor/EditorCommunication";
	import { currentUnitName } from "../WebappStore";
	import type PiNamedElement from "@projectit/core";

	let props = {
		right: false,
		ripple: true,
		disabled: false,
	};

	const handleCancel = () => {
		console.log("Cancel called ");
		$toBeDeleted = null;
		$deleteUnitDialogVisible = false;
	}

	const handleSubmit = () => {
		console.log("Submit called, unit to be deleted: " + $toBeDeleted.name + "." + $currentModelName);
		EditorCommunication.getInstance().deleteModelUnit($toBeDeleted);
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
		color: var(--theme-colors-color);
	}
	.title {
		color: var(--theme-colors-inverse_color);
	}
	.content {
		color: var(--theme-colors-color);
	}
</style>
