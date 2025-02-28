<script lang="ts">
	import { Button, Modal, Label, Input, Radio, Helper } from 'flowbite-svelte';
	import { dialogs } from '$lib/stores/WebappStores.svelte';
	import { serverInfo } from '$lib/stores/ModelInfo.svelte';
	import { WebappConfigurator } from '$lib/language';
	import * as Keys from "@freon4dsl/core"
	import { setUserMessage } from '$lib/stores/UserMessageStore.svelte';

	const initialHelperText: string = "Enter or select a name.";
	let helperText: string = initialHelperText;
	const invalidHelperText: string = "Name may contain only characters and numbers, and must start with a character.";
	let internalSelected: string = ""; // used for radio buttons
	let newName: string = '';
	$: newName = internalSelected.length > 0 ? internalSelected : '';
	let nameInvalid: string;
	$: nameInvalid = newName.length > 0 ? newNameInvalid() : '';

	function newNameInvalid(): string {
		if (newName === internalSelected) {
			return ''; // one of the existing models is selected, this is ok => not invalid
		} else {
			if (!newName.match(/^[a-z,A-Z][a-z,A-Z0-9_]*$/)) {
				helperText = invalidHelperText;
				return 'invalid';
			} else {
				return '';
			}
		}
	}

	function resetVariables() {
		dialogs.openModelDialogVisible = false;
		serverInfo.allModelNames = [];
		newName = "";
		internalSelected = "";
		helperText = initialHelperText;
	}

	function handleCancel() {
		// if ($initializing) {
			setUserMessage("You must select or create a model, before you can start!");
		// }
		dialogs.openModelDialogVisible = false;
		resetVariables();
	}

	async function handleSubmit() {
		const comm = WebappConfigurator.getInstance();
		// console.log('Handle "submit": ' + newName)
		if (internalSelected?.length > 0) { // should be checked first, because newName depends on it
			await comm.openModel(internalSelected);
			// $initializing = false;
		} else if (!newNameInvalid() && newName.length > 0) {
			console.log("CREATING NEW MODEL: " + newName);
			await comm.newModel(newName);
			// $initializing = false;
		} else {
			setUserMessage(`Cannot create model ${newName}, because its name is invalid.`);
		}
		resetVariables();
	}

	function isKeyBoardEvent(event: Event): event is KeyboardEvent {
		return 'detail' in event;
	}

	const handleEnterKey = (event: Event) => {
		console.log("handleEnterKey " + event)
		if (isKeyBoardEvent(event)) {
			switch (event.key) {
				case Keys.ENTER: { // on Enter key try to submit
					event.stopPropagation();
					event.preventDefault();
					if (!newNameInvalid()) {
						handleSubmit();
						resetVariables();
					}
					break;
				}
			}
		}
	}

</script>

<Modal bind:open={dialogs.openModelDialogVisible} size="xs" autoclose={false} class="w-full" >

	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div class="flex flex-col space-y-6" onkeydown={handleEnterKey} role="dialog">

		<h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Open Model</h3>
		<Label class="space-y-2">
			<span>Name of model</span>
			<Input bind:value={newName}
						 type="text"
						 name="model-name"
						 placeholder="my_model"
						 required
			/>
			<Helper class="mt-2 text-primary-900" >
				<span class="font-medium">{helperText}</span>
			</Helper>
		</Label>
		<div class="grid grid-cols-4">
			{#each serverInfo.allModelNames as model}
				<Radio class="p-2" name="models" onchange={() => {internalSelected = model}} >{model}</Radio>
			{/each}
		</div>

	</div>

	<svelte:fragment slot="footer">
		<Button onclick={handleSubmit}>Open</Button>
		<Button color="alternative" onclick={handleCancel}>Cancel</Button>
	</svelte:fragment>

</Modal>
