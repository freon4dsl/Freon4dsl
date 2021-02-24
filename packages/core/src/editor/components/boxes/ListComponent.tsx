import * as classNames from "classnames";
import { observer } from "mobx-react";
import * as React from "react";

import { ListBox, HorizontalListBox } from "../../boxes/ListBox";
import { EVENT_LOG, RENDER_LOG } from "../../../util/PiLogging";
import { PiEditor } from "../../PiEditor";
import { RenderBox } from "../Rendering";
import { STYLES } from "../styles/Styles";

export type ListComponentProps = {
    box: ListBox;
    editor: PiEditor;
};

@observer
export class ListComponent extends React.Component<ListComponentProps, {}> {
    private element: HTMLDivElement | null = null;
    private setElement = (element: HTMLDivElement | null) => {
        this.element = element;
    };

    componentDidMount() {
        RENDER_LOG.info(this, "componentDidMount");
        this.props.box.setFocus = this.setFocus;
    }

    setFocus = () => {
        EVENT_LOG.info(this, "FOCUS");
        if (this.element) {
            this.element.focus();
        }
    };

    render() {
        RENDER_LOG.info(this, "");
        const children = this.props.box.children;
        const styleClasses = classNames(this.props.box.kind === "HorizontalListBox" ? STYLES.horizontalList : STYLES.verticalList, this.props.box.style);
        const gridStyle =
            this.props.box.kind === "HorizontalListBox"
                ? {
                      gridTemplateColumns: "repeat(" + children.length + ", auto)"
                  }
                : {
                      gridTemplateRows: "repeat(" + children.length + ", auto)"
                  };
        if (this.props.box.kind === "HorizontalListBox") {
            return (
                <div id={this.props.box.id} className={styleClasses} onClick={this.oops} ref={this.setElement} tabIndex={0}>
                    {children.map((ch, index) => (
                        <RenderBox key={ch.id + index} box={ch} editor={this.props.editor} />
                    ))}
                </div>
            );
        } else {
            return (
                <div id={this.props.box.id} className={styleClasses} onClick={this.oops} style={gridStyle} ref={this.setElement} tabIndex={0}>
                    {children.map((ch, index) => (
                        <RenderBox key={ch.id + index} box={ch} editor={this.props.editor} />
                    ))}
                </div>
            );
        }
    }

    oops = () => {
        EVENT_LOG.info(this, "click-grid-cell");
    };
}
