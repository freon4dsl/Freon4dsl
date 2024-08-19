import { AbstractExternalBox } from "./AbstractExternalBox";
import { FreNode } from "../../../ast";
import { FreLanguage } from "../../../language";
import { Box } from "../Box";

export abstract class AbstractPropertyWrapperBox extends AbstractExternalBox {
    // the following two are inherit from Box
    // propertyName: string;       // the name of the property, if any, in 'element' which this box projects
    // propertyIndex: number;      // the index within the property, if appropriate
    propertyClassifierName: string = "unknown-type"; // the name of the type of the elements in the list
    private _childBox: Box; // todo mix this with .children from Box

    constructor(externalComponentName: string, node: FreNode, role: string, propertyName: string, childBox: Box) {
        super(externalComponentName, node, role);
        this.propertyName = propertyName;
        this._childBox = childBox;
        this.propertyClassifierName = FreLanguage.getInstance().classifierProperty(
            node.freLanguageConcept(),
            propertyName,
        )?.type;
    }

    getPropertyName(): string {
        return this.propertyName;
    }

    get childBox(): Box {
        return this._childBox;
    }

    get children(): ReadonlyArray<Box> {
        return [this._childBox] as ReadonlyArray<Box>;
    }
}
