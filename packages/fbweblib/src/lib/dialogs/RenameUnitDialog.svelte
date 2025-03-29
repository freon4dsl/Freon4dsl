<script lang="ts">
    import {Button, Modal, Input, Helper} from 'flowbite-svelte';
    import {dialogs} from '$lib/stores/WebappStores.svelte';
    import {WebappConfigurator} from '$lib/language';
    import {checkName} from "$lib/language/DialogHelpers";

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

<Modal bind:open={dialogs.renameUnitDialogVisible} autoclose={false} class="w-full">
    <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Rename unit</h3>
    <p>This is not yet functioning</p>
    <div class="flex flex-col space-y-6" role="dialog">
        <div class="relative text-gray-700">
            <Input class="w-full h-10 pl-3 pr-32 text-base placeholder-gray-600 border rounded-lg focus:shadow-outline" type="text"
                   bind:value={newName}
                   id="new-input"
                   name="model-name"
                   oninput={onInput}
            />
        </div>
        <Helper class="text-sm ml-2 text-primary-900">
            <span class="font-medium">{errorText}</span>
        </Helper>
    </div>

    <svelte:fragment slot="footer">
        <Button onclick={handleSubmit}>Rename</Button>
        <Button color="alternative" onclick={handleCancel}>Cancel</Button>
    </svelte:fragment>

</Modal>
