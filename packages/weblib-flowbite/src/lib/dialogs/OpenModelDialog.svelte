<script lang="ts">
    import Dialog from "$lib/dialogs/Dialog.svelte"
    import { Button } from "flowbite-svelte"
    import { dialogs, initializing } from "$lib/stores/WebappStores.svelte"
    import { serverInfo } from "$lib/stores/ModelInfo.svelte"
    import { WebappConfigurator } from "$lib/language"
    import { setUserMessage } from "$lib/stores/UserMessageStore.svelte"
    import { FolderOpenSolid } from "flowbite-svelte-icons"

    // let errorText: string = $state("")
    let modelToOpen = $state("")

    function resetVariables() {
        dialogs.openModelDialogVisible = false
        serverInfo.allModelNames = []
        modelToOpen = ""
        // errorText = ""
    }

    function cancel() {
        if (initializing.value) {
            setUserMessage("You must select or create a model, before you can start!")
        }
        resetVariables()
    }

    async function openModel() {
        // console.log('openModel: ' + modelToOpen)
        if (modelToOpen.length > 0) {
            await WebappConfigurator.getInstance().openModel(modelToOpen)
            initializing.value = false
            resetVariables()
        } else {
            // errorText = "Please, select one of the models below."
        }
    }

</script>

<Dialog open={dialogs.openModelDialogVisible}>

    <h3 class="freon-dialog-title">
        Open model
    </h3>

    <div class="flex flex-col space-y-6" role="dialog">

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
                onclick={cancel}
                class="freon-dialog-btn freon-dialog-btn-cancel"
            >
                Cancel
            </Button>

            <Button
                onclick={openModel}
                class="freon-dialog-btn freon-dialog-btn-ok"
            >
                <FolderOpenSolid class="w-4 h-4 me-2"/>
                Open
            </Button>

        </div>

    </div>

</Dialog>

