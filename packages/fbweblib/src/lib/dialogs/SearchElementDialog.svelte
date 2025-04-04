<script lang="ts">
    import { Button, Modal, Input, Radio, Card, Helper } from 'flowbite-svelte';
    import { dialogs } from "$lib/stores/WebappStores.svelte"
    import { FreLanguage } from "@freon4dsl/core"
    import { EditorRequestsHandler } from '$lib/language';

    let nodeType = $state("")
    let textToFind: string = $state("")
    let namedElementToFind: string = $state("")
    const initialHelperText: string = "Enter the name of the element to search for";
    let helperText: string = $state(initialHelperText);

    function handleCancel() {
        dialogs.searchElementDialogVisible = false
        resetVariables()
    }

    async function handleSubmit() {

        // todo implement this
        if (!inputInvalid()) {
            dialogs.searchElementDialogVisible = false
            EditorRequestsHandler.getInstance().findNamedElement(textToFind, nodeType);
            resetVariables()
        }

    }

    function resetVariables() {
        nodeType = ""
        textToFind = ""
        namedElementToFind = ""
    }

    function inputInvalid(): boolean {
        if (!(!!nodeType && nodeType.length > 0)) {
            helperText = "Please, select the type of the unit below.";
            return true;
        } else {
            helperText = initialHelperText;
            return false;
        }
    }

</script>

<Modal bind:open={dialogs.searchElementDialogVisible} autoclose={false} class="w-full bg-primary-100 dark:bg-secondary-800">
    <div class="flex flex-col space-y-6" role="dialog">
        <h3 class="mb-4 text-xl font-medium text-secondary-900 dark:text-primary-50">Search for ...</h3>
        <Card class="flex flex-col space-y-6 bg-white shadow my-2 p-6 max-w-full">
        <h4 class="text-l font-medium text-secondary-900 dark:text-primary-50"> Element with certain type and name</h4>
        <div class="relative text-secondary-700">
            <Input class="w-full h-10 pl-3 pr-32 text-base placeholder-gray-600 border rounded-lg focus:shadow-outline"
                   type="text"
                   bind:value={namedElementToFind}
                   id="new-input"
                   name="model-name"
            />
            <Helper class="text-sm">
                {helperText}
            </Helper>
        </div>
        <div>
            <div class="grid grid-cols-3 mb-3 p-2">
                {#each FreLanguage.getInstance().getNamedElements() as name}
                    <Radio class="p-2" name="nodeTypes" onchange={() => {nodeType = name;}}>{name}</Radio>
                {/each}
            </div>
        </div>
        </Card>
    </div>

    <svelte:fragment slot="footer">
        <Button onclick={handleSubmit}>Search</Button>
        <Button color="alternative" onclick={handleCancel}>Cancel</Button>
    </svelte:fragment>

</Modal>
