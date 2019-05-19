import { observer } from "mobx-react";
import * as React from "react";

import { PiUtils } from "../util/PiUtils";
import { reactToKey } from "../util/Keys";
import { isAliasBox } from "../boxes/AliasBox";
import { isSelectBox } from "../boxes/SelectBox";
import { isTextBox } from "../boxes/TextBox";
import { EVENT_LOG } from "../util/PiLogging";
import { STYLES } from "./styles/Styles";
import { Box } from "../boxes/Box";
import { PiEditor } from "../editor/PiEditor";
import { wait } from "../util/PiUtils";

export type SelectableComponentProps = {
    box: Box;
    editor: PiEditor;
};

/**
 * Wrapper for each component, to ansure each component is selectable.
 */
@observer
export class SelectableComponent extends React.Component<SelectableComponentProps, {}> {
    private element: HTMLDivElement;
    private setElement = (element: HTMLDivElement | null) => {
        if (element) {
            this.element = element;
        }
    };

    constructor(props: SelectableComponentProps) {
        super(props);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
    }

    async componentDidMount() {
        EVENT_LOG.info(this, "componentDidMount");
        await this.updateViewStateAfterRender();
    }

    async componentDidUpdate() {
        await this.updateViewStateAfterRender();
    }

    render() {
        const selectedBox = this.props.editor.selectedBox;
        let style: string;
        let isSelected = !!this.props.box && !!selectedBox ? this.props.box.id === selectedBox.id : false;
        if (isSelected) {
            if (isTextBox(selectedBox) || isAliasBox(selectedBox) || isSelectBox(selectedBox)) {
                style = STYLES.selectedTextComponent;
            } else {
                style = STYLES.selectedComponent;
            }
        } else {
            style = STYLES.unSelectedComponent;
        }
        // Ensure that am Alias- or TextComponent can call the uodate nmethod, because this selectable
        // component won;t be rendered.
        if (isTextBox(this.props.box) || isAliasBox(this.props.box) || isSelectBox(this.props.box)) {
            this.props.box.update = this.componentDidUpdate;
        }
        return (
            <div className={style} tabIndex={0} onClick={this.onClick} onKeyDown={this.onKeyDown} ref={this.setElement}>
                {this.props.children}
            </div>
        );
    }

    onKeyDown = (e: React.KeyboardEvent<any>) => {
        EVENT_LOG.info(this, "onKeyDown");
        if (PiUtils.handleKeyboardShortcut(reactToKey(e), this.props.box, this.props.editor)) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    private onClick = (event: React.MouseEvent<HTMLDivElement>) => {
        EVENT_LOG.info(
            this,
            "===> onClick (" +
                this.props.box.actualX +
                ", " +
                this.props.box.actualY +
                ") width " +
                this.props.box.actualWidth
        );
        if (this.props.box.selectable) {
            EVENT_LOG.info(this, "===> selected box " + this.props.box.role);
            this.props.editor.selectedBox = this.props.box;
            event.preventDefault();
            event.stopPropagation();
        }
    };

    /**
     * Update the actual coordinates of the component.
     * Used for (semi) graphic contents like lines.
     * @returns {Promise<void>}
     */
    private async updateViewStateAfterRender(): Promise<void> {
        await wait(0);
        if (this.element) {
            const box = this.props.box;
            const rect: ClientRect = this.element.getBoundingClientRect();

            box.actualX = rect.left;
            box.actualY = rect.top;
            box.actualHeight = rect.height;
            box.actualWidth = rect.width;
        }
    }
}
