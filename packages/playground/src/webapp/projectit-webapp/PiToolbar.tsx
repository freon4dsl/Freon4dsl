import { Toolbar, Alert } from "@fluentui/react-northstar";
import * as React from 'react';
import { EditorCommunication } from "../gateway-to-projectit/EditorCommunication";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { IIconProps } from "office-ui-fabric-react";
import { DefaultButton } from "@fluentui/react";
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';

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
                        iconProps={{ iconName: 'Home' }}
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
        // console.log("setting showNavigator to " + !this.showNavigator);
        this.showNavigator = !this.showNavigator;
        EditorCommunication.editorArea.showNavigator = this.showNavigator;
    };

    changeShowErrorlist = () => {
        // console.log("setting showErrorlist to " + !this.showErrorlist);
        this.showErrorlist = !this.showErrorlist;
        EditorCommunication.editorArea.showErrorlist = this.showErrorlist;
    }

    validateModel = () => {
        console.log("validate model");
        EditorCommunication.getErrors();
    }

    private setAlertVisible = (ev: React.MouseEvent<HTMLElement>) => {
        // console.log("setAlertVisible called");
        this.alertIsVisible = false;
    }
}



