import { Names } from "./Names";
import { PiLangEnumeration, PiLanguage } from "../PiLanguage";

export class ContextTemplate {
    constructor() {
    }

    generateContext(language: PiLanguage): string {
        return `
            import { action, observable } from "mobx";
            import { PiContext, PiExpression } from "@projectit/core";
            import { ${language.rootConcept().name} } from "../language/${Names.concept(language.rootConcept())}";
            
            export class ${language.name}Context implements PiContext {
                @observable private _rootElement: ${language.rootConcept().name};
            
                model: ${language.rootConcept().name} = new ${language.rootConcept().name}();
            
                constructor(initialExpression?: ${language.rootConcept().name}) {
                    this.initialize();
                    this.rootElement = initialExpression ? initialExpression : this.model;
                }
            
                set rootElement(exp: ${language.rootConcept().name}) {
                    this._rootElement = exp;
                    this._rootElement.container = null;
                    exp.container = this;
                    exp.propertyIndex = undefined;
                    exp.propertyName = "rootElement";
                }
            
                get rootElement(): ${language.rootConcept().name} {
                    return this._rootElement;
                }
            
                toString(): string {
                    return "${language.name}Context";
                }
            
                getPlaceHolderExpression(): PiExpression {
                    return null;  // new DemoPlaceholderExpression();
                }
            
                @action
                private initialize() {
                }
            }
        
        `;
    }
}
