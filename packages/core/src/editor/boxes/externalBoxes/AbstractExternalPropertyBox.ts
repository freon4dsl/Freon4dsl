import { AbstractExternalBox } from "./AbstractExternalBox";
import { FreNode } from "../../../ast";
import { FreLanguage } from "../../../language";

export abstract class AbstractExternalPropertyBox extends AbstractExternalBox {
    // the following two are inherit from Box
    // propertyName: string;       // the name of the property, if any, in 'element' which this box projects
    // propertyIndex: number;      // the index within the property, if appropriate
    private propertyClassifierName: string = "unknown-type"; // the name of the type of the elements in the list

    constructor(
        externalComponentName: string,
        node: FreNode,
        role: string,
        propertyName: string,
        propertyIndex?: number,
    ) {
        super(externalComponentName, node, role);
        this.propertyName = propertyName;
        this.propertyIndex = propertyIndex;
        this.propertyClassifierName = FreLanguage.getInstance().classifierProperty(
            node.freLanguageConcept(),
            propertyName,
        )?.type;
    }

    getPropertyName(): string {
        return this.propertyName;
    }

    getPropertyType(): string {
        return this.propertyClassifierName;
    }
}
