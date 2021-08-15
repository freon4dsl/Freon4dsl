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
            {#if (item.id == 6)}
                <hr>
            {/if}
        {:else}
            <p>There are no items to show...</p>
        {/each}
    </div>
</Menu>

<!-- `file_selector` is a hidden element to be able to show a file selection browser -->
<!-- The `multiple` attribute lets users select multiple files. -->
<!-- The `accept` attribute sets the file extensions that are allowed.  -->
<input class:file_selector bind:this={file_selector} {...file_selector_props} on:change={process_files}>

<script lang="ts">
    import {Button, Menu, Menuitem, Icon} from 'svelte-mui';
    import arrowDropDown from '../assets/icons/svg/arrow_drop_down.svg';
    import type {MenuItem} from "../menu-ts-files/MenuItem";
    import {ServerCommunication} from "../server/ServerCommunication";
    import {EditorCommunication} from "../editor/EditorCommunication";

    import { currentModelName, currentUnitName, fileExtensions, modelNames, unitNames } from "../WebappStore";
    import { showError, errorMessage, severity, severityType } from "../WebappStore";
    import {
        deleteUnitDialogVisible,
        leftPanelVisible,
        nameModelDialogVisible,
        newModelDialogVisible,
        newUnitDialogVisible,
        openModelDialogVisible,
        openUnitDialogVisible,
        saveUnitDialogVisible
    } from "../WebappStore";

    // variables for the file import
    let file_selector;
    let file_extensions = `${$fileExtensions.map(entry => `${entry}`).join(", ")}`;
    let file_selector_props = {
        type: "file",
        multiple: true,
        accept: file_extensions,
    };

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
    // TODO make sure the list of modelNames is emptied after the action
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
    // TODO make sure the list of modelNames is emptied after the action
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
        // get list of units from server, because a new name must not be identical to an existing one
        ServerCommunication.getInstance().loadUnitList($currentModelName, (names: string[]) => {
            // only show the dialog if the name is empty or unknown
            if (!EditorCommunication.getInstance().isUnitNamed()) {
                $unitNames = names;
                $saveUnitDialogVisible = true;
            } else {
                EditorCommunication.getInstance().saveCurrentUnit();
            }
        });
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

    // import model menuitem
    const exportUnit = () => {
        // create a text string from the current unit
        let text: string = EditorCommunication.getInstance().unitAsText();
        // get the default file name from the current unit and its unit meta type
        const fileExtension: string = EditorCommunication.getInstance().unitFileExtension();
        let defaultFileName: string = $currentUnitName + fileExtension;

        // create a HTML element that contains the text string
        let textFile = null;
        var data = new Blob([text], {type: 'text/plain'});

        // If we are replacing a previously generated file we need to
        // manually revoke the object URL to avoid memory leaks.
        if (textFile !== null) {
            URL.revokeObjectURL(textFile);
        }
        textFile = URL.createObjectURL(data);

        // create a link for the download
        var link = document.createElement('a');
        link.setAttribute('download', defaultFileName);
        link.href = textFile;
        document.body.appendChild(link);

        // wait for the link to be added to the document
        window.requestAnimationFrame(function () {
            var event = new MouseEvent('click');
            link.dispatchEvent(event);
            document.body.removeChild(link);
        });
    }

    // import model unit menuitem
    const importUnit = () => {
        console.log("importUnit called");
        // open the file browse dialog
        // var FileSystemHandles = ww.showOpenFilePicker();
        file_selector.click();
    }

    const process_files = (event) => {
        const fileList: FileList = event.target.files;
        const reader = new FileReader();
        for (let file of fileList) {
            // todo async: wait for file to be uploaded before starting next
            console.log(`file.type: ${file.type}`);
            if (file.type && file.type.startsWith("text/plain")) {
                console.log(`process_files called`);
                // todo do something with progress indicator
                reader.addEventListener('progress', (event) => {
                    if (event.loaded && event.total) {
                        const percent = (event.loaded / event.total) * 100;
                        console.log(`Progress: ${Math.round(percent)}`);
                    }
                });
                reader.readAsText(file);
                reader.onload = function() {
                    const text = reader.result;
                    const extension: string = file.name.slice(-4);
                    if (typeof text == "string") {
                        EditorCommunication.getInstance().unitFromFile(reader.result as string, extension);
                    }
                };
                reader.onerror = function() {
                    errorMessage.set(reader.error.message);
                    severity.set(severityType.error);
                    showError.set(true);
                };
            }
        }
    }

    // the content of this menu
    let activatorTitle: string = "File";
    let menuItems: MenuItem[] = [
        {title: "New Model", action: newModel, id: 1},
        {title: 'Open Model', action: openModel, id: 2},
        {title: 'New Unit', action: newUnit, id: 3},
        {title: 'Open Unit', action: openUnit, id: 4},
        {title: 'Save Current Unit', action: saveUnit, id: 5},
        {title: 'Delete Current Unit', action: deleteUnit, id: 6},
        {title: 'Import Unit(s)...', action: importUnit, id: 7},
        {title: 'Export Current Unit...', action: exportUnit, id: 8},
    ];

    // the styling of the menu activator
    export let props;
</script>

<style>
    .menu-list {
        background-color: var(--inverse-color);
    }
    .file_selector {
        display:none;
    }
</style>
