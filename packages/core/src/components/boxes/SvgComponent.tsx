import * as classNames from "classnames";
import { observer } from "mobx-react";
import * as React from "react";

import { STYLES } from "../styles/Styles";
import { PiEditor } from "../../editor/PiEditor";
import { SvgBox } from "../../boxes/SvgBox";

export type SvgComponentProps = {
    box: SvgBox;
    editor: PiEditor;
};

@observer
export class SvgComponent extends React.Component<SvgComponentProps, {}> {
    render() {
        const styleClasses = classNames(STYLES.text, this.props.box.style);

        // TODO 500, 500 in viewbox is dependent on the SVG image !!
        return (
            <svg
                id={this.props.box.id}
                width={this.props.box.width}
                height={this.props.box.height}
                viewBox={"0 0 500 500"}
            >
                {this.props.box.svg}
            </svg>
        );
    }
}

{
    /*<g transform="scale(0.1)">*/
}
{
    /*{this.props.box.svg}*/
}
{
    /*</g>*/
}
