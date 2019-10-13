import {
    PiConcept, PiEnumeration, PiEnumerationLiteral,
    PiLanguage,
    PiLanguageElementProperty,
    PiLanguageProperty
} from "./PiLanguage";
import { observable } from "mobx";
import { MobxModelElementImpl, model, observablelistpart, observablepart, observablereference } from "@projectit/model";

@model
export class PiLanguageImpl implements PiLanguage {

    @observable name: string = "";
    @observablelistpart concepts: PiConceptImpl[];
    @observablelistpart enumerations: PiEnumerationImpl[];

    static create(n: string): PiLanguageImpl {
        const result = new PiLanguageImpl();
        result.name = n;
        return result;
    }
}

@model
export class PiConceptImpl implements PiConcept {
    $type = "MetaConcept";

    @observable name: string = "";
    @observablelistpart properties: PiLanguagePropertyImpl[];
    @observablelistpart parts: PiLanguageElementPropertyImpl[];
    @observablelistpart references: PiLanguageElementPropertyImpl[];

    base: string;
    resolvedBase: PiConceptImpl;

    static create(n: string): PiConceptImpl {
        const result = new PiConceptImpl();
        result.name = n;
        return result;
    }
}

@model
export class PiLanguagePropertyImpl implements PiLanguageProperty {
    @observable name: string = "";
    @observable type: string;
    @observable isList: boolean = false;

    resolvedType: MetaPrimitiveType = new MetaPrimitiveType();
}

@model
export class PiLanguageElementPropertyImpl implements PiLanguageElementProperty {
    @observable name: string = "";
    @observable type: string;
    @observable isList: boolean = false;

    resolvedType: MetaElementType;
}

@model
export abstract class MetaDataType {
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
    @observable isReference: boolean = false;
    element: PiConcept;
}

@model
export class PiEnumerationImpl implements PiEnumeration {
    @observable name: string = "";

    @observablelistpart literals: PiEnumerationLiteralImpl[];
}

@model
export class PiEnumerationLiteralImpl implements PiEnumerationLiteral {
    @observable name: string = "";
}

export function isLanguage(b: Object): b is PiLanguage {
    return b instanceof PiLanguageImpl;
}

export function isMetaConcept(b: Object): b is PiConcept {
    return b instanceof PiConceptImpl;
}
