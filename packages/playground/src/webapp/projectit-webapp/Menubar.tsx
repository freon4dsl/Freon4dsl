import * as React from "react";
import { Menu, Tooltip, Icon, Flex, Text, Input, Segment, FlexItem, RadioGroup } from "@fluentui/react-northstar";
import { Link } from "@fluentui/react";
import { EditorCommunication } from "./EditorCommunication";
import { App } from "./App";
import { SearchIcon } from "@fluentui/react-icons-northstar";
import { PiNamedElement } from "@projectit/core";
import { ServerCommunication } from "./ServerCommunication";
import DialogData from "./DialogData";
import CommonOperations from "./CommonOperations";

const versionNumber = "0.1.0";

export default class Menubar extends React.Component {
    private dialogData: DialogData = new DialogData();

    menuItems = [
        {
            key: "file",
            content: "File",
            menu: {
                items: [
                    {
                        key: 'filenewmodel',
                        content: 'new model',
                        icon: "add",
                        tooltip: "Create a new model",
                        children: (Component, props) => {
                            /* ☝️ `tooltip` comes from shorthand object */
                            const { tooltip, ...rest } = props;
                            return <Tooltip key="newmodeltip" content={tooltip} trigger={<Component {...props} />}/>;
                        },
                        onClick: () => this.newModel()
                    },
                    {
                        key: "fileopen",
                        content: "open model ...",
                        icon: "download",
                        tooltip: "Open an existing model",
                        children: (Component, props) => {
                            const { tooltip, ...rest } = props;
                            return <Tooltip key="opentip" content={tooltip} trigger={<Component {...props} />}/>;
                        },
                        onClick: () => this.openModel()
                    },
                    {
                        key: 'filenewunit',
                        content: 'new model unit ...',
                        // TODO different icon for new modelunit
                        icon: "add",
                        tooltip: "Create a new model unit",
                        children: (Component, props) => {
                            /* ☝️ `tooltip` comes from shorthand object */
                            const { tooltip, ...rest } = props;
                            return <Tooltip key="newmodelunittip" content={tooltip} trigger={<Component {...props} />}/>;
                        },
                        onClick: () => this.newModelUnit()
                    },
                    {
                        key: 'fileopenunit',
                        content: 'open model unit ...',
                        // TODO different icon for new modelunit
                        icon: "download",
                        tooltip: "Open an existing model unit",
                        children: (Component, props) => {
                            /* ☝️ `tooltip` comes from shorthand object */
                            const { tooltip, ...rest } = props;
                            return <Tooltip key="openmodelunittip" content={tooltip} trigger={<Component {...props} />}/>;
                        },
                        onClick: () => this.openModelUnit()
                    },                    {
                        key: "filesaveunit",
                        content: "save model unit",
                        icon: "open-outside",
                        tooltip: "Save the current model unit on the server",
                        children: (Component, props) => {
                            const { tooltip, ...rest } = props;
                            return <Tooltip key="savetip" content={tooltip} trigger={<Component {...props} />}/>;
                        },
                        onClick: () => this.saveModelUnit()
                    },
                    {
                        key: "filedeleteunit",
                        content: "delete model unit",
                        icon: "files-txt",
                        tooltip: "Delete the current model unit from the server",
                        children: (Component, props) => {
                            const { tooltip, ...rest } = props;
                            return <Tooltip key="deleteastip" content={tooltip} trigger={<Component {...props} />}/>;
                        },
                        onClick: () => this.deleteModelUnit()
                    }
                ]
            }
        },
        {
            key: "edit",
            content: "Edit",
            menu: {
                items: [
                    {
                        key: "editundo",
                        content: "undo (not yet implemented)",
                        icon: "undo",
                        disabled: true,
                        tooltip: "Undo the last edit",
                        children: (Component, props) => {
                            /* ☝️ `tooltip` comes from shorthand object */
                            const { tooltip, ...rest } = props;
                            return <Tooltip key="undotip" content={tooltip} trigger={<Component {...props} />}/>;
                        },
                        onClick: () => EditorCommunication.getInstance().undo()
                    },
                    {
                        key: "editredo",
                        content: "redo (not yet implemented)",
                        icon: "redo",
                        disabled: true,
                        tooltip: "Redo the last edit",
                        children: (Component, props) => {
                            /* ☝️ `tooltip` comes from shorthand object */
                            const { tooltip, ...rest } = props;
                            return <Tooltip key="redotip" content={tooltip} trigger={<Component {...props} />}/>;
                        },
                        onClick: () => EditorCommunication.getInstance().redo()
                    }
                ]
            }
        },
        {
            key: "search",
            content: "Search",
            menu: {
                items: [
                    {
                        key: "searchstring",
                        content: "search (not yet implemented)",
                        icon: "search",
                        disabled: true,
                        tooltip: "Search in the modelunit",
                        children: (Component, props) => {
                            /* ☝️ `tooltip` comes from shorthand object */
                            const { tooltip, ...rest } = props;
                            return <Tooltip key="searchtip" content={tooltip} trigger={<Component {...props} />}/>;
                        },
                        onClick: () => this.search()
                    }
                ]
            }
        },
        // Show a menu where one can choose between all defined projections
        {
            key: "projection",
            content: "Projection",
            menu: {
                items:
                    EditorCommunication.getInstance().getProjectionNames().map(name => {
                        return {
                            key: name,
                            content: name,
                            tooltip: "Show default projection",
                            children: (Component, props) => {
                                const { tooltip, ...rest } = props;
                                return <Tooltip key={"projection" + name} content={tooltip} trigger={<Component {...props} />}/>;
                            },
                            onClick: () => {
                                EditorCommunication.getInstance().setProjection(name);
                            }
                        };
                    })
            }
        },
        // show the help menu
        {
            key: "help",
            content: "Help",
            menu: {
                items: [
                    {
                        key: "helpkeys",
                        content: "keybindings",
                        icon: "hand",
                        tooltip: "Show a list of keybindings for the editor",
                        children: (Component, props) => {
                            /* ☝️ `tooltip` comes from shorthand object */
                            const { tooltip, ...rest } = props;
                            return <Tooltip key="keystip" content={tooltip} trigger={<Component {...props} />}/>;
                        },
                        onClick: () => this.keybindings()
                    },
                    {
                        key: "helphelp",
                        content: "help",
                        icon: "question-circle",
                        tooltip: "Show help",
                        children: (Component, props) => {
                            /* ☝️ `tooltip` comes from shorthand object */
                            const { tooltip, ...rest } = props;
                            return <Tooltip key="helptip" content={tooltip} trigger={<Component {...props} />}/>;
                        },
                        onClick: () => this.help()
                    },
                    {
                        key: "helpabout",
                        content: "about",
                        icon: "notes",
                        tooltip: "Show information about this tool",
                        children: (Component, props) => {
                            /* ☝️ `tooltip` comes from shorthand object */
                            const { tooltip, ...rest } = props;
                            return <Tooltip key="abouttip" content={tooltip} trigger={<Component {...props} />}/>;
                        },
                        onClick: () => this.about()
                    }
                ]
            }
        }
    ];

    aboutContent = (
        <Flex gap="gap.small" padding="padding.medium" column={true}>
            <Segment color={"darkblue"}>
                <Text >
                ProjectIt is an open source project which can be found at:
                    <br/>
                <Link align="center" href="http://projectit.org/" target="_blank">
                    www.projectit.org.
                </Link>
                </Text>
            </Segment>

            <Segment content={"Version: " + versionNumber} color={"darkblue"}/>

            <Segment color={"darkblue"}>
                <Text content={"Created by: "}/>
                <Link align="center" href="http://openmodeling.nl/" target="_blank">
                    www.openmodeling.nl.
                </Link>
            </Segment>

        </Flex>
    );

    render(): JSX.Element {
        return <Menu defaultActiveIndex={0} items={this.menuItems}/>;
    }

    async newModel() {
        // because of asynchronicity the method 'internalNewModel' is called in the else branche
        // as well as in the save and cancel callbacks
        if (EditorCommunication.getInstance().hasChanges) {
            // console.log("HAS CHANGES");
            App.setDialogTitle(`Current model unit '${EditorCommunication.getInstance().currentUnit.name}' has unsaved changes.`);
            App.setDialogSubText("Do you want to save it?");
            App.useDefaultButton();
            App.setDialogContent(null);
            await App.showDialogWithCallback( () => {
                    if (!!EditorCommunication.getInstance().currentUnit && EditorCommunication.getInstance().currentUnit.name.length > 0) {
                        EditorCommunication.getInstance().saveCurrentUnit();
                        this.internalNewModel();
                    } else {
                        App.setDialogTitle("Model unit must have a name before saving.");
                        App.setDialogSubText("");
                        App.setDialogContent(null);
                        App.showDialog();
                    }
                },
                () => {
                    this.internalNewModel();
                });
        } else {
            // console.log("NEW WITHOUT CHANGES");
            await this.internalNewModel();
        }
        this.dialogData.modelName = "";
    }

    private async internalNewModel() {
        // ask the user for the name of the new model
        App.setDialogTitle(`Creating a new model.`);
        App.setDialogSubText("Please, enter a name for the new model. ");
        App.setDialogContent(<Flex column={true}>
            <Text content="Model name: "/>
            <Input clearable fluid inputRef={this.dialogData.setModelName}/>
            {/*<Input clearable fluid placeholder={placeHolderModelName} icon={<SearchIcon />} disabled={disabledModelName} inputRef={this.setModelName}/>*/}
        </Flex>);
        await App.showDialogWithCallback(() => {
            if (this.dialogData.modelName.length > 0 ) {
                // check wether the given name is already in use
                let newName = this.dialogData.modelName;
                ServerCommunication.getInstance().loadModelList((names) => {
                    if (names.includes(newName)) {
                        // error
                        App.setDialogTitle(`Model name '${newName}' already exists on the server.`);
                        App.setDialogSubText("");
                        App.setDialogContent(null);
                        App.showDialog();
                    } else {
                        EditorCommunication.getInstance().newModel(this.dialogData.modelName);
                        // ask the user for the type of the first model unit
                        this.newModelUnit();
                    }
                })
            }
        });
    }

    async newModelUnit() {
        // console.log("new Model unit called");
        if (EditorCommunication.getInstance().hasChanges) {
            await CommonOperations.getInstance().saveChangesBeforeCallback(this.dialogData, this.internalNewModelUnit);
        } else {
            this.internalNewModelUnit(this.dialogData);
        }
        this.dialogData.unitName = "";
    }

    private internalNewModelUnit(dialogData: DialogData) {
        // create a list of model unit types => radio group with unit type name as label
        // and show this in a dialog
        const modelUnitTypes: string[] = EditorCommunication.getInstance().getModelUnitTypes();
        if (modelUnitTypes.length === 0) {
            // error
            return;
        }
        dialogData.modelUnitType = modelUnitTypes[0];
        App.setDialogTitle(`Creating new model unit`);
        App.setDialogSubText("Select the type of the new model unit:");
        App.setDialogContent(<div>
            <RadioGroup
                vertical
                defaultCheckedValue={modelUnitTypes[0]}
                items={dialogData.stringToRadioGroupItems(modelUnitTypes)}
                onCheckedValueChange={dialogData.setUnitType}
            />
        </div>);
        App.showDialogWithCallback(() => {
            // get the selected modelunit type and let EditorCommunication.getInstance() do the rest
            EditorCommunication.getInstance().newUnit(dialogData.modelUnitType);
        });
    }

    async saveModelUnit() {
        const unitName = EditorCommunication.getInstance().currentUnit.name;
        if (unitName.length === 0) {
            App.setDialogTitle(`Current model unit cannot be saved.`);
            App.setDialogSubText("The model unit cannot be saved because it is unnamed. Please, name it, and try again.");
            await App.showDialogWithCallback( () => {
                },
                () => {
                    this.internalNewModelUnit(this.dialogData);
                });
        } else {
            // else let EditorCommunication.getInstance() do the job
            EditorCommunication.getInstance().saveCurrentUnit();
        }
    }

    deleteModelUnit() {
        App.setDialogTitle("Delete model unit ...");
        if (!!EditorCommunication.getInstance().currentUnit) {
            App.setDialogSubText("Are you sure you want to delete the current model unit?");
            App.useDefaultButton();
            App.setDialogContent(null);
            App.showDialogWithCallback(() => {
                EditorCommunication.getInstance().deleteCurrentUnit();
            });
        } else { // this should never happen
            App.setDialogSubText("Cannot delete, because there is no model unit selected.");
            App.showDialog();
        }
    }

    async openModel() {
        // because of asynchronicity the method 'internalOpen' is called in the else branche
        // as well as in the save and cancel callbacks
        if (EditorCommunication.getInstance().hasChanges) {
            await CommonOperations.getInstance().saveChangesBeforeCallback(this.dialogData, this.internalOpenModel);
        } else {
            this.internalOpenModel(this.dialogData);
        }
    }

    private internalOpenModel(dialogData: DialogData) {
        // get all model names from the server and show a dialog where the user can choose the model to open
        ServerCommunication.getInstance().loadModelList((modelNames: string[]) => {
            if (modelNames.length > 0) {
                // set the default value
                dialogData.modelName = modelNames[0];
                // open a selection dialog
                App.setDialogTitle("Open Model ...");
                App.setDialogSubText("");
                App.useDefaultButton();
                App.setDialogContent(<div>
                    <RadioGroup
                        vertical
                        defaultCheckedValue={modelNames[0]}
                        items={dialogData.stringToRadioGroupItems(modelNames)}
                        onCheckedValueChange={dialogData.setModelNameFromProps}
                    />
                </div>);
                App.showDialogWithCallback(() => {
                    console.log("Modelname: " + dialogData.modelName);
                    if (!!dialogData.modelName && dialogData.modelName.length > 0) {
                        EditorCommunication.getInstance().openModel(dialogData.modelName);
                    }
                });
            } else {
                App.setDialogTitle("No models found on server.");
                App.setDialogSubText("");
                App.setDialogContent(null);
                App.showDialog();
            }
        });
    }

    async openModelUnit() {
        // because of asynchronicity the method 'internalOpen' is called in the else branche
        // as well as in the save and cancel callbacks
        if (EditorCommunication.getInstance().hasChanges) {
            // console.log("HAS CHANGES");
            await CommonOperations.getInstance().saveChangesBeforeCallback(this.dialogData, this.internalOpenModelUnit);
        } else {
            this.internalOpenModelUnit(this.dialogData);
        }
    }

    private internalOpenModelUnit(dialogData: DialogData) {
        // get all model names from the current model and show a dialog where the user can choose the unit to open
        if (!!EditorCommunication.getInstance().currentModel) {
            const availableUnits: PiNamedElement[] = EditorCommunication.getInstance().currentModel.getUnits();
            const unitNames: string[] = availableUnits.map(u => u.name);
            if (unitNames.length > 0) {
                // set the default value
                dialogData.unitName = unitNames[0];
                // open a selection dialog
                App.setDialogTitle("Open Model Unit ...");
                App.setDialogSubText("");
                App.useDefaultButton();
                App.setDialogContent(<div>
                    <RadioGroup
                        vertical
                        defaultCheckedValue={unitNames[0]}
                        items={dialogData.stringToRadioGroupItems(unitNames)}
                        onCheckedValueChange={dialogData.setUnitNameFromProps}
                    />
                </div>);
                App.showDialogWithCallback(() => {
                    console.log("unitname: " + dialogData.unitName);
                    if (!!dialogData.unitName && dialogData.unitName.length > 0) {
                        EditorCommunication.getInstance().openModelUnit(dialogData.unitName);
                    }
                });
            } else {
                App.setDialogTitle("No units available.");
                App.setDialogSubText("");
                App.setDialogContent(null);
                App.showDialog();
            }
        } else {
            // warning that there is no current model
            App.setDialogTitle("There is no model available.");
            App.setDialogSubText("Please, open a model before opening a model unit.");
            App.setDialogContent(null);
            App.showDialog();
        }
    }

    // the following is unused, for now
    // saveModelUnitAs(title?: string) {
    //     App.setDialogTitle((title? title : "Save as ..."));
    //     App.setDialogSubText("");
    //     App.useDefaultButton();
    //     App.setDialogContent(this.makeModelUnitForm(false, EditorCommunication.getInstance().currentModel.name, EditorCommunication.getInstance().currentUnit.name));
    //     App.showDialogWithCallback( () => {
    //         if (!!this.unitName) {
    //             EditorCommunication.getInstance().saveUnitAs(this.unitName);
    //         }
    //         // console.log("model: " + EditorCommunication.getInstance().currentModelName + ", unit: " + EditorCommunication.getInstance().currentUnit.name);
    //     });
    // }

    search() {
        App.setDialogTitle("Search");
        App.setDialogSubText("Unfortunately, this feature is not yet implemented");
        App.setDialogContent(<Icon name="ban"/>);
        App.showDialog();
    }

    about() {
        App.setDialogTitle("About ProjectIt");
        App.setDialogSubText("");
        App.setDialogContent(this.aboutContent);
        App.showDialog();
    }

    help() {
        App.setDialogTitle("Help for ProjectIt");
        App.setDialogSubText("Currently there is no in-build help functionality.\nWe refer you to our website.\n");
        App.setDialogContent(
            <Text align="center">
                <Link align="center" href="http://projectit.org/" target="_blank">
                    www.projectit.org.
                </Link>
            </Text>
        );
        App.showDialog();
    }

    // TODO add list of keybindings
    keybindings() {
        App.setDialogTitle("Keybindings for ProjectIt");
        App.setDialogSubText("");
        App.setDialogContent(<Text align="center">This should be a list of keybindings</Text>);
        App.showDialog();
    }

}
