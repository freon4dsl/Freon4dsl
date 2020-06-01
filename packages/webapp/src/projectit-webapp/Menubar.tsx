import * as React from 'react';
import {Menu, Tooltip, Icon, Flex, Text} from "@fluentui/react-northstar";
import { Link } from '@fluentui/react';
import { EditorEnvironment } from "../gateway-to-projectit/EditorEnvironment";
import { App } from "./App";
import { Navigator } from "./Navigator";
import { TextField } from "@fluentui/react";

const versionNumber = "0.0.5";

export default class Menubar extends React.Component {
    menuItems = [
        {
            key: "file",
            content: "File",
            menu: {
                items: [
                    {
                        key: "filenew",
                        content: "new",
                        icon: "add",
                        tooltip: 'Create a new model unit',
                        children: (Component, props) => {
                            /* ☝️ `tooltip` comes from shorthand object */
                            const {tooltip, ...rest} = props;
                            return <Tooltip key="newtip" content={tooltip} trigger={<Component {...props} />}/>
                        },
                        onClick: () => EditorEnvironment.new(),
                    },
                    {
                        key: "fileopen",
                        content: "open ...",
                        icon : "download",
                        tooltip: 'Open an existing model unit',
                        children: (Component, props) => {
                            /* ☝️ `tooltip` comes from shorthand object */
                            const {tooltip, ...rest} = props;
                            return <Tooltip key="opentip" content={tooltip} trigger={<Component {...props} />}/>
                        },
                        onClick: () => this.openModel(),
                    },
                    {
                        key: "filesave",
                        content: "save",
                        icon : "open-outside",
                        tooltip: 'Save the current model unit on the server',
                        children: (Component, props) => {
                            /* ☝️ `tooltip` comes from shorthand object */
                            const {tooltip, ...rest} = props;
                            return <Tooltip key="savetip" content={tooltip} trigger={<Component {...props} />}/>
                        },
                        onClick: () => EditorEnvironment.save(),
                    },
                    {
                        key: "filesaveas",
                        content: "save as ...",
                        icon: "files-txt",
                        tooltip: 'Save the current model unit with a different unitName',
                        children: (Component, props) => {
                            /* ☝️ `tooltip` comes from shorthand object */
                            const {tooltip, ...rest} = props;
                            return <Tooltip key="saveastip" content={tooltip} trigger={<Component {...props} />}/>
                        },
                        onClick: () => this.saveAs(),
                    },
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
                        tooltip: 'Undo the last edit',
                        children: (Component, props) => {
                            /* ☝️ `tooltip` comes from shorthand object */
                            const {tooltip, ...rest} = props;
                            return <Tooltip key="undotip" content={tooltip} trigger={<Component {...props} />}/>
                        },
                        onClick: () => EditorEnvironment.undo(),
                    },
                    {
                        key: "editredo",
                        content: "redo (not yet implemented)",
                        icon: "redo",
                        disabled: true,
                        tooltip: 'Redo the last edit',
                        children: (Component, props) => {
                            /* ☝️ `tooltip` comes from shorthand object */
                            const {tooltip, ...rest} = props;
                            return <Tooltip key="redotip" content={tooltip} trigger={<Component {...props} />}/>
                        },
                        onClick: () => EditorEnvironment.redo(),
                    },
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
                        tooltip: 'Search in the model unit',
                        children: (Component, props) => {
                            /* ☝️ `tooltip` comes from shorthand object */
                            const {tooltip, ...rest} = props;
                            return <Tooltip key="searchtip" content={tooltip} trigger={<Component {...props} />}/>
                        },
                        onClick: () => this.search(),
                    },
                ]
            }
        },
        {
            key: "help",
            content: "Help",
            menu: {
                items: [
                    {
                        key: "helpkeys",
                        content: "keybindings",
                        icon: "hand",
                        tooltip: 'Show a list of keybindings for the editor',
                        children: (Component, props) => {
                            /* ☝️ `tooltip` comes from shorthand object */
                            const {tooltip, ...rest} = props;
                            return <Tooltip key="keystip" content={tooltip} trigger={<Component {...props} />}/>
                        },
                        onClick: () => this.keybindings(),
                    },
                    {
                        key: "helphelp",
                        content: "help",
                        icon: "question-circle",
                        tooltip: 'Show help',
                        children: (Component, props) => {
                            /* ☝️ `tooltip` comes from shorthand object */
                            const {tooltip, ...rest} = props;
                            return <Tooltip key="helptip" content={tooltip} trigger={<Component {...props} />}/>
                        },
                        onClick: () => this.help(),
                    },
                    {
                        key: "helpabout",
                        content: "about",
                        icon: "notes",
                        tooltip: 'Show information about this tool',
                        children: (Component, props) => {
                            /* ☝️ `tooltip` comes from shorthand object */
                            const {tooltip, ...rest} = props;
                            return <Tooltip key="abouttip" content={tooltip} trigger={<Component {...props} />}/>
                        },
                        onClick: () => this.about(),
                    },
                ]
            }
        }
    ];

    aboutContent = ( <Flex gap="gap.small" padding="padding.medium" column={true}>
        <Text align="center" content={"ProjectIt version " + versionNumber}/>
        <Text align="center" content={"ProjectIt is an open source project which can be found at"}/>
        <Text align="center"><Link align="center" href="http://projectit.org/" target="_blank">www.projectit.org.</Link></Text>
        <Text align="center" content={"Created by"}/>
        <Text align="center"><Link align="center" href="http://openmodeling.nl/" target="_blank">www.openmodeling.nl.</Link></Text>
    </Flex>);



    render(): JSX.Element {
        return <Menu defaultActiveIndex={0} items={this.menuItems}/>
    }

    openModel() {
        App.setDialogTitle("Open Model");
        App.setDialogSubText("");
        App.setDialogContent(<Navigator/>);
        App.showDialog();
    }

    saveAs() {
        App.setDialogTitle("Save Model as ...");
        App.setDialogSubText("");
        App.useDefaultButton();
        App.setDialogContent(<TextField label="New name:" underlined onChange={this.captureName}/>);
        App.showDialog();
    }

    private newValue: string;
    captureName (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) {
        // TODO how to capture the new unitName???
        console.log("event type is " + event.type );
        // if (!!newValue ) this.newValue = newValue;
    }

    saveAsClosed() {
        App.closeDialog();
        if (!!this.newValue ) EditorEnvironment.saveAs(this.newValue);
    }

    search() {
        App.setDialogTitle("Search");
        App.setDialogSubText("Unfortunately, this feature is not yet implemented");
        App.setDialogContent(<Icon name="ban" />);
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
        App.setDialogContent(<Text align="center"><Link align="center" href="http://projectit.org/" target="_blank">www.projectit.org.</Link></Text>);
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

