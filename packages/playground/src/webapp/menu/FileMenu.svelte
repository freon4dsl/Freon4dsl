
<!-- first make sure all dialogs and the error message are present -->

<NewModelDialog bind:visible={newModelDialogVisible} modelNames={modelNames}/>
<OpenModelDialog bind:visible={openModelDialogVisible} modelNames={modelNames}/>
<NewUnitDialog bind:visible={newUnitDialogVisible} unitNames={unitNames} />
<OpenUnitDialog bind:visible={openUnitDialogVisible} unitNames={unitNames}/>
<SaveUnitDialog bind:visible={saveUnitDialogVisible} unitNames={unitNames}/>
<NameModelDialog bind:visible={nameModelDialogVisible} modelNames={modelNames}/>
<DeleteUnitDialog bind:visible={deleteUnitDialogVisible}/>

<UserMessage />

<!-- next define the menu -->
<Menu style="border-radius: 2px;" origin="top left" dy="50px">
		<span slot="activator" style="margin-right: 0px; display:block;">
			<Button {...props}  title="File menu">{activatorTitle}</Button>
		</span>
    <!--  here the list of menu options should be placed -->
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
</Menu>


<script lang="ts">
    import {Button, Menu, Menuitem} from 'svelte-mui';
    import type {MenuItem} from "../menu-ts-files/MenuItem";
    import UserMessage from "../side-elements/UserMessage.svelte";
    import OpenModelDialog from "./OpenModelDialog.svelte";
    import OpenUnitDialog from "./OpenUnitDialog.svelte";
    import {ServerCommunication} from "../server/ServerCommunication";
    import {currentModelName, currentUnitName} from "../menu-ts-files/WebappStore";
    import {get} from 'svelte/store';
    import NewModelDialog from "./NewModelDialog.svelte";
    import NewUnitDialog from "./NewUnitDialog.svelte";
    import SaveUnitDialog from "./SaveUnitDialog.svelte";
    import NameModelDialog from "./NameModelDialog.svelte";
    import DeleteUnitDialog from "./DeleteUnitDialog.svelte";
    import {EditorCommunication, unnamed} from "../editor/EditorCommunication";

    // when a menu-item is clicked, this function is executed
    const handleClick = (id: number) => {
        // find the item that was clicked
        let menuItem = menuItems.find(item => item.id === id);
        // perform the action associated with the menu item
        menuItem.action(id);
    };

    // elements for the error message are all imported from a common store
    import {showError, errorMessage, severity, severityType} from "../menu-ts-files/WebappStore";

    // elements for new model menuitem
    let newModelDialogVisible: boolean = false;
    let modelNames: string[];
    // TODO make sure the list of modelNames is emptied after the action

    const newModel = () => {
        // get list of models from server
        ServerCommunication.getInstance().loadModelList((names: string[]) => {
            // list may be empty => this is the first model to be stored
            modelNames = names;
            newModelDialogVisible = true;
        });
    }

    // elements for open model menuitem
    let openModelDialogVisible: boolean = false;
    // TODO make sure the list of modelNames is emptied after the action

    const openModel = () => {
        // get list of models from server
        ServerCommunication.getInstance().loadModelList((names: string[]) => {
            // if list not empty, show dialog
            if (names.length > 0) {
                modelNames = names;
                openModelDialogVisible = true;
            } else {
                // if list is empty show error message
                errorMessage.set("No models found on the server");
                severity.set(severityType.error);
                showError.set(true);
            }
        });
    }

    // elements for new unit menuitem
    let newUnitDialogVisible: boolean = false;
    let unitNames: string[];
    // let unitTypes: string[];

    const newUnit = () => {
        if (!EditorCommunication.getInstance().isModelNamed()) {
            errorMessage.set("Please, select or create a model before creating a new model unit");
            severity.set(severityType.error);
            showError.set(true);
            return;
        }
        // get list of units from server, because new unit may not have the same name as an existing one
        ServerCommunication.getInstance().loadUnitList(get(currentModelName), (names: string[]) => {
            // list may be empty => this is the first unit to be stored
            unitNames = names;
            newUnitDialogVisible = true;
        });
    }

    // elements for open unit menuitem
    let openUnitDialogVisible: boolean = false;

    const openUnit = () => {
        // get list of units from server
        ServerCommunication.getInstance().loadUnitList(get(currentModelName), (names: string[]) => {
            // if list not empty, show dialog
            if (names.length > 0) {
                unitNames = names;
                openUnitDialogVisible = true;
            } else {
                // if list is empty show error message
                errorMessage.set("No units for " + get(currentModelName) + " found on the server");
                severity.set(severityType.error);
                showError.set(true);
            }
        });
    }

    // elements for save unit menuitem
    let saveUnitDialogVisible: boolean = false;
    let nameModelDialogVisible: boolean = false;

    const saveUnit = () => {
        console.log("FileMenu.saveUnit: " + get(currentUnitName));
        // first check whether the model to which the unit belongs has a name,
        // units can not be saved if the model has no name.
        if (!EditorCommunication.getInstance().isModelNamed()) {
            // get list of models from server
            ServerCommunication.getInstance().loadModelList((names: string[]) => {
                // list may be empty => this is the first model to be stored
                modelNames = names;
                nameModelDialogVisible = true;
            });
        }
        // get list of units from server, because a new name must not be identical to an existing one
        ServerCommunication.getInstance().loadUnitList(get(currentModelName), (names: string[]) => {
            // only show the dialog if the name is empty or unknown
            if (!EditorCommunication.getInstance().isUnitNamed()) {
                unitNames = names;
                saveUnitDialogVisible = true;
            } else {
                EditorCommunication.getInstance().saveCurrentUnit();
            }
        });
    }

    // elements for delete unit menuitem
    let deleteUnitDialogVisible: boolean = false;

    const deleteUnit = () => {
        if (EditorCommunication.getInstance().isModelNamed() || EditorCommunication.getInstance().isUnitNamed()) {
            deleteUnitDialogVisible = true;
        } else {
            // if list is empty show error message
            errorMessage.set("Cannot delete an unnamed unit or model");
            severity.set(severityType.error);
            showError.set(true);
        }
    }

    // the content of this menu
    let activatorTitle: string = "File";
    let menuItems: MenuItem[] = [
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

