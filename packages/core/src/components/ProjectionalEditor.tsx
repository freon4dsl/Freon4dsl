import { observer } from "mobx-react";
import { ToolbarComponent } from "./ToolbarComponent";
import * as React from "react";

import { EVENT_LOG } from "../util/PiLogging";
import { STYLES } from "./styles/Styles";
import { PiEditor } from "../editor/PiEditor";
import { PiComponent } from "./PiComponent";

export type ProjectionalEditorProps = {
    editor: PiEditor;
};

@observer
export class ProjectionalEditor extends React.Component<ProjectionalEditorProps, {}> {
    private inFocus = false;

    constructor(props: ProjectionalEditorProps) {
        super(props);
    }

    render() {
        // RENDER_LOG.info(this, "root recalculating");
        // const root = this.props.editor.projection.getBox(this.props.editor.context.rootElement);
        // RENDER_LOG.info(this, "root recalculated");
        // this.props.editor.rootBox = root;
        return (
            <div>
                {this.props.editor.actions &&
                    this.props.editor.actions.toolbarActions &&
                    this.props.editor.actions.toolbarActions.length > 0 && (
                        <ToolbarComponent editor={this.props.editor} />
                    )}
                <div className={STYLES.projectionalEditor} onBlur={this.onBlur} onFocus={this.onFocus}>
                    <PiComponent editor={this.props.editor} />
                </div>
            </div>
        );
    }

    private role(): string {
        return !!this.props.editor.selectedBox ? this.props.editor.selectedBox.role : "no-box";
    }

    private onFocus = () => {
        EVENT_LOG.info(this, "onFocus");
        this.inFocus = true;
    };

    private onBlur = () => {
        EVENT_LOG.info(this, "onBlur");
        // await this.focuslost();
        // setTimeout(() => {
        //     if (!this.inFocus) {
        //         this.props.editor.selectedBox = null;
        //     }
        // }, 100);
        this.inFocus = false;
    };

    focuslost() {
        if (!this.inFocus) {
            this.props.editor.selectedBox = null;
        }
        this.inFocus = false;
    }
}
