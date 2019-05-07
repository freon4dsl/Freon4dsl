import { observable } from "mobx";
import { observer } from "mobx-react";
import { PiToolbarItem } from "../";
import * as React from "react";

import { PiEditor } from "../editor/PiEditor";
import { ToolbarItemComponent } from "./ToolbarItemComponent";
import { STYLES } from "./styles/Styles";

export type ToolbarProps = {
    editor: PiEditor;
};

@observer
export class ToolbarComponent extends React.Component<ToolbarProps, {}> {

    @observable component: JSX.Element = null;

    render() {
        return (
            <div>
                <div className={STYLES.toolbar}>
                    {this.props.editor.actions.toolbarActions.map(item => {
                        return (
                            <ToolbarItemComponent
                                key={item.id}
                                editor={this.props.editor}
                                toolbarItem={item}
                                onComponent={this.onComponent}
                            />
                        );
                    })}
                </div>
                <div>
                    {(!!(this.component)) ? this.component : null}
                </div>
            </div>
        );
    }

    onComponent = async (toolbarItem: PiToolbarItem) => {
        if (this.component === null) {
            this.component = await toolbarItem.component(this.props.editor);
        } else {
            this.component = null;
        }
    };
}
