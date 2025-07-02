<script lang="ts">
    import { notNullOrUndefined } from "@freon4dsl/core"
    import {Button, Modal, Input, Helper} from 'flowbite-svelte';
    import {dialogs} from '$lib/stores/WebappStores.svelte';
    import {WebappConfigurator} from '$lib/language';
    import {checkName} from "$lib/language/DialogHelpers";
    import { PenSolid } from 'flowbite-svelte-icons';
    import { cancelButtonClass, okButtonClass, textInputClass } from '$lib/stores/StylesStore.svelte';

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
            if (notNullOrUndefined(existing) && existing.length > 0 && existing.indexOf(newName) !== -1) {
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

<Modal bind:open={dialogs.renameModelDialogVisible} autoclose={false} class="w-full bg-light-base-100 dark:bg-dark-base-800">
    <h3 class="mb-4 text-xl font-medium text-light-base-900 dark:text-dark-base-50">Rename model</h3>
    <p>This is not yet functioning</p>

    <div class="flex flex-col space-y-6" role="dialog">
        <div class="relative text-light-base-700">
            <Input class={textInputClass}
                   type="text"
                   bind:value={newName}
                   id="new-input"
                   name="model-name"
                   oninput={onInput}
            />
            <Helper class="text-sm ml-2 text-light-base-900">
                <span class="font-medium">{errorText}</span>
            </Helper>
            <div class="mt-4 flex flex-row justify-end">
                <Button onclick={handleCancel} class={cancelButtonClass}>
                    Cancel
                </Button>
                <Button class={okButtonClass} onclick={handleSubmit} >
                    <PenSolid class="w-4 h-4 me-2"/>
                    Rename
                </Button>
            </div>
        </div>
    </div>
</Modal>
