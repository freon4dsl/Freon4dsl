<script lang="ts">
    import { Button, Modal, Input, Card } from "flowbite-svelte"
    import { dialogs } from "$lib/stores/WebappStores.svelte"
    import { EditorRequestsHandler } from "$lib/language"

    let textToFind: string = $state("")

    function handleCancel() {
        dialogs.searchTextDialogVisible = false;
        textToFind = '';
    }

    async function handleSubmit() {
        if (!!textToFind && textToFind.length > 0) {
            EditorRequestsHandler.getInstance().findText(textToFind);
            textToFind = '';
        }
        dialogs.searchTextDialogVisible = false;
    }

</script>

<Modal bind:open={dialogs.searchTextDialogVisible} autoclose={false} class="w-full">
    <div class="flex flex-col space-y-6" role="dialog">

        <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Search for text</h3>
        <Card class="flex flex-col space-y-6 bg-white shadow my-2 p-6 max-w-full">
            <div class="relative text-gray-700">
                <Input
                    class="w-full h-10 pl-3 pr-32 text-base placeholder-gray-600 border rounded-lg focus:shadow-outline"
                    type="text"
                    bind:value={textToFind}
                    id="new-input"
                    name="model-name"
                />
            </div>
        </Card>
    </div>

    <svelte:fragment slot="footer">
        <Button onclick={handleSubmit}>Search</Button>
        <Button color="alternative" onclick={handleCancel}>Cancel</Button>
    </svelte:fragment>

</Modal>
