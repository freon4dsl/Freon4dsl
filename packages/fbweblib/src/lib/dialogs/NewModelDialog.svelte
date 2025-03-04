<script lang="ts">
    import {Button, Modal, Input, Helper} from 'flowbite-svelte';
    import {dialogs, initializing} from '$lib/stores/WebappStores.svelte';
    import {serverInfo} from '$lib/stores/ModelInfo.svelte';
    import {WebappConfigurator} from '$lib/language';
    import {setUserMessage} from '$lib/stores/UserMessageStore.svelte';
    import {checkModelName} from "$lib/language/DialogHelpers";

    let errorText: string = $state('');
    let newName: string = $state('');

    function modelNameValid(){
        errorText = checkModelName(newName);
    }

    function resetVariables() {
        dialogs.newModelDialogVisible = false;
        serverInfo.allModelNames = [];
        newName = "";
        errorText = '';
    }

    function handleCancel() {
        if (initializing.value) {
            setUserMessage("You must select or create a model, before you can start!");
        }
        dialogs.newModelDialogVisible = false;
        resetVariables();
    }

    async function handleSubmit() {
        console.log("CREATING NEW MODEL: " + newName);
        if (newName.length > 0 && checkModelName(newName).length === 0) {
            await WebappConfigurator.getInstance().newModel(newName);
            initializing.value = false;
            resetVariables();
        } else {
            errorText = `Cannot create model '${newName}', because its name is invalid.`;
        }
    }

	const onInput = (event: Event) => {
        console.log("onInput " + event)
		modelNameValid();
	}
</script>

<Modal bind:open={dialogs.newModelDialogVisible} autoclose={false} class="w-full">
    <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">New model</h3>
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
        <Button onclick={handleSubmit}>New</Button>
        <Button color="alternative" onclick={handleCancel}>Cancel</Button>
    </svelte:fragment>

</Modal>
