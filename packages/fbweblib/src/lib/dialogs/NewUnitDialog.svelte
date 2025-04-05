<script lang="ts">
    import {Button, Modal, Input, Helper} from 'flowbite-svelte';
    import {dialogs} from '$lib/stores/WebappStores.svelte';
    import {WebappConfigurator} from '$lib/language';
    import {checkName} from "$lib/language/DialogHelpers";
    import {editorInfo, setUserMessage} from "$lib";
    import { cancelButtonClass, textInputClass } from '$lib/stores/StylesStore.svelte';
    import { FolderOpenSolid } from 'flowbite-svelte-icons';

    const initialHelperText: string = 'Enter the name of the new unit.'
    let helperText: string = $state(initialHelperText);
    let newName: string = $state('');

    function unitNameValid(){
        helperText = checkName(newName, true);
    }

    function resetVariables() {
        dialogs.newUnitDialogVisible = false;
        newName = "";
        helperText = initialHelperText;
    }

    function handleCancel() {
        dialogs.newUnitDialogVisible = false;
        resetVariables();
    }

    async function handleSubmit() {
        // console.log("CREATING NEW UNIT: " + newName);
        if (newName.length > 0 && checkName(newName, true).length === 0) {
            const existing: string[] = await WebappConfigurator.getInstance().getUnitNames();
            if (!!existing && existing.length > 0 && existing.indexOf(newName) !== -1) {
                helperText = `Cannot create unit '${newName}', because a unit with that name already exists on the server.`;
            } else {
                if (editorInfo.toBeCreated?.type) {
                    await WebappConfigurator.getInstance().newUnit(newName, editorInfo.toBeCreated?.type);
                    resetVariables();
                } else {
                    setUserMessage('Cannot create a new unit, because its type is unknown.')
                }
            }
        } else {
            helperText = `Cannot create unit '${newName}', because its name is invalid.`;
        }
    }

	const onInput = () => {
		unitNameValid();
	}
</script>

<Modal bind:open={dialogs.newUnitDialogVisible} autoclose={false} class="w-full bg-primary-100 dark:bg-secondary-800">
    <h3 class="mb-4 text-xl font-medium text-secondary-900 dark:text-primary-50">New unit of type {editorInfo.toBeCreated?.type}</h3>
    <div class="flex flex-col space-y-6" role="dialog">
        <div class="relative text-secondary-700">
            <Input class={textInputClass}
                   type="text"
                   bind:value={newName}
                   id="new-input"
                   name="unit-name"
                   oninput={onInput}
            />
            <Helper class="text-sm ml-2 text-primary-900">
                <span class="font-medium">{helperText}</span>
            </Helper>
        </div>
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

</Modal>
