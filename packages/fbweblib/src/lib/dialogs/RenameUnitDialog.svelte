<script lang="ts">
    import {Button, Modal, Input, Helper} from 'flowbite-svelte';
    import {dialogs} from '$lib/stores/WebappStores.svelte';
    import {WebappConfigurator} from '$lib/language';
    import {checkName} from "$lib/language/DialogHelpers";
    import { cancelButtonClass, textInputClass } from '$lib/stores/StylesStore.svelte';
    import { PenSolid } from 'flowbite-svelte-icons';

    let errorText: string = $state('');
    let newName: string = $state('');

    function modelNameValid(){
        errorText = checkName(newName, true);
    }

    function resetVariables() {
        dialogs.renameUnitDialogVisible = false;
        newName = "";
        errorText = '';
    }

    function handleCancel() {
        dialogs.renameUnitDialogVisible = false;
        resetVariables();
    }

    async function handleSubmit() {
        // console.log("RENAMING UNIT TO: " + newName);
        if (newName.length > 0 && checkName(newName, true).length === 0) {
            const existing: string[] = await WebappConfigurator.getInstance().getUnitNames();
            if (!!existing && existing.length > 0 && existing.indexOf(newName) !== -1) {
                errorText = `Cannot rename unit to '${newName}', because a unit with that name already exists on the server.`;
            } else {
                // WebappConfigurator.getInstance().renameUnit(newName);
                resetVariables();
            }
        } else {
            errorText = `Cannot rename unit to '${newName}', because the name is invalid.`;
        }
    }

	const onInput = () => {
		modelNameValid();
	}
</script>

<Modal bind:open={dialogs.renameUnitDialogVisible} autoclose={false} class="w-full bg-primary-100 dark:bg-secondary-800">
    <h3 class="mb-4 text-xl font-medium text-secondary-900 dark:text-primary-50">Rename unit</h3>
    <p>This is not yet functioning</p>
    <div class="flex flex-col space-y-6" role="dialog">
        <div class="relative text-secondary-700">
            <Input class={textInputClass}
                   type="text"
                   bind:value={newName}
                   id="new-input"
                   name="unit-name"
                   oninput={onInput}
            />
        </div>
        <Helper class="text-sm ml-2 text-primary-900">
            <span class="font-medium">{errorText}</span>
        </Helper>
        <div class="mt-4 flex flex-row justify-end">
            <Button onclick={handleCancel} class={cancelButtonClass}>
                Cancel
            </Button>
            <Button onclick={handleSubmit} class="text-primary-50 dark:text-primary-50">
                <PenSolid class="w-4 h-4 me-2 text-primary-50 dark:text-primary-50"/>
                Rename
            </Button>
        </div>
    </div>
</Modal>
