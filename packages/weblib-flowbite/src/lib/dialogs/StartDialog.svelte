<script lang="ts">
    import { Button, Input, Helper } from 'flowbite-svelte';
    import Dialog from "$lib/dialogs/Dialog.svelte"
    import {dialogs, initializing} from '$lib/stores/WebappStores.svelte';
    import {serverInfo} from '$lib/stores/ModelInfo.svelte';
    import {WebappConfigurator} from '$lib/language';
    import {setUserMessage} from '$lib/stores/UserMessageStore.svelte';
    import {FolderOpenSolid, FolderPlusSolid} from "flowbite-svelte-icons";
    import {checkName} from "$lib/language/DialogHelpers";
    import {
        cancelButtonClass, okButtonClass,
        radioInputClass,
        radioLabelClass,
        textInputClass
    } from '$lib/stores/StylesStore.svelte';

    let errorText: string = $state('');
    let newName: string = $state('');
    let modelToOpen = $state('');

    function modelNameValid() {
        errorText = checkName(newName);
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
        if (newName.length > 0 && checkName(newName).length === 0) {
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


</script>

<Dialog open={dialogs.startDialogVisible} >
    {#if serverInfo.allModelNames.length > 0}
        <h3 class="mb-4 text-xl font-medium text-light-base-900 dark:text-dark-base-50">Create/Open model</h3>
    {:else }
        <h3 class="mb-4 text-xl font-medium text-light-base-900 dark:text-dark-base-50">Create model</h3>
    {/if}
    <div class="flex flex-col space-y-6" role="dialog">
        <div class="relative text-light-base-700">
            <Input class={textInputClass}
                   type="text"
                   bind:value={newName}
                   id="new-input"
                   name="model-name"
                   oninput={onInput}
            />
            <Button class="absolute inset-y-0 right-0 flex items-center px-4 rounded-r-lg text-light-base-900 dark:text-dark-base-50"
                    onclick={newModel}
            >
                <FolderPlusSolid class="w-4 h-4 me-2 "/>
                Create
            </Button>
        </div>
        <Helper class="text-sm ml-2 text-light-base-900">
            <span class="font-medium">{errorText}</span>
        </Helper>
        {#if serverInfo.allModelNames.length > 0}
            <hr class="h-px my-8 bg-light-base-400 border-0 dark:bg-dark-base-300">
            <div class="">
                <div class="grid grid-cols-3 mb-3 p-2 ">
                    {#each serverInfo.allModelNames as model}
                        <label class={radioLabelClass}>
                            <input type="radio"
                                   class="{radioInputClass}" name="models" onchange={() => {modelToOpen = model;}}>
                            {model}
                        </label>
                    {/each}
                </div>
                <div class="flex flex-row justify-end">
                    <Button class={cancelButtonClass}
                            onclick={cancel}>
                        Cancel
                    </Button>
                    <Button class={okButtonClass}
                            onclick={openModel} >
                        <FolderOpenSolid class="w-4 h-4 me-2 "/>
                        Open
                    </Button>
                </div>
            </div>
        {/if}
    </div>
</Dialog>
