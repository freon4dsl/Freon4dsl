<script lang="ts">
    import Dialog from "$lib/dialogs/Dialog.svelte"
    import { FreErrorSeverity, type FreUnitIdentifier, notNullOrUndefined } from "@freon4dsl/core"
    import {Button, Input, Helper} from 'flowbite-svelte';
    import {dialogs} from '$lib/stores/WebappStores.svelte';
    import {WebappConfigurator} from '$lib/language';
    import {checkName} from "$lib/language/DialogHelpers";
    import { PenSolid } from 'flowbite-svelte-icons';
    import { editorInfo, setUserMessage } from "$lib"

    let errorText: string = $state('');
    let newName: string = $state('');

    function modelNameValid(){
        errorText = checkName(newName);
    }

    function resetVariables() {
        dialogs.renameUnitDialogVisible = false;
        newName = "";
        errorText = '';
    }

    function handleCancel() {
        dialogs.renameUnitDialogVisible = false;
        resetVariables();
    }

    async function handleSubmit() {
        // console.log("RENAMING UNIT TO: " + newName);
        if (newName.length > 0 && checkName(newName).length === 0) {
            const nameExist: boolean = notNullOrUndefined(editorInfo.unitIds.find((existing: FreUnitIdentifier) => existing.name === newName));
            if (nameExist) {
                errorText = `Cannot rename unit to '${newName}', because a unit with that name already exists on the server.`;
            } else {
                if (notNullOrUndefined(editorInfo.toBeRenamed)) {
                    await WebappConfigurator.getInstance().renameModelUnit(editorInfo.toBeRenamed, newName);
                } else {
                    setUserMessage(`Cannot rename unit to '${newName}', because the old unit cannot be identified.`, FreErrorSeverity.Error);
                }
                resetVariables();
            }
        } else {
            errorText = `Cannot rename unit to '${newName}', because the name is invalid.`;
        }
    }

	const onInput = () => {
		modelNameValid();
	}
</script>

<Dialog open={dialogs.renameUnitDialogVisible}>

    <h3 class="freon-dialog-title">
        Rename unit
    </h3>

    <div class="flex flex-col space-y-6" role="dialog">

        <div class="relative">
            <Input
                class="freon-dialog-input"
                type="text"
                bind:value={newName}
                id="new-input4"
                name="unit-name"
                oninput={onInput}
            />
        </div>

        <Helper class="freon-dialog-helper">
            <span class="font-medium">{errorText}</span>
        </Helper>

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
