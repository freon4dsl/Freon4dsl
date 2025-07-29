<script lang="ts">
    import { notNullOrUndefined } from "@freon4dsl/core"
    import {Button, Input, Helper} from 'flowbite-svelte';
    import {dialogs} from '$lib/stores/WebappStores.svelte';
    import {WebappConfigurator} from '$lib/language';
    import {checkName} from "$lib/language/DialogHelpers";
    import { FolderOpenSolid } from 'flowbite-svelte-icons';
    import { cancelButtonClass, okButtonClass, textInputClass } from '$lib/stores/StylesStore.svelte';
    import Dialog from "$lib/dialogs/Dialog.svelte"

    const initialHelperText: string = 'Enter the name of the new model.'
    let helperText: string = $state(initialHelperText);
    let newName: string = $state('');

    function modelNameValid(){
        helperText = checkName(newName);
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
        if (newName.length > 0 && checkName(newName).length === 0) {
            const existing: string[] = await WebappConfigurator.getInstance().getAllModelNames();
            if (notNullOrUndefined(existing) && existing.length > 0 && existing.indexOf(newName) !== -1) {
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

<Dialog open={dialogs.newModelDialogVisible}>
    <h3 class="mb-4 text-xl font-medium text-light-base-900 dark:text-dark-base-50">New model</h3>
    <div class="flex flex-col space-y-6" role="dialog">
        <div class="relative text-light-base-700">
            <Input class={textInputClass}
                   type="text"
                   bind:value={newName}
                   id="new-input"
                   name="model-name"
                   oninput={onInput}
            />
            <Helper class="text-sm ml-2 text-light-base-900 dark:text-dark-base-50">
                <span class="font-medium">{helperText}</span>
            </Helper>
        </div>
        <div class="flex flex-row justify-end mt-0">
            <Button onclick={handleCancel} class={cancelButtonClass}>
                Cancel
            </Button>
            <Button class={okButtonClass} onclick={handleSubmit} >
                <FolderOpenSolid class="w-4 h-4 me-2"/>
                New
            </Button>
        </div>
    </div>
</Dialog>
