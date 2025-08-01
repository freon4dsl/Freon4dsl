<script lang="ts">
    import Dialog from "$lib/dialogs/Dialog.svelte"
    import { Button, Input, Radio, Card, Helper } from 'flowbite-svelte';
    import { dialogs } from "$lib/stores/WebappStores.svelte"
    import { FreLanguage, notNullOrUndefined } from "@freon4dsl/core"
    import { EditorRequestsHandler, WebappConfigurator } from "$lib/language"
    import { cancelButtonClass, okButtonClass, textInputClass } from '$lib/stores/StylesStore.svelte';
    import { PenSolid } from 'flowbite-svelte-icons';

    let nodeType = $state("")
    let textToFind: string = $state("")
    const initialHelperText: string = "Enter the name of the element to search for";
    let helperText: string = $state(initialHelperText);

    function handleCancel() {
        dialogs.searchElementDialogVisible = false
        resetVariables()
        WebappConfigurator.getInstance().langEnv!.editor.selectionChanged()
    }

    async function handleSubmit() {
        if (!inputInvalid()) {
            dialogs.searchElementDialogVisible = false
            EditorRequestsHandler.getInstance().findNamedElement(textToFind, nodeType);
            resetVariables()
            WebappConfigurator.getInstance().langEnv!.editor.selectionChanged()
        }
    }

    function resetVariables() {
        nodeType = ""
        textToFind = ""
    }

    function inputInvalid(): boolean {
        if (!(notNullOrUndefined(nodeType) && nodeType.length > 0)) {
            helperText = "Please, select the type of the element below.";
            return true;
        } else {
            helperText = initialHelperText;
            return false;
        }
    }

</script>

<Dialog open={dialogs.searchElementDialogVisible} >
    <div class="flex flex-col space-y-6" role="dialog">
        <h3 class="mb-4 text-xl font-medium text-light-base-900 dark:text-dark-base-50">Search for ...</h3>
        <Card class="flex flex-col space-y-6 bg-light-base-50 shadow my-2 p-6 max-w-full">
        <h4 class="text-l font-medium text-light-base-900 dark:text-dark-base-50">... element with certain name and type: {textToFind}</h4>

        <div class="relative text-light-base-700">
            <Input class={textInputClass}
                   type="text"
                   bind:value={textToFind}
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
