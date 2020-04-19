import axios from "axios";
import { observable } from "mobx";
import { observer } from "mobx-react";

import { projectitStyles } from "../styles/styles";
import { PiEditor } from "@projectit/core";
import { ModelSerializer, ModelInfo } from "@projectit/core";
import * as React from "react";

export type SaveProps = {
    editor: PiEditor;
};

/**
 * Component used for saving a model.
 */
@observer
export class SaveComponent extends React.Component<SaveProps, {}> {
    private serial: ModelSerializer = new ModelSerializer(ModelInfo.Constructors1);

    @observable modelName: string = "";

    render() {
        return (
            <div>
                <label>
                    Name:
                    <input type="text" value={this.modelName} onChange={this.onChange} />
                </label>
                <button className={projectitStyles.myButton} onClick={this.onClick}>
                    Save Model
                </button>
                <br />
            </div>
        );
    }

    onClick = async event => {
        if (this.modelName !== "" && this.modelName.match(/^[a-z,A-Z]+$/)) {
            const serial: any = new ModelSerializer(ModelInfo.Constructors1);
            const model = serial.toSerializableJSON(this.props.editor.context.rootElement);
            await putModel(this.modelName, model);
        }
    };

    onChange = event => {
        this.modelName = event.target.value;
    };
}

async function putModel(name: string, data: Object) {
    try {
        console.log("putModel");
        const res = await axios.put(`http://127.0.0.1:3001/putModel?name=${name}`, data);
    } catch (e) {
        console.log("Error " + e.toString());
    }
}

export function saveComponent(props: SaveProps): JSX.Element {
    return <SaveComponent editor={props.editor} />;
}
