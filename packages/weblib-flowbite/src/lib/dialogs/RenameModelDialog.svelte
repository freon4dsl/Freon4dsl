<script lang="ts">
    import Dialog from "$lib/dialogs/Dialog.svelte"
    import { notNullOrUndefined } from "@freon4dsl/core"
    import {Button, Input, Helper} from 'flowbite-svelte';
    import {dialogs} from '$lib/stores/WebappStores.svelte';
    import {WebappConfigurator} from '$lib/language';
    import {checkName} from "$lib/language/DialogHelpers";
    import { PenSolid } from 'flowbite-svelte-icons';

    let errorText: string = $state('');
    let newName: string = $state('');

    function modelNameValid(){
        errorText = checkName(newName);
    }

    function resetVariables() {
        dialogs.renameModelDialogVisible = false;
        newName = "";
        errorText = '';
    }

    function handleCancel() {
        dialogs.renameModelDialogVisible = false;
        resetVariables();
        WebappConfigurator.getInstance().langEnv!.editor.selectionChanged()
    }

    async function handleSubmit() {
        // console.log("RENAMING MODEL TO: " + newName);
        if (newName.length > 0 && checkName(newName).length === 0) {
            const existing: string[] = await WebappConfigurator.getInstance().getAllModelNames();
            if (notNullOrUndefined(existing) && existing.length > 0 && existing.indexOf(newName) !== -1) {
                errorText = `Cannot create model '${newName}', because a model with that name already exists on the server.`;
            } else {
                await WebappConfigurator.getInstance().renameModel(newName);
                resetVariables();
                WebappConfigurator.getInstance().langEnv!.editor.selectionChanged()
            }
        } else {
            errorText = `Cannot create model '${newName}', because its name is invalid.`;
        }
    }

	const onInput = () => {
		modelNameValid();
	}
</script>

<Dialog open={dialogs.renameModelDialogVisible}>

    <h3 class="freon-dialog-title">
        Rename model
    </h3>

    <div class="flex flex-col space-y-6" role="dialog">

        <div class="relative">
            <Input
                class="freon-dialog-input"
                type="text"
                bind:value={newName}
                id="new-input3"
                name="model-name"
                oninput={onInput}
            />

            <Helper class="freon-dialog-helper">
                <span class="font-medium">{errorText}</span>
            </Helper>
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
                Rename
            </Button>

        </div>

    </div>

</Dialog>
