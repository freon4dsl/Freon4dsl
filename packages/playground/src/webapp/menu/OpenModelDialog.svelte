<Dialog width="290" bind:visible={$openModelDialogVisible}>
	<div slot="title">Open model:</div>

	{#each $modelNames as name}
		<Radio {...props} bind:group={internalSelected} value={name}>
			<span>{name}</span>
		</Radio>
	{/each}

	<div slot="actions" class="actions center">
		<Button color="secondary" on:click={() => handleCancel()}>Cancel</Button>
		<Button color="primary" on:click={() => handleSubmit()}>Submit</Button>
	</div>

	<div slot="footer" class="footer">
		Which model would you like to open?
	</div>
</Dialog>

<script lang="ts">
	import {Button, Radio, Dialog} from 'svelte-mui';
	import {currentModelName, modelNames, openModelDialogVisible } from "../WebappStore";
	import {EditorCommunication} from "../editor/EditorCommunication";

	let internalSelected: string = $currentModelName;

	let props = {
		right: false,
		ripple: true,
		disabled: false,
	};
	const handleCancel = () => {
		console.log("Cancel called, model selected: " + internalSelected);
		$openModelDialogVisible = false;
	}

	const handleSubmit = () => {
		if (internalSelected?.length > 0) {
			EditorCommunication.getInstance().openModel(internalSelected);
		}
		console.log("Submit called, model selected: " + $currentModelName);
		$openModelDialogVisible = false;
	}
</script>

<style>
	.footer {
		text-align: center;
		margin-bottom: 1rem;
		font-size: 13px;
	}
</style>
