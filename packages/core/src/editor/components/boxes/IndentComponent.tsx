import { observer } from "mobx-react";
import * as React from "react";

import { PiLogger, RENDER_LOG } from "../../../util/PiLogging";
import { IndentBox } from "../../boxes/IndentBox";
import { PiEditor } from "../../PiEditor";
import { RenderBox } from "../Rendering";

const LOGGER = new PiLogger("IndentComponent").mute();

export type IndentComponentProps = {
    box: IndentBox;
    editor: PiEditor;
};

@observer
export class IndentComponent extends React.Component<IndentComponentProps, {}> {

    indentStyle: object;

    constructor(props: IndentComponentProps) {
        super(props);
    }

    render() {
        RENDER_LOG.info(this, "Indent");
        const box = this.props.box;
        this.indentStyle = {
            marginLeft: "" + (this.props.box.indent * 8) + "px"
        };


        return (
            <div
                id={this.props.box.id}
                style={this.indentStyle}
                tabIndex={0}
            >
                <RenderBox key={this.props.box.child.id} box={this.props.box.child} editor={this.props.editor} />
            </div>
        );
    }
}
