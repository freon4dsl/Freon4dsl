import * as React from "react";
import { Dialog, DialogType, DialogFooter, Link, createTheme, loadTheme } from "@fluentui/react";
import { PrimaryButton, DefaultButton } from "@fluentui/react";
import { ContextualMenu } from "@fluentui/react";
import { Text, Flex, Box } from "@fluentui/react-northstar";
import { MainGrid } from "./MainGrid";

// This component holds the MainGrid and the Dialog
export const footerheight = "25px";
// TODO states should be implemented differently: using mobx

export interface IDialogState {
    hideDialog: boolean;
    title: string;
    subText: string;
    content: JSX.Element;
}

// This theme is based on the ProjectIt colors
const myTheme = createTheme({
    palette: {
        themePrimary: '#00008b',
        themeLighterAlt: '#f0f0fa',
        themeLighter: '#c7c7ed',
        themeLight: '#9a9add',
        themeTertiary: '#4a4aba',
        themeSecondary: '#12129a',
        themeDarkAlt: '#00007e',
        themeDark: '#00006b',
        themeDarker: '#00004f',
        neutralLighterAlt: '#faf9f8',
        neutralLighter: '#f3f2f1',
        neutralLight: '#edebe9',
        neutralQuaternaryAlt: '#e1dfdd',
        neutralQuaternary: '#d0d0d0',
        neutralTertiaryAlt: '#c8c6c4',
        neutralTertiary: '#a19f9d',
        neutralSecondary: '#605e5c',
        neutralPrimaryAlt: '#3b3a39',
        neutralPrimary: '#323130',
        neutralDark: '#201f1e',
        black: '#000000',
        white: '#ffffff',
    }});

loadTheme(myTheme);

export class App extends React.Component<{}, IDialogState> {
    useDefaultButton: boolean = false;
    state: IDialogState = {
        hideDialog: true,
        title: "ProjectIt Dialog",
        subText: "This is the subtext.",
        content: null
    };

    private _dragOptions = {
        moveMenuItemText: "Move",
        closeMenuItemText: "Close",
        menu: ContextualMenu
    };

    constructor(props: {}) {
        super(props);
        App.thisApp = this;
        this.state.content = this.setInitialDialogContent();
    }

    public render() {
        const { hideDialog, title, subText, content } = this.state;
        return (
            <div>
                <div
                    style={{
                        height: "100%",
                        margin: "0"
                    }}
                >
                    <div
                        style={{
                            minHeight: "100%",
                            minWidth: "100%"
                        }}
                    >
                        <div
                            style={{
                                padding: "20px",
                                paddingBottom: "50px"
                            }}
                        >
                            <MainGrid />
                        </div>

                    {/*"footer"*/}
                    <Flex gap="gap.small" padding="padding.medium" hAlign="center" vAlign="center"
                          style={{
                              height: footerheight,
                              marginTop: "-25px",
                              backgroundColor: "darkblue",
                              color: "rgba(211, 227, 253, 255)"
                          }}>
                        <div>
                            <Text content="Created by ProjectIt " size="medium" />
                            <Link href="http://www.projectit.org/" target="_blank">
                                <Text content="(www.projectit.org)." />
                            </Link>
                        </div>
                    </Flex>
                    </div>
                    {/*Global dialog needs to be on the main page*/}
                    <Dialog
                        hidden={hideDialog}
                        onDismiss={this._dismissDialog}
                        dialogContentProps={{
                            type: DialogType.largeHeader,
                            title: title,
                            closeButtonAriaLabel: "Close",
                            subText: subText
                        }}
                        modalProps={{
                            // titleAriaId: this._labelId,
                            // subtitleAriaId: this._subTextId,
                            isBlocking: false,
                            styles: { main: { maxWidth: 450 } },
                            dragOptions: this._dragOptions
                        }}
                    >
                        {content}
                        <DialogFooter>
                            <PrimaryButton onClick={this._okPushed} text="Ok" />
                            {this.useDefaultButton ? <DefaultButton onClick={this._cancelPushed} text="Cancel" /> : null}
                        </DialogFooter>
                    </Dialog>
                </div>
            </div>
        );
    }

    private _showDialog = (): void => {
        this.setState({ hideDialog: false });
    };

    private _dismissDialog = (): void => {
        this.setState({ hideDialog: true });
        this.useDefaultButton = false;
        App.onOkCallBack = null;
        App.onCancelCallBack = null;
    };

    private _okPushed = async () => {
        this.setState({ hideDialog: true });
        this.useDefaultButton = false;
        if (!!App.onOkCallBack) {
            // console.log("Calling ok callBack");
            await App.onOkCallBack();
            // console.log("Ready calling ok callBack");
        }
    };

    private _cancelPushed = async () => {
        this.setState({ hideDialog: true });
        this.useDefaultButton = false;
        if (!!App.onCancelCallBack) {
            // console.log("Calling cancel callBack");
            await App.onCancelCallBack();
            // console.log("Ready calling cancel callBack");
        }
    };

    private setInitialDialogContent = () => {
        return <Text content="There should be some text here" size="medium" />;
    };

    // set of statics to enable the calling of the dialog from elsewhere in the application
    static thisApp: App;
    // set when the dialog is opened from the menu.
    // watch out: these are set to null at a subsequential call of ShowDialog
    // this should not be forgotten
    static onOkCallBack: () => void;
    static onCancelCallBack: () => void;

    public static showDialogWithCallback(onOk: () => void, onCancel?: () => void) {
        App.onOkCallBack = onOk;
        App.onCancelCallBack = (!!onCancel? onCancel : null);
        !!App.thisApp ? App.thisApp._showDialog() : console.error("No App object found");
    }

    public static showDialog = (): void => {
        App.onOkCallBack = null;
        App.onCancelCallBack = null;
        !!App.thisApp ? App.thisApp._showDialog() : console.error("No App object found");
    };

    public static closeDialog = (): void => {
        !!App.thisApp ? App.thisApp._cancelPushed() : console.error("No App object found");
    };

    public static useDefaultButton = (): void => {
        !!App.thisApp ? (App.thisApp.useDefaultButton = true) : console.error("No App object found");
    };

    public static setDialogTitle = (newTitle: string): void => {
        !!App.thisApp ? (App.thisApp.state.title = newTitle) : console.error("No App object found");
    };

    public static setDialogSubText = (newSubText: string): void => {
        !!App.thisApp ? (App.thisApp.state.subText = newSubText) : console.error("No App object found");
    };

    public static setDialogContent = (newContent: JSX.Element): void => {
        !!App.thisApp ? (App.thisApp.state.content = newContent) : console.error("No App object found");
    };
}
