import { observer } from "mobx-react";
import * as React from "react";

import { PiEditor } from "@projectit/core";

import { STYLES } from "./ToolbarStyles";
import { MyToolbarItem } from "./MyToolbarItem";

export type MyToolbarItemProps = {
    editor: PiEditor;
    toolbarItem: MyToolbarItem;
    onComponent: (toolbarItem: MyToolbarItem) => void;
};

@observer
export class MyToolbarItemComponent extends React.Component<MyToolbarItemProps, {}> {
    render() {
        let innerElement = this.props.toolbarItem.label;
        return (
            <button className={STYLES.toolbarItem} onClick={this.onClick}>
                {innerElement}
            </button>
        );
    }

    private onClick = () => {
        if (!!this.props.toolbarItem.component) {
            this.props.onComponent(this.props.toolbarItem);
        } else if (!!this.props.toolbarItem.onClick) {
            this.props.toolbarItem.onClick(this.props.editor);
        }
    };
}
