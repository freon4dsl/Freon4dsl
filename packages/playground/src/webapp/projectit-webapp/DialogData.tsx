import { PiNamedElement } from "@projectit/core";

export default class DialogData {
    modelName: string = "";
    unitName: string = "";
    modelUnitType: string = "";
    selectedTreeItem: PiNamedElement = null;

    public setModelName = (element: any | null) => {
        if (!!element && !!element.value) {
            this.modelName = element?.value;
            // console.log("model name set to : " + this.modelName);
        }
    };

    // public setUnitName = (element: any | null) => {
    //     if (!!element && !!element.value) {
    //         this.unitName = element?.value;
    //         // console.log("Unit name set to : " + this.unitName);
    //     }
    // };

    public setUnitType = (e, props) => {
        if (!!props && !!props.value) {
            this.modelUnitType = props?.value;
            // console.log("Model unit type set to : " + this.modelUnitType);
        }
    };

    public setModelNameFromProps = (e, props) => {
        if (!!props && !!props.value) {
            this.modelName = props?.value;
            // console.log("Model name set to : " + this.modelName);
        }
    };

    public setUnitNameFromProps = (e, props) => {
        if (!!props && !!props.value) {
            this.unitName = props?.value;
            // console.log("Unit name set to : " + this.unitName);
        }
    };

    public stringToRadioGroupItems(labels: string[]) {
        let result = [];
        labels.forEach(label => {
            result.push({
                name: 'modelunitType',
                key: label,
                label: label,
                value: label,
            })
        });
        return result;
    }
}
