<script lang="ts">
    import { Button, Modal, Input, Helper } from 'flowbite-svelte';
    import {dialogs, initializing} from '$lib/stores/WebappStores.svelte';
    import {serverInfo} from '$lib/stores/ModelInfo.svelte';
    import {WebappConfigurator} from '$lib/language';
    import {setUserMessage} from '$lib/stores/UserMessageStore.svelte';
    import {FolderOpenSolid, FolderPlusSolid} from "flowbite-svelte-icons";
    import {checkName} from "$lib/language/DialogHelpers";

    let errorText: string = $state('');
    let newName: string = $state('');
    let modelToOpen = $state('');

    function modelNameValid() {
        errorText = checkName(newName, false);
    }

    function resetVariables() {
        dialogs.startDialogVisible = false;
        serverInfo.allModelNames = [];
        newName = "";
        modelToOpen = "";
        errorText = '';
    }

    function cancel() {
        if (initializing.value) {
            setUserMessage("You must select or create a model, before you can start!");
        }
        dialogs.startDialogVisible = false;
        resetVariables();
    }

    async function newModel() {
        // console.log('newModel": ' + newName)
        if (newName.length > 0 && checkName(newName, false).length === 0) {
            await WebappConfigurator.getInstance().newModel(newName);
            initializing.value = false;
        } else {
            setUserMessage(`Cannot create model '${newName}', because its name is invalid.`);
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
            errorText = 'Please, select one of the models below, or enter a valid model name.'
        }
    }

    const onInput = () => {
        modelNameValid();
    }

    const labelClass = 'text-sm rtl:text-right font-medium flex items-center p-2 text-secondary-900 dark:text-primary-50'
    const inputClass = 'w-4 h-4 bg-secondary-100 border-secondary-300 dark:ring-offset-secondary-800 focus:ring-2 me-2 dark:bg-secondary-600 dark:border-secondary-500 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600';
</script>

<Modal bind:open={dialogs.startDialogVisible} autoclose={false} class="w-full text-secondary-900 dark:text-primary-50 bg-primary-100 dark:bg-secondary-800">
    {#if serverInfo.allModelNames.length > 0}
        <h3 class="mb-4 text-xl font-medium text-secondary-900 dark:text-primary-50">Create/Open model</h3>
    {:else }
        <h3 class="mb-4 text-xl font-medium text-secondary-900 dark:text-primary-50">Create model</h3>
    {/if}
    <div class="flex flex-col space-y-6" role="dialog">
        <div class="relative text-secondary-700">
            <Input class="w-full h-10 pl-3 pr-32 text-base placeholder-secondary-600 border rounded-lg focus:shadow-outline bg-secondary-50 dark:bg-primary-50"
                   type="text"
                   bind:value={newName}
                   id="new-input"
                   name="model-name"
                   oninput={onInput}
            />
            <Button class="absolute inset-y-0 right-0 flex items-center px-4 rounded-r-lg"
                    onclick={newModel}
            >
                <FolderPlusSolid class="w-4 h-4 me-2 dark:text-primary-50"/>
                Create
            </Button>
        </div>
        <Helper class="text-sm ml-2 text-primary-900">
            <span class="font-medium">{errorText}</span>
        </Helper>
        {#if serverInfo.allModelNames.length > 0}
            <hr class="h-px my-8 bg-secondary-400 border-0 dark:bg-secondary-300">
            <div class="">
                <div class="grid grid-cols-3 mb-3 p-2 ">
                    {#each serverInfo.allModelNames as model}
                        <label class={labelClass}>
                            <input type="radio"
                                   class="{inputClass}" name="models" onchange={() => {modelToOpen = model;}}>
                            {model}
                        </label>
                    {/each}
                </div>
                <div class="flex flex-row justify-end">
                    <Button color="alternative" onclick={cancel}>Cancel</Button>
                    <Button onclick={openModel}>
                        <FolderOpenSolid class="w-4 h-4 me-2 dark:text-primary-50"/>
                        Open
                    </Button>
                </div>
            </div>
        {/if}
    </div>
</Modal>

