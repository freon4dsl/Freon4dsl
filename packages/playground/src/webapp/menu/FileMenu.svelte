<Menu style="border-radius: 2px; background-color: var(--theme-colors-inverse_color)" origin="top left" dy="50px">
		<span slot="activator" style="margin-right: 0px; display:block;">
			<Button {...props}  title="File menu">{activatorTitle} <Icon> <svelte:component this={arrowDropDown}/> </Icon></Button>
		</span>
    <!--  here the list of menu options should be placed -->
    <div class="menu-list">
        {#each menuItems as item (item.id)}
            <!-- style needs to be added here, not as class -->
            <Menuitem style="font-size: var(--pi-menuitem-font-size);
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
    import { Button, Icon, Menu, Menuitem } from "svelte-mui";
    import arrowDropDown from "../assets/icons/svg/arrow_drop_down.svg";
    import type { MenuItem } from "../menu-ts-files/MenuItem";
    import { ServerCommunication } from "../server/ServerCommunication";
    import { EditorCommunication } from "../editor/EditorCommunication";

    import {
        currentModelName,
        currentUnitName,
        deleteUnitDialogVisible,
        errorMessage,
        fileExtensions,
        leftPanelVisible,
        modelNames,
        nameModelDialogVisible,
        newModelDialogVisible,
        newUnitDialogVisible,
        openModelDialogVisible,
        openUnitDialogVisible,
        severity,
        severityType,
        showError,
        unitNames
    } from "../WebappStore";
    import { metaTypeForExtension, saveUnitInternal } from "../menu-ts-files/MenuUtils";

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
                setErrorMessage("No models found on the server", severityType.error);
            }
        });
    }

    // new unit menuitem
    const newUnit = () => {
        if (!EditorCommunication.getInstance().isModelNamed()) {
            setErrorMessage("Please, select or create a model before creating a new model unit", severityType.error);
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
                setErrorMessage("No units for " + $currentModelName + " found on the server", severityType.error);
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
            setErrorMessage("Cannot delete an unnamed unit or model", severityType.error);
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
        // first check whether the current model has a name,
        // units can not be imported into an unnamed model.
        if (!EditorCommunication.getInstance().isModelNamed()) {
            // get list of models from server
            ServerCommunication.getInstance().loadModelList((names: string[]) => {
                // list may be empty => this is the first model to be stored
                $modelNames = names;
                $nameModelDialogVisible = true;
            });
        } else {
            // open the file browse dialog
            file_selector.click();
        }
    }

    function setErrorMessage(message: string, sever: severityType) {
        errorMessage.set(message);
        severity.set(sever);
        showError.set(true);
    }

    const process_files = (event) => {
        const fileList: FileList = event.target.files;
        const reader = new FileReader();
        for (let file of fileList) {
            // todo async: wait for file to be uploaded before starting next
            // todo do something with progress indicator
            // reader.addEventListener('progress', (event) => {
            //     if (event.loaded && event.total) {
            //         const percent = (event.loaded / event.total) * 100;
            //         console.log(`Progress: ${Math.round(percent)}`);
            //     }
            // });
            // to check whether the file is recognisable as a model unit, we examine the file extension
            const extension: string = file.name.slice(-4);
            let metaType: string = metaTypeForExtension(extension);
            // if the right extension has been found, continue
            if (metaType.length > 0) {
                reader.readAsText(file);
                reader.onload = function() {
                    const text = reader.result;
                    if (typeof text == "string") {
                        try {
                            EditorCommunication.getInstance().unitFromFile(reader.result as string, metaType);
                        } catch (e) {
                            setErrorMessage(`${e.message}`, severityType.error);
                        }
                    }
                };
                reader.onerror = function() {
                    setErrorMessage(reader.error.message, severityType.error);
                };
            } else {
                setErrorMessage(`File ${file.name} does not have the right (extension) type.`, severityType.error);
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
        {title: '(Experimental) Import Unit(s)...', action: importUnit, id: 7},
        {title: '(Experimental) Export Current Unit...', action: exportUnit, id: 8},
    ];

    // the styling of the menu activator
    export let props;
</script>

<style>
    .menu-list {
        color: var(--theme-colors-color);
        background-color: var(--theme-colors-inverse_color);
    }
    .file_selector {
        display:none;
    }
</style>
