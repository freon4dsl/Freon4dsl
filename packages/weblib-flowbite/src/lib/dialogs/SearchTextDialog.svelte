<script lang="ts">
    import { notNullOrUndefined } from "@freon4dsl/core"
    import { Button, Input, Card } from "flowbite-svelte"
    import { dialogs } from "$lib/stores/WebappStores.svelte"
    import { EditorRequestsHandler } from "$lib/language"
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

    <h3 class="freon-dialog-title">
        Search for text
    </h3>

    <div class="flex flex-col space-y-6" role="dialog">

        <div class="freon-dialog-section p-6">
            <div class="relative">
                <Input
                    class="freon-dialog-input"
                    type="text"
                    bind:value={textToFind}
                    id="search-text-input"
                    name="search-text"
                />
            </div>
        </div>

    </div>

    <div class="mt-2 flex justify-end gap-3">

        <Button
            onclick={handleCancel}
            class="freon-dialog-btn freon-dialog-btn-cancel"
        >
            Cancel
        </Button>

        <Button
            onclick={handleSubmit}
            class="freon-dialog-btn freon-dialog-btn-ok"
        >
            <PenSolid class="w-4 h-4 me-2"/>
            Search
        </Button>

    </div>

</Dialog>
