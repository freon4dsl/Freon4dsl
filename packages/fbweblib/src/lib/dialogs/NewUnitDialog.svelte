<script lang="ts">
    import {Button, Modal, Input, Helper} from 'flowbite-svelte';
    import {dialogs} from '$lib/stores/WebappStores.svelte';
    import {WebappConfigurator} from '$lib/language';
    import {checkName} from "$lib/language/DialogHelpers";
    import {editorInfo, setUserMessage} from "$lib";

    let errorText: string = $state('');
    let newName: string = $state('');

    function unitNameValid(){
        errorText = checkName(newName, true);
    }

    function resetVariables() {
        dialogs.newUnitDialogVisible = false;
        newName = "";
        errorText = '';
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
                errorText = `Cannot create unit '${newName}', because a unit with that name already exists on the server.`;
            } else {
                if (editorInfo.toBeCreated?.type) {
                    await WebappConfigurator.getInstance().newUnit(newName, editorInfo.toBeCreated?.type);
                    resetVariables();
                } else {
                    setUserMessage('Cannot create a new unit, because its type is unknown.')
                }
            }
        } else {
            errorText = `Cannot create unit '${newName}', because its name is invalid.`;
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
            <Input class="w-full h-10 pl-3 pr-32 text-base placeholder-gray-600 border rounded-lg focus:shadow-outline" type="text"
                   bind:value={newName}
                   id="new-input"
                   name="unit-name"
                   oninput={onInput}
            />
        </div>
        <Helper class="text-sm ml-2 text-primary-900">
            <span class="font-medium">{errorText}</span>
        </Helper>
    </div>

    <svelte:fragment slot="footer">
        <Button onclick={handleSubmit}>New</Button>
        <Button color="alternative" onclick={handleCancel}>Cancel</Button>
    </svelte:fragment>

</Modal>
