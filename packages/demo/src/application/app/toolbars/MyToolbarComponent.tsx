import { MyToolbarItem } from "./MyToolbarItem";
import { PiEditorWithToolbar } from "./EditorWithToolbar";
import { observable } from "mobx";
import { observer } from "mobx-react";
import * as React from "react";

import { STYLES} from "@projectit/core";
import { MyToolbarItemComponent } from "./MyToolbarItemComponent";

export type ToolbarProps = {
    editor: PiEditorWithToolbar;
};

@observer
export class MyToolbarComponent extends React.Component<ToolbarProps, {}> {
    @observable component: JSX.Element = null;

    render() {
        return (
            <div>
                <div className={STYLES.toolbar}>
                    {this.props.editor.mytoolbarItems.map(item => {
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
