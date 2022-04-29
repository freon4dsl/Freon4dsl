<!-- --bg-panel and --divider are parameters set by the svelte-mui library -->
<Dialog style={dialogStyle} bind:visible={$deleteModelDialogVisible} on:keydown={handleKeydown}>
	<div slot="title" class="title">Delete model</div>

	<div class="content">
		Select the model you want to delete. <br>
		<i>Note that this action cannot be undone!</i>
		{#each $modelNames as name}
			{#if (name !== $currentModelName)}
			<Radio {...props} bind:group={modelToBeDeleted} value={name}>
				<span class="item-name">{name}</span>
			</Radio>
			{/if}
		{/each}
	</div>

	<div slot="actions" class="actions">
		<Button style="color:var(--theme-colors-secondary_button_text)" on:click={() => handleCancel()}>Cancel</Button>
		<Button style="color:var(--theme-colors-primary_button_text)" on:click={() => handleSubmit()}>Submit</Button>
	</div>

	<div slot="footer" class="footer">
		This action cannot be undone!
	</div>
</Dialog>


<script lang="ts">
	import {Button, Dialog, Radio} from 'svelte-mui';
	import { currentModelName, deleteModelDialogVisible, modelNames } from "../../webapp-ts-utils/WebappStore";
	import { serverCommunication } from "../../WebappConfiguration";
	import { dialogStyle } from "../StyleConstants";

	let props = {
		right: false,
		ripple: true,
		disabled: false,
	};

	let modelToBeDeleted: string;

	const handleCancel = () => {
		// console.log("Cancel called ");
		modelToBeDeleted = "";
		$deleteModelDialogVisible = false;
	}

	const handleSubmit = () => {
		// console.log("DeleteModel.Submit called, model to be deleted: " + modelToBeDeleted);
		serverCommunication.deleteModel(modelToBeDeleted);
		modelToBeDeleted = "";
		$deleteModelDialogVisible = false;
	}

	const handleKeydown = (event) => {
		if ($deleteModelDialogVisible) {
			switch (event.keyCode) {
				case 13: { // Enter key
					event.stopPropagation();
					event.preventDefault();
					handleSubmit();
					break;
				}
			}
		}
	}
</script>

<style>
	.footer {
		text-align: center;
		margin-bottom: 1rem;
		font-size: 13px;
		color: var(--theme-colors-accent);
	}
	.actions {
		float: right;
	}
	.title {
		color: var(--theme-colors-inverse_color);
	}
	.content {
		color: var(--theme-colors-color);
	}
</style>
