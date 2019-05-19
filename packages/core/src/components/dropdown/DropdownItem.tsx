import * as classNames from "classnames";
import { observer } from "mobx-react";
import { SelectOption } from "../../boxes/SelectOption";
import { EVENT_LOG } from "../../util/PiLogging";
import * as React from "react";

const styles = require("../styles/DropdownComponent.scss");

export type DropdownItemProps = {
  onClick?: (option: SelectOption) => void;
  option: SelectOption;
  selected: boolean;
  classNames?: string[];
};

@observer
export class DropdownItem extends React.Component<DropdownItemProps, {}> {
  render() {
    let allClassNames: string = classNames({
      [styles.item]: true,
      [styles.currentlySelected]: this.props.selected
    });
    if (this.props.classNames && this.props.classNames.length !== 0) {
      allClassNames = classNames(allClassNames, this.props.classNames);
    }

    return (
      <div
        className={allClassNames}
        key="label"
        onMouseDown={this.onMouseDown}
        onClick={this.onClick}
        tabIndex={0}
      >
        {this.props.option.label}
      </div>
    );
  }

  private onClick = () => {
    EVENT_LOG.info(this, "onClick");
    if (this.props.onClick) {
      this.props.onClick(this.props.option);
    }
  };

  // NB: onnMouseDown is used instead of onClick to avpid a blur event happening firrst on the
  // container component, which then closes the dropdown and the onClick is then ignored.
  // See: https://stackoverflow.com/questions/10652852/jquery-fire-click-before-blur-event
  // Solution 2 implemeneted here.
  private onMouseDown = (e: React.MouseEvent<any>) => {
    EVENT_LOG.info(this, "onMouseDown ");
    e.preventDefault();
  };
}
