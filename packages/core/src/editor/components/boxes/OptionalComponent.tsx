import { observer } from "mobx-react";
import * as React from "react";

import { PiLogger, RENDER_LOG } from "../../../util/PiLogging";
import { OptionalBox } from "../../boxes/OptionalBox";
import { PiEditor } from "../../PiEditor";
import { RenderBox } from "../Rendering";
import { observable } from "mobx";

const LOGGER = new PiLogger("OptionalComponent").mute();

export type OptionalComponentProps = {
    box: OptionalBox;
    editor: PiEditor;
};

@observer
export class OptionalComponent extends React.Component<OptionalComponentProps, {}> {
    @observable mustShow: boolean = false;

    constructor(props: OptionalComponentProps) {
        super(props);
    }

    render() {
        RENDER_LOG.info(this, "Alternate");
        const box = this.props.box;

        if (box.mustShow || box.showByCondition) {
            return (
                <div id={this.props.box.id} tabIndex={0}>
                    <RenderBox key={box.box.id} box={box.box} editor={this.props.editor} />
                </div>
            );
        } else {
            return (
                <div id={this.props.box.id} tabIndex={0}>
                    <RenderBox key={box.whenNoShowingAlias.id} box={box.whenNoShowingAlias}
                               editor={this.props.editor} />
                </div>
            );
        }
    }
}
