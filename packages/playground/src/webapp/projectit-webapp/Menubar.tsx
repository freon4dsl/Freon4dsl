import * as React from "react";
import { Menu, Tooltip, Icon, Flex, Text, Input, Segment, FlexItem, Divider, RadioGroup } from "@fluentui/react-northstar";
import { Link } from "@fluentui/react";
import { EditorCommunication } from "../gateway-to-projectit/EditorCommunication";
import { App } from "./App";
import { CanvasAddPageIcon, SearchIcon } from "@fluentui/react-icons-northstar";
import { observable } from "mobx";
import { observer } from "mobx-react";

const versionNumber = "0.0.5";

export default class Menubar extends React.Component {
    modelName: string = "";
    documentName: string = "";
    documentType: string = "";

    private setModelName = (element: any | null) => {
        if (!!element && !!element.value) {
            this.modelName = element?.value;
            // console.log("model name set to : " + this.modelName);
        }
    };

    private setDocumentName = (element: any | null) => {
        if (!!element && !!element.value) {
            this.documentName = element?.value;
            // console.log("Document name set to : " + this.documentName);
        }
    };

    private setDocumentType = (e, props) => {
        if (!!props && !!props.value) {
            this.documentType = props?.value;
            console.log("Document type set to : " + this.documentType);
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
                        content: 'new document ...',
                        // TODO different icon for new document
                        icon: "add",
                        tooltip: "Create a new document",
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
                        tooltip: "Open an existing document",
                        children: (Component, props) => {
                            const { tooltip, ...rest } = props;
                            return <Tooltip key="opentip" content={tooltip} trigger={<Component {...props} />}/>;
                        },
                        onClick: () => this.openModel()
                    },
                    {
                        key: "filesave",
                        content: "save",
                        icon: "open-outside",
                        tooltip: "Save the current document on the server",
                        children: (Component, props) => {
                            const { tooltip, ...rest } = props;
                            return <Tooltip key="savetip" content={tooltip} trigger={<Component {...props} />}/>;
                        },
                        onClick: () => this.save() //EditorCommunication.save()
                    },
                    {
                        key: "filesaveas",
                        content: "save as ...",
                        icon: "files-txt",
                        tooltip: "Save the current document with a different name",
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
                        tooltip: "Delete the current document",
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

    makeModelDocumentForm(disabledModelName: boolean, placeHolderModelName: string, placeHolderDocumentName: string ): JSX.Element {
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
        App.setDialogTitle("Delete Document ...");
        if (EditorCommunication.currentDocumentName.length > 0) {
            App.setDialogSubText("Are you sure you want to delete the current document?");
            App.setDialogContent(this.makeModelDocumentForm(true, EditorCommunication.currentModelName, EditorCommunication.currentDocumentName));
            App.useDefaultButton();
            App.showDialogWithCallback(() => {
                EditorCommunication.deleteCurrentModel();
            });
        } else {
            App.setDialogSubText("Cannot delete, because there is no document selected.");
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
            App.setDialogTitle(`Document '${EditorCommunication.currentModelName}/${EditorCommunication.currentDocumentName}' has unsaved changes.`);
            App.setDialogSubText("Do you want to save it? If so, please, enter a name. ");
            App.useDefaultButton();
            App.setDialogContent(this.makeModelDocumentForm(false, EditorCommunication.currentModelName, EditorCommunication.currentDocumentName));
            await App.showDialogWithCallback( () => {
                    if (!!this.documentName) {
                        EditorCommunication.saveAs(this.modelName, this.documentName);
                    }
                    EditorCommunication.newModel();
                },
                () => {
                    EditorCommunication.newModel();
                });
        } else {
            EditorCommunication.newModel();
        }
    }

    newDocument() {
        console.log("new Document called");
        // get the list of document types
        const documentTypes = EditorCommunication.getModelUnitTypes();
        if (documentTypes.length === 0) {
            // error
            return;
        }
        this.documentType = documentTypes[0];
        // create a list of document types => radio group with document type name as label
        // and show this in a dialog
        App.setDialogTitle(`Select the type of the new document:`);
        App.setDialogSubText("");
        App.setDialogContent(<div>
            <RadioGroup
                vertical
                defaultCheckedValue={documentTypes[0]}
                items={this.getItems(documentTypes)}
                onCheckedValueChange={this.setDocumentType}
            />
        </div>);
        App.showDialogWithCallback( () => {
            // get the selected document type and let EditorCommunication do the rest
            EditorCommunication.newDocument(this.documentType);
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

    async openModel() {
        // because of asynchronicity the method 'internalOpen' is called in the else branche
        // as well as in the save and cancel callbacks
        if (EditorCommunication.hasChanges) {
            // console.log("HAS CHANGES");
            App.setDialogTitle(`Document '${this.modelName}/${this.documentName}' has unsaved changes.`);
            App.setDialogSubText("Do you want it saved? If so, please, enter a name. ");
            App.useDefaultButton();
            App.setDialogContent(this.makeModelDocumentForm(true, EditorCommunication.currentModelName, EditorCommunication.currentDocumentName));
            await App.showDialogWithCallback( () => {
                if (!!this.documentName) {
                    EditorCommunication.saveAs(this.modelName, this.documentName);
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
        App.setDialogTitle("Open Document ...");
        App.setDialogSubText("");
        App.useDefaultButton();
        App.setDialogContent(this.makeModelDocumentForm(false, EditorCommunication.currentModelName, ""));
        App.showDialogWithCallback(() => {
            if (!!this.documentName) {
                const documentToOpen = this.documentName;
                const modelToOpen = (!!this.modelName ? this.modelName : EditorCommunication.currentModelName);
                // console.log(`Opening document '${modelToOpen}/${documentToOpen}`);
                EditorCommunication.open(modelToOpen, documentToOpen);
            }
        });
    }

    save() {
        // if name is not already known use saveAs
        if (EditorCommunication.currentModelName.length === 0 || EditorCommunication.currentDocumentName.length === 0) {
            this.saveAs("Current document does not yet have a name ...");
        } else { // else let EditorCommunication do the job
            EditorCommunication.save();
        }
    }

    saveAs(title?: string) {
        App.setDialogTitle((title? title : "Save as ..."));
        App.setDialogSubText("");
        App.useDefaultButton();
        App.setDialogContent(this.makeModelDocumentForm(false, EditorCommunication.currentModelName, EditorCommunication.currentDocumentName));
        App.showDialogWithCallback( () => {
            if (!!this.documentName) {
                EditorCommunication.saveAs(this.modelName, this.documentName);
            }
            // console.log("model: " + EditorCommunication.currentModelName + ", document: " + EditorCommunication.currentDocumentName);
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
