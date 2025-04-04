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
        // console.log('openModel: ' + modelToOpen)
        if (modelToOpen.length > 0) {
            await WebappConfigurator.getInstance().openModel(modelToOpen);
            initializing.value = false;
            resetVariables();
        } else {
            errorText = 'Please, select one of the models below.'
        }
    }

    const labelClass = 'text-sm rtl:text-right font-medium flex items-center p-2 text-secondary-900 dark:text-primary-50'
    const inputClass = 'w-4 h-4 bg-secondary-100 border-secondary-300 dark:ring-offset-secondary-800 focus:ring-2 me-2 dark:bg-secondary-600 dark:border-secondary-500 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600';
</script>

<Modal bind:open={dialogs.openModelDialogVisible} autoclose={false} class="w-full bg-primary-100 dark:bg-secondary-800" >
    <h3 class="mb-4 text-xl font-medium text-secondary-900 dark:text-primary-50">Open model</h3>
    <div class="flex flex-col space-y-6" role="dialog">
        <div class="grid grid-cols-3 mb-3 p-2">
            {#each serverInfo.allModelNames as model}
                <label class={labelClass}>
                    <input type="radio"
                           class="{inputClass}" name="models" onchange={() => {modelToOpen = model;}}>
                    {model}
                </label>
            {/each}
        </div>
        <div class="flex flex-row justify-end">
            <Button onclick={cancel} class="text-center font-medium focus-within:ring-4 focus-within:outline-none inline-flex items-center justify-center px-5 py-2.5 text-sm text-secondary-900 bg-primary-50 border border-secondary-200 hover:bg-secondary-100 dark:text-secondary-400 hover:text-primary-700 focus-within:text-primary-700 dark:focus-within:text-primary-50 dark:hover:text-primary-900 dark:hover:bg-primary-200 dark:bg-transparent dark:border-secondary-600 dark:hover:border-secondary-600 focus-within:ring-secondary-200 dark:focus-within:ring-secondary-700 rounded-lg">
                Cancel
            </Button>
            <Button onclick={openModel} class="text-primary-50 dark:text-primary-50">
                <FolderOpenSolid class="w-4 h-4 me-2 text-primary-50 dark:text-primary-50"/>
                Open</Button>
        </div>
    </div>
</Modal>

