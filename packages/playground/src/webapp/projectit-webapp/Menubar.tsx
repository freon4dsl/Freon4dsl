import * as React from "react";
import { Menu, Tooltip, Icon, Flex, Text, Input, Segment, FlexItem, RadioGroup } from "@fluentui/react-northstar";
import { Link } from "@fluentui/react";
import { EditorCommunication } from "./EditorCommunication";
import { App } from "./App";
import { SearchIcon } from "@fluentui/react-icons-northstar";

const versionNumber = "0.1.0";

export default class Menubar extends React.Component {
    modelName: string = "";
    unitName: string = "";
    modelUnitType: string = "";

    private setModelName = (element: any | null) => {
        if (!!element && !!element.value) {
            this.modelName = element?.value;
            // console.log("model name set to : " + this.modelName);
        }
    };

    private setDocumentName = (element: any | null) => {
        if (!!element && !!element.value) {
            this.unitName = element?.value;
            // console.log("Unit name set to : " + this.unitName);
        }
    };

    private setUnitType = (e, props) => {
        if (!!props && !!props.value) {
            this.modelUnitType = props?.value;
            // console.log("Model unit type set to : " + this.modelUnitType);
        }
    };

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
                        key: 'filenewdocument',
                        content: 'new model unit ...',
                        // TODO different icon for new document
                        icon: "add",
                        tooltip: "Create a new model unit",
                        children: (Component, props) => {
                            /* ☝️ `tooltip` comes from shorthand object */
                            const { tooltip, ...rest } = props;
                            return <Tooltip key="newdocumenttip" content={tooltip} trigger={<Component {...props} />}/>;
                        },
                        onClick: () => this.newDocument()
                    },
                    {
                        key: "fileopen",
                        content: "open ...",
                        icon: "download",
                        tooltip: "Open an existing model unit",
                        children: (Component, props) => {
                            const { tooltip, ...rest } = props;
                            return <Tooltip key="opentip" content={tooltip} trigger={<Component {...props} />}/>;
                        },
                        onClick: () => this.openUnit()
                    },
                    {
                        key: "filesave",
                        content: "save",
                        icon: "open-outside",
                        tooltip: "Save the current model unit on the server",
                        children: (Component, props) => {
                            const { tooltip, ...rest } = props;
                            return <Tooltip key="savetip" content={tooltip} trigger={<Component {...props} />}/>;
                        },
                        onClick: () => this.save()
                    },
                    {
                        key: "filesaveas",
                        content: "save as ...",
                        icon: "files-txt",
                        tooltip: "Save the current model unit with a different name",
                        children: (Component, props) => {
                            const { tooltip, ...rest } = props;
                            return <Tooltip key="saveastip" content={tooltip} trigger={<Component {...props} />}/>;
                        },
                        onClick: () => this.saveAs()
                    },
                    {
                        key: "filedelete",
                        content: "delete",
                        icon: "files-txt",
                        tooltip: "Delete the current model unit",
                        children: (Component, props) => {
                            const { tooltip, ...rest } = props;
                            return <Tooltip key="deleteastip" content={tooltip} trigger={<Component {...props} />}/>;
                        },
                        onClick: () => this.delete()
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
                        onClick: () => EditorCommunication.undo()
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
                        onClick: () => EditorCommunication.redo()
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
                        tooltip: "Search in the document",
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
                    EditorCommunication.getProjectionNames().map(name => {
                        return {
                            key: name,
                            content: name,
                            tooltip: "Show default projection",
                            children: (Component, props) => {
                                const { tooltip, ...rest } = props;
                                return <Tooltip key={"projection" + name} content={tooltip} trigger={<Component {...props} />}/>;
                            },
                            onClick: () => {
                                EditorCommunication.setProjection(name);
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

    makeModelUnitForm(disabledModelName: boolean, placeHolderModelName: string, placeHolderDocumentName: string ): JSX.Element {
        return <Flex column={true}>
            <Text content="Model name: "/>
            <Input clearable fluid placeholder={placeHolderModelName} disabled={disabledModelName} inputRef={this.setModelName}/>
            {/*<Input clearable fluid placeholder={placeHolderModelName} icon={<SearchIcon />} disabled={disabledModelName} inputRef={this.setModelName}/>*/}

            <FlexItem push>
                <Text content="Document name: "/>
            </FlexItem>
            <Input clearable fluid placeholder={placeHolderDocumentName} inputRef={this.setDocumentName}/>
            {/*<Input clearable fluid placeholder={placeHolderDocumentName} icon={<CanvasAddPageIcon />} inputRef={this.setDocumentName}/>*/}
        </Flex>;
    }

    delete() {
        App.setDialogTitle("Delete model unit ...");
        if (EditorCommunication.currentUnitName.length > 0) {
            App.setDialogSubText("Are you sure you want to delete the current model unit?");
            App.setDialogContent(this.makeModelUnitForm(true, EditorCommunication.currentModelName, EditorCommunication.currentUnitName));
            App.useDefaultButton();
            App.showDialogWithCallback(() => {
                EditorCommunication.deleteCurrentModel();
            });
        } else {
            App.setDialogSubText("Cannot delete, because there is no model unit selected.");
            // TODO set different content
            App.setDialogContent(<SearchIcon/> );
            App.showDialog();
        }
    }

    async newModel() {
        // because of asynchronicity the method 'internalOpen' is called in the else branche
        // as well as in the save and cancel callbacks
        if (EditorCommunication.hasChanges) {
            // console.log("HAS CHANGES");
            App.setDialogTitle(`Model unit '${EditorCommunication.currentModelName}/${EditorCommunication.currentUnitName}' has unsaved changes.`);
            App.setDialogSubText("Do you want to save it? If so, please, enter a name. ");
            App.useDefaultButton();
            App.setDialogContent(this.makeModelUnitForm(false, EditorCommunication.currentModelName, EditorCommunication.currentUnitName));
            await App.showDialogWithCallback( () => {
                    if (!!this.unitName) {
                        EditorCommunication.saveAs(this.modelName, this.unitName);
                    }
                    EditorCommunication.newModel();
                },
                () => {
                    EditorCommunication.newModel();
                });
        } else {
            // TODO
            // ask the user for the name of the new model
            // get server to create a new folder for this model
            // show the model in the navigator
            // create the internal structure
            // ask the user for the first model unit - type and name
            // open the editor
            EditorCommunication.newModel();
        }
    }

    newDocument() {
        console.log("new Model unit called");
        // get the list of document types
        const modelUnitTypes = EditorCommunication.getModelUnitTypes();
        if (modelUnitTypes.length === 0) {
            // error
            return;
        }
        this.modelUnitType = modelUnitTypes[0];
        // create a list of document types => radio group with document type name as label
        // and show this in a dialog
        App.setDialogTitle(`Select the type of the new model unit:`);
        App.setDialogSubText("");
        App.setDialogContent(<div>
            <RadioGroup
                vertical
                defaultCheckedValue={modelUnitTypes[0]}
                items={this.getItems(modelUnitTypes)}
                onCheckedValueChange={this.setUnitType}
            />
        </div>);
        App.showDialogWithCallback( () => {
            // get the selected document type and let EditorCommunication do the rest
            EditorCommunication.newUnit(this.modelUnitType);
        });
    }

    getItems(labels: string[]) {
        let result = [];
        labels.forEach(label => {
           result.push({
               name: 'documentType',
               key: label,
               label: label,
               value: label,
           })
        });
        return result;
    }

    async openUnit() {
        // because of asynchronicity the method 'internalOpen' is called in the else branche
        // as well as in the save and cancel callbacks
        if (EditorCommunication.hasChanges) {
            // console.log("HAS CHANGES");
            App.setDialogTitle(`Model Unit '${this.modelName}/${this.unitName}' has unsaved changes.`);
            App.setDialogSubText("Do you want it saved? If so, please, enter a name. ");
            App.useDefaultButton();
            App.setDialogContent(this.makeModelUnitForm(true, EditorCommunication.currentModelName, EditorCommunication.currentUnitName));
            await App.showDialogWithCallback( () => {
                if (!!this.unitName) {
                    EditorCommunication.saveAs(this.modelName, this.unitName);
                }
                this.internalOpen();
                },
                () => {
                    this.internalOpen();
                });
        } else {
            this.internalOpen();
        }
    }

    private internalOpen() {
        App.setDialogTitle("Open Model Unit ...");
        App.setDialogSubText("");
        App.useDefaultButton();
        App.setDialogContent(this.makeModelUnitForm(false, EditorCommunication.currentModelName, ""));
        App.showDialogWithCallback(() => {
            if (!!this.unitName) {
                const unitToOpen = this.unitName;
                const modelToOpen = (!!this.modelName ? this.modelName : EditorCommunication.currentModelName);
                // console.log(`Opening unit '${modelToOpen}/${unitToOpen}`);
                EditorCommunication.open(modelToOpen, unitToOpen);
            }
        });
    }

    save() {
        // if name is not already known use saveAs
        if (EditorCommunication.currentModelName.length === 0 || EditorCommunication.currentUnitName.length === 0) {
            this.saveAs("Current document does not yet have a name ...");
        } else { // else let EditorCommunication do the job
            EditorCommunication.save();
        }
    }

    saveAs(title?: string) {
        App.setDialogTitle((title? title : "Save as ..."));
        App.setDialogSubText("");
        App.useDefaultButton();
        App.setDialogContent(this.makeModelUnitForm(false, EditorCommunication.currentModelName, EditorCommunication.currentUnitName));
        App.showDialogWithCallback( () => {
            if (!!this.unitName) {
                EditorCommunication.saveAs(this.modelName, this.unitName);
            }
            // console.log("model: " + EditorCommunication.currentModelName + ", unit: " + EditorCommunication.currentUnitName);
        });
    }

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
