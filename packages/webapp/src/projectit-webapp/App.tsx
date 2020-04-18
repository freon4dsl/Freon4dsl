import * as React from 'react';
// import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
// import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
// import { ContextualMenu } from 'office-ui-fabric-react/lib/ContextualMenu';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react';
import { PrimaryButton, DefaultButton } from '@fluentui/react';
import { ContextualMenu } from '@fluentui/react';
import {Text} from "@fluentui/react-northstar";
import {MainGrid} from "./MainGrid";

// This component holds the MainGrid and the Dialog
// TODO title of webpage is "React MainGrid", this should be changed
// TODO states should be implemented differently: using mobx

export interface IDialogState {
    hideDialog: boolean;
    title: string;
    subText: string;
    content: JSX.Element;
}

export class App extends React.Component<{}, IDialogState> {
    useDefaultButton: boolean = false;
    state: IDialogState = {
        hideDialog: true,
        title: "ProjectIt Dialog",
        subText: "This is the subtext.",
        content: null,
    };

    private _dragOptions = {
        moveMenuItemText: 'Move',
        closeMenuItemText: 'Close',
        menu: ContextualMenu,
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
                <MainGrid />

                <Dialog
                    hidden={hideDialog}
                    onDismiss={this._closeDialog}
                    dialogContentProps={{
                        type: DialogType.largeHeader,
                        title: title,
                        closeButtonAriaLabel: 'Close',
                        subText: subText,
                    }}
                    modalProps={{
                        // titleAriaId: this._labelId,
                        // subtitleAriaId: this._subTextId,
                        isBlocking: false,
                        styles: { main: { maxWidth: 450} },
                        dragOptions: this._dragOptions,
                    }}
                >
                    {content}
                    <DialogFooter>
                        <PrimaryButton onClick={this._closeDialog} text="Ok" />
                        {this.useDefaultButton ? <DefaultButton onClick={this._closeDialog} text="Cancel" /> : null}
                    </DialogFooter>
                </Dialog>
            </div>
        );
    }

    private _showDialog = (): void => {
        this.setState({ hideDialog: false });
    };

    private _closeDialog = (): void => {
        this.setState({ hideDialog: true });
        this.useDefaultButton = false;
    };

    private setInitialDialogContent = () => {
        return <Text content="There should be some text here" size='medium'/>;
    };

    // set of statics to enable the calling of the dialog from elsewhere in the application
    static thisApp : App;
    public static showDialog = () : void => {
        !!App.thisApp ? App.thisApp._showDialog() : console.error("No App object found");
    };

    public static closeDialog = () : void => {
        !!App.thisApp ? App.thisApp._closeDialog() : console.error("No App object found");
    };

    public static useDefaultButton = () : void => {
        !!App.thisApp ? App.thisApp.useDefaultButton = true : console.error("No App object found");
    };

    public static setDialogTitle = (newTitle: string) : void => {
        !!App.thisApp ? App.thisApp.state.title = newTitle : console.error("No App object found");
    };

    public static setDialogSubText = (newSubText: string) : void => {
        !!App.thisApp ? App.thisApp.state.subText = newSubText : console.error("No App object found");
    };

    public static setDialogContent = (newContent: JSX.Element) : void => {
        !!App.thisApp ? App.thisApp.state.content = newContent : console.error("No App object found");
    };
}
