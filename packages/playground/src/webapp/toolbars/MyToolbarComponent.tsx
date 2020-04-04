import { observable } from "mobx";
import { observer } from "mobx-react";
import * as React from "react";

import { PiEditor } from "@projectit/core";

import { STYLES } from "./ToolbarStyles";
import { MyToolbarItem } from "./MyToolbarItem";
import { ToolBarDefinition } from "./ToolBarDefinition";
import { MyToolbarItemComponent } from "./MyToolbarItemComponent";

export type ToolbarProps = {
    toolbar: ToolBarDefinition;
    editor: PiEditor;
};

@observer
export class MyToolbarComponent extends React.Component<ToolbarProps, {}> {
    @observable component: JSX.Element = null;

    render() {
        return (
            <div>
                <div className={STYLES.toolbar}>
                    {this.props.toolbar.mytoolbarItems.map(item => {
                        return (
                            <MyToolbarItemComponent
                                key={item.id}
                                editor={this.props.editor}
                                toolbarItem={item}
                                onComponent={this.onComponent}
                            />
                        );
                    })}
                </div>
                <div>{!!this.component ? this.component : null}</div>
            </div>
        );
    }

    onComponent = async (toolbarItem: MyToolbarItem) => {
        if (this.component === null) {
            this.component = await toolbarItem.component(this.props.editor);
        } else {
            this.component = null;
        }
    };
}
