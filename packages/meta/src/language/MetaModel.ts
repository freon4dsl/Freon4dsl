import { observable } from "mobx";
import { PiElement } from "@projectit/core";
import * as uuid from "uuid";

import { MobxModelElementImpl, model, observablelistpart, observablepart, observablereference } from "@projectit/model";

export interface MetaNamed {
    name: string;
}

export abstract class MetaModelElement extends MobxModelElementImpl implements PiElement {
    $id: string;

    constructor(){
        super();
        this.$id = uuid.v4();
    }

    piId(): string {
        return this.$id;
    }

    piIsExpression(): boolean {
        return false;
    }

    piIsBinaryExpression(): boolean {
        return false;
    }
}

@model
export class MetaModel extends MetaModelElement implements MetaNamed {
    $type = "MetaModel";

    @observable name: string = "";
    @observablelistpart elements: MetaConcept[] ;
    @observablelistpart enumerations: MetaEnumeration[] ;

    static create(n: string): MetaModel {
        const result = new MetaModel();
        result.name = n;
        return result;
    }
}

@model
export class MetaConcept extends MetaModelElement implements MetaNamed {
    $type = "MetaConcept";

    @observable name: string = "";
    @observablelistpart properties: MetaPrimitiveProperty[];
    @observablelistpart parts: MetaElementProperty[];
    @observablelistpart references: MetaElementProperty[];

    @observablepart superConcept: MetaConcept;

    static create(n: string): MetaConcept {
        const result = new MetaConcept();
        result.name = n;
        return result;
    }
}

@model
export abstract class MetaProperty extends MetaModelElement implements MetaNamed {
    $type = "MetaProperty";

    @observable
    name: string = "";
}

@model
export class MetaPrimitiveProperty extends MetaProperty {
    $type = "MetaPrimitiveProperty";

    @observablepart type: MetaPrimitiveType = new MetaPrimitiveType();
}

@model
export class MetaElementProperty extends MetaProperty {
    $type = "MetaElementProperty";
    @observablepart type: MetaElementType;
}

@model
export abstract class MetaDataType extends MetaModelElement {
    @observable isList: boolean = false;
    @observable optional: boolean = false;
}

export type MetaPrimitive = "" | "string" | "boolean" | "number";

@model
export class MetaPrimitiveType extends MetaDataType {
    $type = "MetaPrimitiveType";

    @observable primitive: MetaPrimitive = "";
}

@model
export class MetaElementType extends MetaDataType {
    $type = "MetaElementType";

    @observable isReference: boolean = false;
    @observablereference element: MetaConcept;
}

@model
export class MetaEnumeration extends MetaModelElement implements MetaNamed {
    $type = "MetaEnumeration";

    @observable name: string = "";

    @observablelistpart literals: MetaEnumerationLiteral[]
}

@model
export class MetaEnumerationLiteral extends MetaModelElement implements MetaNamed {
    $type = "MetaEnumerationLiteral";

    @observable name: string = "";
}

export function isMetaModel(b: Object): b is MetaModel {
    return b instanceof MetaModel;
}

export function isMetaConcept(b: Object): b is MetaConcept {
    return b instanceof MetaConcept;
}

export class MetaUtils {
    static metaModel(item: MobxModelElementImpl): MetaModel {
        let result = item;
        while( (!!result) && !isMetaModel(result)) {
            result = result.container as MobxModelElementImpl;
        }
        return result as MetaModel;
    }
}
