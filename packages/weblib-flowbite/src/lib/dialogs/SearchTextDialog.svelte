<script lang="ts">
    import { notNullOrUndefined } from "@freon4dsl/core"
    import { Button, Input, Card } from "flowbite-svelte"
    import { dialogs } from "$lib/stores/WebappStores.svelte"
    import { EditorRequestsHandler } from "$lib/language"
    import { cancelButtonClass, okButtonClass, textInputClass } from '$lib/stores/StylesStore.svelte';
    import { PenSolid } from 'flowbite-svelte-icons';
    import Dialog from "$lib/dialogs/Dialog.svelte"

    let textToFind: string = $state("")

    function handleCancel() {
        dialogs.searchTextDialogVisible = false;
        textToFind = '';
    }

    async function handleSubmit() {
        if (notNullOrUndefined(textToFind) && textToFind.length > 0) {
            EditorRequestsHandler.getInstance().findText(textToFind);
            textToFind = '';
        }
        dialogs.searchTextDialogVisible = false;
    }

</script>

<Dialog open={dialogs.searchTextDialogVisible}>
    <div class="flex flex-col space-y-6" role="dialog">

        <h3 class="mb-4 text-xl font-medium text-light-base-900 dark:text-dark-base-50">Search for text</h3>
        <Card class="flex flex-col space-y-6 bg-light-base-50 shadow my-2 p-6 max-w-full">
            <div class="relative text-light-base-700">
                <Input class={textInputClass}
                    type="text"
                    bind:value={textToFind}
                    id="new-input"
                    name="model-name"
                />
            </div>
        </Card>
    </div>

    <div class="mt-4 flex flex-row justify-end">
        <Button onclick={handleCancel} class={cancelButtonClass}>
            Cancel
        </Button>
        <Button class={okButtonClass} onclick={handleSubmit} >
            <PenSolid class="w-4 h-4 me-2"/>
            Search
        </Button>
    </div>

</Dialog>
