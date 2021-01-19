import { Toolbar, Alert } from "@fluentui/react-northstar";
import * as React from 'react';
import { EditorCommunication } from "./EditorCommunication";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { IIconProps } from "office-ui-fabric-react";
import { DefaultButton } from "@fluentui/react";
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { PiLogger } from "@projectit/core";

const LOGGER = new PiLogger("PiToolbar").mute();

const navNotShown: IIconProps = { iconName: 'FlickLeft' };
const navShown: IIconProps = { iconName: 'FlickRight' };
const errorsShown: IIconProps = { iconName: 'FlickUp' };
const errorsNotShown: IIconProps = { iconName: 'FlickDown' };

@observer
export class PiToolbar extends React.Component<{}, {}> {
    disabled: boolean = false;
    static instance: PiToolbar = null;
    @observable showNavigator: boolean = true;
    @observable showErrorlist = true;
    @observable public alertIsVisible: boolean = false;
    @observable public alertContent: string = "";

    constructor(props: {}) {
        super(props);
        initializeIcons(/* optional base url */);
        PiToolbar.instance = this;
    }

    render() {
        return <Toolbar
            aria-label="pi-toolbar"
            items={[
                {
                    key: 'navigation-button',
                    kind: 'custom',
                    content:     <DefaultButton
                        toggle
                        text={this.showNavigator ? 'Hide navigator' : 'Show navigator'}
                        iconProps={this.showNavigator ? navShown : navNotShown}
                        onClick={this.changeShowNavigator}
                        allowDisabledFocus
                        disabled={this.disabled}
                    />,
                    fitted: 'horizontally',
                    title: "Show/hide model navigator",
                },
                {
                    key: 'errors-button',
                    kind: 'custom',
                    content:     <DefaultButton
                        toggle
                        text={this.showErrorlist ? 'Hide error list' : 'Show error list'}
                        iconProps={this.showErrorlist ? errorsShown : errorsNotShown}
                        onClick={this.changeShowErrorlist}
                        allowDisabledFocus
                        disabled={this.disabled}
                    />,
                    fitted: 'horizontally',
                    title: "Show/hide error list",
                },
                {
                    key: 'validate-button',
                    kind: 'custom',
                    content:     <DefaultButton
                        text={'Validate model'}
                        iconProps={{ iconName: 'StatusCircleCheckmark' }}
                        onClick={this.validateModel}
                        allowDisabledFocus
                        disabled={this.disabled}
                    />,
                    fitted: 'horizontally',
                    title: "Validate model",
                },
                {
                    key: 'alert-message',
                    kind: 'custom',
                    content:   <Alert
                        content={this.alertContent}
                        dismissible
                        variables={{
                            urgent: true,
                        }}
                        visible={this.alertIsVisible}
                        onVisibleChange={this.setAlertVisible}
                    />,
                    fitted: 'horizontally',
                    title: "Alert message",
                }
            ]}
        />;
    }

    changeShowNavigator = () => {
        LOGGER.log("setting showNavigator to " + !this.showNavigator);
        this.showNavigator = !this.showNavigator;
        EditorCommunication.getInstance().editorArea.showNavigator = this.showNavigator;
    };

    changeShowErrorlist = () => {
        LOGGER.log("setting showErrorlist to " + !this.showErrorlist);
        this.showErrorlist = !this.showErrorlist;
        EditorCommunication.getInstance().editorArea.showErrorlist = this.showErrorlist;
    }

    validateModel = () => {
        LOGGER.log("validate model");
        EditorCommunication.getInstance().getErrors();
    }

    private setAlertVisible = (ev: React.MouseEvent<HTMLElement>) => {
        LOGGER.log("setAlertVisible called");
        this.alertIsVisible = false;
    }
}



