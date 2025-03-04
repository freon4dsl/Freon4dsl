<script lang="ts">
    import {Button, Modal, Radio, Helper} from 'flowbite-svelte';
    import {dialogs, initializing} from '$lib/stores/WebappStores.svelte';
    import {serverInfo} from '$lib/stores/ModelInfo.svelte';
    import {WebappConfigurator} from '$lib/language';
    import {setUserMessage} from '$lib/stores/UserMessageStore.svelte';
    import {FolderOpenSolid} from "flowbite-svelte-icons";

    let errorText: string = $state('');
    let modelToOpen = $state('');

    function resetVariables() {
        dialogs.openModelDialogVisible = false;
        serverInfo.allModelNames = [];
        modelToOpen = "";
        errorText = '';
    }

    function cancel() {
        if (initializing.value) {
            setUserMessage("You must select or create a model, before you can start!");
        }
        resetVariables();
    }

    async function openModel() {
        console.log('openModel: ' + modelToOpen)
        if (modelToOpen.length > 0) {
            await WebappConfigurator.getInstance().openModel(modelToOpen);
            initializing.value = false;
            resetVariables();
        } else {
            errorText = 'Please, select one of the models below.'
        }
    }

</script>

<Modal bind:open={dialogs.openModelDialogVisible} autoclose={false} class="w-full">
    <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Open model</h3>
    <div class="flex flex-col space-y-6" role="dialog">
        <Helper class="text-sm ml-2 text-primary-900">
            <span class="font-medium">{errorText}</span>
        </Helper>
        <div class="">
            <div class="grid grid-cols-3 mb-3 p-2">
                {#each serverInfo.allModelNames as model}
                    <Radio class="p-2" name="models" onchange={() => {modelToOpen = model;}}>{model}</Radio>
                {/each}
            </div>
            <div class="flex flex-row justify-end">
                <Button color="alternative" onclick={cancel}>Cancel</Button>
                <Button onclick={openModel} >
                    <FolderOpenSolid class="w-4 h-4 me-2 dark:text-white"/>
                    Open</Button>
            </div>
        </div>
    </div>
</Modal>

