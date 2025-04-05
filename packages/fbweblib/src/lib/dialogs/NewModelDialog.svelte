<script lang="ts">
    import {Button, Modal, Input, Helper} from 'flowbite-svelte';
    import {dialogs} from '$lib/stores/WebappStores.svelte';
    import {WebappConfigurator} from '$lib/language';
    import {checkName} from "$lib/language/DialogHelpers";
    import { FolderOpenSolid } from 'flowbite-svelte-icons';
    import { serverInfo } from '$lib';
    import { cancelButtonClass, textInputClass } from '$lib/stores/StylesStore.svelte';
    import { inputClass } from 'flowbite-svelte/Radio.svelte';

    const initialHelperText: string = 'Enter the name of the new unit.'
    let helperText: string = $state(initialHelperText);
    let newName: string = $state('');

    function modelNameValid(){
        helperText = checkName(newName, false);
    }

    function resetVariables() {
        dialogs.newModelDialogVisible = false;
        newName = "";
        helperText = initialHelperText;
    }

    function handleCancel() {
        dialogs.newModelDialogVisible = false;
        resetVariables();
    }

    async function handleSubmit() {
        // console.log("CREATING NEW MODEL: " + newName);
        if (newName.length > 0 && checkName(newName, false).length === 0) {
            const existing: string[] = await WebappConfigurator.getInstance().getAllModelNames();
            if (!!existing && existing.length > 0 && existing.indexOf(newName) !== -1) {
                helperText = `Cannot create model '${newName}', because a model with that name already exists on the server.`;
            } else {
                await WebappConfigurator.getInstance().newModel(newName);
                resetVariables();
            }
        } else {
            helperText = `Cannot create model '${newName}', because its name is invalid.`;
        }
    }

	const onInput = () => {
		modelNameValid();
	}
</script>

<Modal bind:open={dialogs.newModelDialogVisible} autoclose={false} class="w-full bg-primary-100 dark:bg-secondary-800">
    <h3 class="mb-4 text-xl font-medium text-secondary-900 dark:text-primary-50">New model</h3>
    <div class="flex flex-col space-y-6" role="dialog">
        <div class="relative text-secondary-700">
            <Input class={textInputClass}
                   type="text"
                   bind:value={newName}
                   id="new-input"
                   name="model-name"
                   oninput={onInput}
            />
            <Helper class="text-sm ml-2 text-primary-900 dark:text-secondary-50">
                <span class="font-medium">{helperText}</span>
            </Helper>
        </div>
        <div class="flex flex-row justify-end mt-0">
            <Button onclick={handleCancel} class={cancelButtonClass}>
                Cancel
            </Button>
            <Button onclick={handleSubmit} class="text-primary-50 dark:text-primary-50">
                <FolderOpenSolid class="w-4 h-4 me-2 text-primary-50 dark:text-primary-50"/>
                New
            </Button>
        </div>
    </div>
</Modal>
