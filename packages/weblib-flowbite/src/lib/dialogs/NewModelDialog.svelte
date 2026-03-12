<script lang="ts">
    import { userMessageOpen } from "$lib"
    import { notNullOrUndefined } from "@freon4dsl/core"
    import {Button, Input, Helper} from 'flowbite-svelte';
    import {dialogs} from '$lib/stores/WebappStores.svelte';
    import {WebappConfigurator} from '$lib/language';
    import {checkName} from "$lib/language/DialogHelpers";
    import { FolderOpenSolid } from 'flowbite-svelte-icons';
    import Dialog from "$lib/dialogs/Dialog.svelte"

    const initialHelperText: string = 'Enter the name of the new model.'
    let helperText: string = $state(initialHelperText);
    let newName: string = $state('');

    function modelNameValid(){
        helperText = checkName(newName);
    }

    function resetVariables() {
        dialogs.newModelDialogVisible = false;
        newName = "";
        helperText = initialHelperText;
    }

    function handleCancel() {
        dialogs.newModelDialogVisible = false;
        resetVariables();
    }

    async function handleSubmit() {
        // console.log("CREATING NEW MODEL: " + newName);
        if (newName.length > 0 && checkName(newName).length === 0) {
            const existing: string[] = await WebappConfigurator.getInstance().getAllModelNames();
            if (userMessageOpen.value) {
                resetVariables();
                return
            }
            if (notNullOrUndefined(existing) && existing.length > 0 && existing.indexOf(newName) !== -1) {
                helperText = `Cannot create model '${newName}', because a model with that name already exists on the server.`;
            } else {
                await WebappConfigurator.getInstance().newModel(newName);
                resetVariables();
            }
        } else {
            helperText = `Cannot create model '${newName}', because its name is invalid.`;
        }
    }

	const onInput = () => {
		modelNameValid();
	}
</script>

<Dialog open={dialogs.newModelDialogVisible}>

    <h3 class="freon-dialog-title">
        New model
    </h3>

    <div class="flex flex-col space-y-6" role="dialog">

        <div class="relative">
            <Input
                class="freon-dialog-input"
                type="text"
                bind:value={newName}
                id="new-input"
                name="model-name"
                oninput={onInput}
            />

            <Helper class="freon-dialog-helper">
                <span class="font-medium">{helperText}</span>
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
                <FolderOpenSolid class="w-4 h-4 me-2"/>
                New
            </Button>

        </div>

    </div>

</Dialog>
