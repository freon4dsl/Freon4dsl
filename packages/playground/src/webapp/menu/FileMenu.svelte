<Menu style="border-radius: 2px; background-color: var(--inverse-color)" origin="top left" dy="50px">
		<span slot="activator" style="margin-right: 0px; display:block;">
			<Button {...props}  title="File menu">{activatorTitle} <Icon> <svelte:component this={arrowDropDown}/> </Icon></Button>
		</span>
    <!--  here the list of menu options should be placed -->
    <div class="menu-list">
        {#each menuItems as item (item.id)}
            <!-- style needs to be added here, not as class -->
            <Menuitem style="font-size: var(--menuitem-font-size);
                    margin: 4px 10px;
                    padding: 2px;
                    height: 28px;"
                      on:click={() => handleClick(item.id)}>
                {item.title}
            </Menuitem>
        {:else}
            <p>There are no items to show...</p>
        {/each}
    </div>
</Menu>

<script lang="ts">
    import {Button, Menu, Menuitem, Icon} from 'svelte-mui';
    import arrowDropDown from '../assets/icons/svg/arrow_drop_down.svg';
    import type {MenuItem} from "../menu-ts-files/MenuItem";
    import {ServerCommunication} from "../server/ServerCommunication";
    import {EditorCommunication} from "../editor/EditorCommunication";

    import { currentModelName, currentUnitName, unitNames } from "../WebappStore";
    import {showError, errorMessage, severity, severityType} from "../WebappStore";
    import {
        deleteUnitDialogVisible,
        leftPanelVisible,
        nameModelDialogVisible,
        newModelDialogVisible,
        newUnitDialogVisible,
        openModelDialogVisible,
        openUnitDialogVisible,
        saveUnitDialogVisible,
        modelNames
    } from "../WebappStore";
    import { saveUnitInternal } from "../menu-ts-files/MenuUtils";

    // when a menu-item is clicked, this function is executed
    const handleClick = (id: number) => {
        // find the item that was clicked
        let menuItem = menuItems.find(item => item.id === id);
        // perform the action associated with the menu item
        menuItem.action(id);
        // if the leftpanel is opened (is the case when this menu is used from MenuList), then close it
        $leftPanelVisible = false;
    };

    // new model menuitem
    const newModel = () => {
        // get list of models from server
        ServerCommunication.getInstance().loadModelList((names: string[]) => {
            // names list may be empty => this is the first model to be stored
            if (!names || names.length == 0) {
                $modelNames = names;
            }
            $newModelDialogVisible = true;
        });
    }

    // open model menuitem
    const openModel = () => {
        // get list of models from server
        ServerCommunication.getInstance().loadModelList((names: string[]) => {
            // if list not empty, show dialog
            if (names.length > 0) {
                $modelNames = names;
                $openModelDialogVisible = true;
            } else {
                // if list is empty show error message
                errorMessage.set("No models found on the server");
                severity.set(severityType.error);
                showError.set(true);
            }
        });
    }

    // new unit menuitem
    const newUnit = () => {
        if (!EditorCommunication.getInstance().isModelNamed()) {
            errorMessage.set("Please, select or create a model before creating a new model unit");
            severity.set(severityType.error);
            showError.set(true);
            return;
        }
        saveUnitInternal();
        // get list of units from server, because new unit may not have the same name as an existing one
        ServerCommunication.getInstance().loadUnitList($currentModelName, (names: string[]) => {
            // list may be empty => this is the first unit to be stored
            $unitNames = names;
            $newUnitDialogVisible = true;
        });
    }

    // open unit menuitem
    const openUnit = () => {
        // get list of units from server
        ServerCommunication.getInstance().loadUnitList($currentModelName, (names: string[]) => {
            // if list not empty, show dialog
            if (names.length > 0) {
                $unitNames = names;
                $openUnitDialogVisible = true;
            } else {
                // if list is empty show error message
                errorMessage.set("No units for " + $currentModelName + " found on the server");
                severity.set(severityType.error);
                showError.set(true);
            }
        });
    }

    // save unit menuitem
    const saveUnit = () => {
        console.log("FileMenu.saveUnit: " + $currentUnitName);
        // first check whether the model to which the unit belongs has a name,
        // units can not be saved if the model has no name.
        if (!EditorCommunication.getInstance().isModelNamed()) {
            // get list of models from server
            ServerCommunication.getInstance().loadModelList((names: string[]) => {
                // list may be empty => this is the first model to be stored
                $modelNames = names;
                $nameModelDialogVisible = true;
            });
        }
        saveUnitInternal();
    }

    // delete unit menuitem
    const deleteUnit = () => {
        if (EditorCommunication.getInstance().isModelNamed() && EditorCommunication.getInstance().isUnitNamed()) {
            $deleteUnitDialogVisible = true;
        } else {
            // if list is empty show error message
            errorMessage.set("Cannot delete an unnamed unit or model");
            severity.set(severityType.error);
            showError.set(true);
        }
    }

    const importFile = () => {
        const status = document.getElementById('status');
        const output = document.getElementById('output');
        if (window.FileList && window.File && window.FileReader) {
            document.getElementById('file-selector').addEventListener('change', event => {
                output.src = '';
                status.textContent = '';
                const file = event.target.files[0];
                if (!file.type) {
                    status.textContent = 'Error: The File.type property does not appear to be supported on this browser.';
                    return;
                }
                if (!file.type.match('image.*')) {
                    status.textContent = 'Error: The selected file does not appear to be an image.'
                    return;
                }
                const reader = new FileReader();
                reader.addEventListener('load', event => {
                    output.src = event.target.result;
                });
                reader.readAsDataURL(file);
            });
        }
    }
    // the content of this menu
    let activatorTitle: string = "File";
    let menuItems: MenuItem[] = [
        {title: "Import from File", action: importFile, id: 7},
        {title: "New Model", action: newModel, id: 1},
        {title: 'Open Model', action: openModel, id: 2},
        {title: 'New Model Unit', action: newUnit, id: 3},
        {title: 'Open Model Unit', action: openUnit, id: 4},
        {title: 'Save Model Unit', action: saveUnit, id: 5},
        {title: 'Delete Model Unit', action: deleteUnit, id: 6},
    ];

    // the styling of the menu activator
    export let props;
</script>

<style>
    .menu-list {
        background-color: var(--inverse-color);
    }
</style>
