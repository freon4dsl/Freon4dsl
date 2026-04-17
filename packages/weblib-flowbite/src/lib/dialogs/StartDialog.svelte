<script lang="ts">
    import { Button, Input, Helper } from 'flowbite-svelte';
    import Dialog from "$lib/dialogs/Dialog.svelte"
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

<Dialog open={dialogs.startDialogVisible}>

    {#if serverInfo.allModelNames.length > 0}
        <h3 class="freon-dialog-title">
            Create/Open model
        </h3>
    {:else}
        <h3 class="freon-dialog-title">
            Create model
        </h3>
    {/if}

    <div class="flex flex-col space-y-6" role="dialog">

        <div class="relative">
            <Input
                class="freon-dialog-input"
                type="text"
                bind:value={newName}
                id="new-input5"
                name="model-name"
                oninput={onInput}
            />

            <Button
                class="freon-dialog-btn-ok absolute inset-y-0 right-0 flex items-center px-4 rounded-r-lg"
                onclick={newModel}
            >
                <FolderPlusSolid class="w-4 h-4 me-2" />
                Create
            </Button>
        </div>

        <Helper class="freon-dialog-helper">
            <span class="font-medium">{errorText}</span>
        </Helper>

        {#if serverInfo.allModelNames.length > 0}
            <hr class="freon-dialog-divider">

            <div class="grid grid-cols-3 p-2">
                {#each serverInfo.allModelNames as model, index (index)}
                    <label class="freon-radio-label">
                        <input
                            type="radio"
                            name="models"
                            class="freon-radio-input"
                            onchange={() => { modelToOpen = model; }}
                        >
                        {model}
                    </label>
                {/each}
            </div>

            <div class="mt-2 flex justify-end gap-3">
                <Button
                    class="freon-dialog-btn freon-dialog-btn-cancel"
                    onclick={cancel}
                >
                    Cancel
                </Button>

                <Button
                    class="freon-dialog-btn freon-dialog-btn-ok"
                    onclick={openModel}
                >
                    <FolderOpenSolid class="w-4 h-4 me-2" />
                    Open
                </Button>
            </div>
        {/if}

    </div>

</Dialog>
