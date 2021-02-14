import { observer } from "mobx-react";
import * as React from "react";

import { boxAbove, boxBelow } from "../../util/ListBoxUtil";
import { ARROW_LEFT, ARROW_RIGHT, ARROW_UP, ARROW_DOWN, BACKSPACE, DELETE, TAB } from "../../util/Keys";
import { EVENT_LOG, PiLogger, RENDER_LOG } from "../../util/PiLogging";
import { STYLES } from "./styles/Styles";
import { PiEditor } from "../PiEditor";
import { RenderBox } from "./Rendering";

const LOGGER = new PiLogger("PiComponent");

export type PiComponentProps = {
    editor: PiEditor;
};

// Generic baseclass
@observer
export class PiComponent extends React.Component<PiComponentProps, {}> {
    private setElement = (element: HTMLDivElement | null) => {
        if (element) {
            this.props.editor.projectedElement = element;
        }
    };

    render() {
        RENDER_LOG.info(this, "");
        // NB Stop if there is no rootbox (yet)
        // Neede becaUSE SET ROOTBOX IS ASYNC.
        if (this.props.editor.rootBox === undefined) {
            return null;
        }
        return (
            <div className={STYLES.projectit} onKeyDown={this.onKeyDown} ref={this.setElement} tabIndex={0}>
                <RenderBox box={this.props.editor.rootBox} editor={this.props.editor} />
            </div>
        );
    }

    private onKeyDown = async (event: React.KeyboardEvent<HTMLDivElement>) => {
        EVENT_LOG.info(this, "onKeyDown: " + event.key);
        event.persist();
        if (event.ctrlKey) {
            switch (event.keyCode) {
                case ARROW_UP:
                    this.props.editor.selectParentBox();
                    this.eventHandled(event);
                    break;
                case ARROW_DOWN:
                    this.props.editor.selectFirstLeafChildBox();
                    this.eventHandled(event);
                    break;
            }
        } else if (event.shiftKey) {
            switch (event.keyCode) {
                case TAB:
                    await this.props.editor.selectPreviousLeaf();
                    this.eventHandled(event);
                    break;
            }
        } else if (event.altKey) {
            // All alt keys here
        } else {
            switch (event.keyCode) {
                case BACKSPACE:
                case ARROW_LEFT:
                    await this.props.editor.selectPreviousLeaf();
                    this.eventHandled(event);
                    break;
                case DELETE:
                    this.props.editor.deleteBox(this.props.editor.selectedBox);
                    break;
                case TAB:
                case ARROW_RIGHT:
                    this.props.editor.selectNextLeaf();
                    this.eventHandled(event);
                    break;
                case ARROW_DOWN:
                    LOGGER.info(this, "Down: " + this.props.editor.selectedBox.role);
                    const down = boxBelow(this.props.editor.selectedBox);
                    if (down !== null) {
                        this.props.editor.selectBox(down);
                    }
                    break;
                case ARROW_UP:
                    LOGGER.info(this, "Up: " + this.props.editor.selectedBox.role);
                    const up = boxAbove(this.props.editor.selectedBox);
                    if (up !== null) {
                        this.props.editor.selectBox(up);
                    }
                    break;
            }
        }
    };

    private eventHandled(e: React.KeyboardEvent<any>) {
        e.preventDefault();
        e.stopPropagation();
    }
}
