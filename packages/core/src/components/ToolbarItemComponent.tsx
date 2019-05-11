import { observer } from "mobx-react";
import * as React from "react";

import { PiEditor } from "../editor/PiEditor";
import { PiToolbarItem } from "../editor/PiAction";
import { STYLES } from "./styles/Styles";

export type ToolbarItemProps = {
  editor: PiEditor;
  toolbarItem: PiToolbarItem;
  onComponent: (toolbarItem: PiToolbarItem) => void;
};

@observer
export class ToolbarItemComponent extends React.Component<
  ToolbarItemProps,
  {}
> {
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
