import * as classNames from "classnames";
import { observer } from "mobx-react";
import * as React from "react";

import { PiEditor } from "../../editor/PiEditor";
import { STYLES } from "../styles/Styles";

import { EVENT_LOG, PiLogger, RENDER_LOG } from "../../util/PiLogging";
import { LabelBox } from "../../boxes/LabelBox";

export type LabelComponentProps = {
  box: LabelBox;
  editor: PiEditor;
};

const LOGGER = new PiLogger("LabelComponent");

@observer
export class LabelComponent extends React.Component<LabelComponentProps, {}> {
  private element: HTMLDivElement | null = null;
  private setElement = (element: HTMLDivElement | null) => {
    this.element = element;
  };

  componentDidMount() {
    RENDER_LOG.info(this, "componentDidMount");
    this.props.box.setFocus = this.setFocus;
  }

  setFocus = () => {
    LOGGER.info(this, "set focus on " + this.element);
    if (this.element) {
      this.element.focus();
    }
  };

  render() {
    RENDER_LOG.info(this, "render");
    const styleClasses = classNames(STYLES.text, this.props.box.style);

    return (
      <div
        id={this.props.box.id}
        className={styleClasses}
        ref={this.setElement}
        tabIndex={0}
      >
        {this.props.box.getLabel()}
      </div>
    );
  }
}
