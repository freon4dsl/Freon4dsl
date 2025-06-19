<script lang="ts">
    import {Button, Modal, Radio, Helper} from 'flowbite-svelte';
    import {dialogs, initializing} from '$lib/stores/WebappStores.svelte';
    import {serverInfo} from '$lib/stores/ModelInfo.svelte';
    import {WebappConfigurator} from '$lib/language';
    import {setUserMessage} from '$lib/stores/UserMessageStore.svelte';
    import {FolderOpenSolid} from "flowbite-svelte-icons";
    import { cancelButtonClass, okButtonClass, radioInputClass, radioLabelClass } from '$lib/stores/StylesStore.svelte';

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
        // console.log('openModel: ' + modelToOpen)
        if (modelToOpen.length > 0) {
            await WebappConfigurator.getInstance().openModel(modelToOpen);
            initializing.value = false;
            resetVariables();
        } else {
            errorText = 'Please, select one of the models below.'
        }
    }

</script>

<Modal bind:open={dialogs.openModelDialogVisible} autoclose={false} class="w-full bg-light-base-100 dark:bg-dark-base-800" >
    <h3 class="mb-4 text-xl font-medium text-light-base-900 dark:text-dark-base-50">Open model</h3>
    <div class="flex flex-col space-y-6" role="dialog">
        <div class="grid grid-cols-3 mb-3 p-2">
            {#each serverInfo.allModelNames as model}
                <label class={radioLabelClass}>
                    <input type="radio"
                           class="{radioInputClass}" name="models" onchange={() => {modelToOpen = model;}}>
                    {model}
                </label>
            {/each}
        </div>
        <div class="flex flex-row justify-end">
            <Button onclick={cancel} class={cancelButtonClass}>
                Cancel
            </Button>
            <Button class={okButtonClass} onclick={openModel} >
                <FolderOpenSolid class="w-4 h-4 me-2"/>
                Open</Button>
        </div>
    </div>
</Modal>

