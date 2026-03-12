<script lang="ts">
    import Dialog from "$lib/dialogs/Dialog.svelte"
    import { Button, Input, Radio, Card, Helper } from 'flowbite-svelte';
    import { dialogs } from "$lib/stores/WebappStores.svelte"
    import { FreLanguage, notNullOrUndefined } from "@freon4dsl/core"
    import { EditorRequestsHandler, WebappConfigurator } from "$lib/language"
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

<Dialog open={dialogs.searchElementDialogVisible}>

    <h3 class="freon-dialog-title">
        Search for ...
    </h3>

    <div class="flex flex-col space-y-6" role="dialog">

        <div class="freon-dialog-section p-6 space-y-6">

            <h4 class="freon-dialog-subtitle">
                ... element with certain name and type: {textToFind}
            </h4>

            <div class="relative">
                <Input
                    class="freon-dialog-input"
                    type="text"
                    bind:value={textToFind}
                    id="search-input"
                    name="element-name"
                />

                <Helper class="freon-dialog-helper">
                    {helperText}
                </Helper>
            </div>

            <div class="grid grid-cols-3 p-2">
                {#each FreLanguage.getInstance().getNamedElements() as name, index (index)}
                    <label class="freon-radio-label">
                        <input
                            type="radio"
                            name="nodeTypes"
                            class="freon-radio-input"
                            onchange={() => { nodeType = name; }}
                        >
                        {name}
                    </label>
                {/each}
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
