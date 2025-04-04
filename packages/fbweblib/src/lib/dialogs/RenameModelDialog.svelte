<script lang="ts">
    import {Button, Modal, Input, Helper} from 'flowbite-svelte';
    import {dialogs} from '$lib/stores/WebappStores.svelte';
    import {WebappConfigurator} from '$lib/language';
    import {checkName} from "$lib/language/DialogHelpers";
    import { FolderOpenSolid } from 'flowbite-svelte-icons';

    let errorText: string = $state('');
    let newName: string = $state('');

    function modelNameValid(){
        errorText = checkName(newName, false);
    }

    function resetVariables() {
        dialogs.renameModelDialogVisible = false;
        newName = "";
        errorText = '';
    }

    function handleCancel() {
        dialogs.renameModelDialogVisible = false;
        resetVariables();
    }

    async function handleSubmit() {
        // console.log("RENAMING MODEL TO: " + newName);
        if (newName.length > 0 && checkName(newName, false).length === 0) {
            const existing: string[] = await WebappConfigurator.getInstance().getAllModelNames();
            if (!!existing && existing.length > 0 && existing.indexOf(newName) !== -1) {
                errorText = `Cannot create model '${newName}', because a model with that name already exists on the server.`;
            } else {
                WebappConfigurator.getInstance().renameModel(newName);
                resetVariables();
            }
        } else {
            errorText = `Cannot create model '${newName}', because its name is invalid.`;
        }
    }

	const onInput = () => {
		modelNameValid();
	}
</script>

<Modal bind:open={dialogs.renameModelDialogVisible} autoclose={false} class="w-full bg-primary-100 dark:bg-secondary-800">
    <h3 class="mb-4 text-xl font-medium text-secondary-900 dark:text-primary-50">Rename model</h3>
    <p>This is not yet functioning</p>

    <div class="flex flex-col space-y-6" role="dialog">
        <div class="relative text-secondary-700">
            <Input class="w-full h-10 pl-3 pr-32 text-base placeholder-secondary-600 border rounded-lg focus:shadow-outline bg-secondary-50 dark:bg-primary-50"
                   type="text"
                   bind:value={newName}
                   id="new-input"
                   name="model-name"
                   oninput={onInput}
            />
            <Helper class="text-sm ml-2 text-primary-900">
                <span class="font-medium">{errorText}</span>
            </Helper>
            <div class="mt-4 flex flex-row justify-end">
                <Button onclick={handleCancel} class="text-center font-medium focus-within:ring-4 focus-within:outline-none inline-flex items-center justify-center px-5 py-2.5 text-sm text-secondary-900 bg-primary-50 border border-secondary-200 hover:bg-secondary-100 dark:text-secondary-400 hover:text-primary-700 focus-within:text-primary-700 dark:focus-within:text-primary-50 dark:hover:text-primary-900 dark:hover:bg-primary-200 dark:bg-transparent dark:border-secondary-600 dark:hover:border-secondary-600 focus-within:ring-secondary-200 dark:focus-within:ring-secondary-700 rounded-lg">
                    Cancel
                </Button>
                <Button onclick={handleSubmit} class="text-primary-50 dark:text-primary-50">
                    <FolderOpenSolid class="w-4 h-4 me-2 text-primary-50 dark:text-primary-50"/>
                    New
                </Button>
            </div>
        </div>
    </div>
</Modal>
