import { ModelSerializer, ModelInfo } from "@projectit/core";
import { STYLES } from "../toolbars/ToolbarStyles";
import axios from "axios";
import { observable } from "mobx";
import { observer } from "mobx-react";

import { PiEditor, PiElement } from "@projectit/core";
import * as React from "react";

export type LoadProps = {
    editor: PiEditor;
    models: string[];
};

@observer
export class LoadComponent extends React.Component<LoadProps, {}> {
    private serial: ModelSerializer = new ModelSerializer(ModelInfo.Constructors1);

    @observable selectedModel: string = "";

    render() {
        return (
            <div>
                <select size={this.props.models.length} onChange={this.onChange}>
                    {this.props.models.map(model => (
                        <option key={model} value={model}>
                            {model}
                        </option>
                    ))}
                </select>
                <br />
                <button className={STYLES.toolbarItem} onClick={this.onClick}>
                    Open Model
                </button>
                <br />
            </div>
        );
    }

    onClick = async event => {
        if (this.selectedModel !== "") {
            const modelJSON = await getModel(this.selectedModel);
            const model = this.serial.toTypeScriptInstance(modelJSON);
            this.props.editor.context.rootElement = model as PiElement;
        }
    };

    onChange = event => {
        this.selectedModel = event.target.value;
    };
}

async function getModel(name: string): Promise<Object> {
    console.log("getModel");
    try {
        const res = await axios.get(`http://127.0.0.1:3001/getModel?name=${name}`);
        return res.data;
    } catch (e) {
        console.log("Error " + e.toString());
    }
    return {};
}

async function getModelList(): Promise<Object> {
    console.log("getModelList");
    try {
        const res = await axios.get(`http://127.0.0.1:3001/getModelList`);
        return res;
    } catch (e) {
        console.log("Error " + e.toString());
    }
    return {};
}

export function loadComponent(props: LoadProps): JSX.Element {
    return <LoadComponent editor={props.editor} models={props.models} />;
}
