import { action, observable } from "mobx";
import { PiBinaryExpression, PiContext, PiExpression } from "@projectit/core";
import { MetaConcept, MetaModel, MetaModelElement } from "../language/MetaModel";

export class MetaContext implements PiContext {
    @observable private _rootElement: MetaModelElement;

    model: MetaModel = MetaModel.create("Meta model test");

    constructor(initialExpression?: MetaModelElement) {
        this.model.elements.push(new MetaConcept());
        this.rootElement = this.model;
    }

    set rootElement(exp: MetaModelElement) {
        this._rootElement = exp;
        this._rootElement.container = null;
        exp.container = this;
        exp.propertyIndex = undefined;
        exp.propertyName = "rootElement";
    }

    get rootElement(): MetaModelElement {
        return this._rootElement;
    }

    toString(): string {
        return "MetaContext";
    }

    getPlaceHolderExpression(): PiExpression {
        return null;
    }

}
