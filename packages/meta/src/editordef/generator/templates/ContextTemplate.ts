import { Names } from "../../../utils/Names";
import { PiLangConcept, PiLanguage } from "../../../languagedef/metalanguage/PiLanguage";

export class ContextTemplate {
    constructor() {
    }

    generateContext(language: PiLanguage): string {
        const rootConcept: PiLangConcept = language.rootConcept();
        const placeholderConcept: PiLangConcept = language.expressionPlaceholder();
        return `
            import { action, observable } from "mobx";
            import { PiContext, PiExpression } from "@projectit/core";
            import { ${language.name}Initialization } from "../${language.name}Initialization";
            import { ${Names.concept(rootConcept)} } from "../../language/${Names.concept(rootConcept)}";
            import { ${Names.concept(placeholderConcept)} } from "../../language/${Names.concept(placeholderConcept)}";
            
            export class ${Names.context(language)} implements PiContext {
                @observable private _rootElement: ${Names.concept(language.rootConcept())};
            
                model: ${Names.concept(rootConcept)} = new ${Names.concept(rootConcept)}();
            
                constructor(initialExpression?: ${Names.concept(rootConcept)}) {
                    this.rootElement = initialExpression ? initialExpression : this.model;
                    this.initialize();
                }
            
                set rootElement(exp: ${Names.concept(rootConcept)}) {
                    this._rootElement = exp;
                    this._rootElement.container = null;
                    exp.container = this;
                    exp.propertyIndex = undefined;
                    exp.propertyName = "rootElement";
                }
            
                get rootElement(): ${Names.concept(rootConcept)} {
                    return this._rootElement;
                }
            
                toString(): string {
                    return "${Names.context(language)}";
                }
            
                getPlaceHolderExpression(): PiExpression {
                    return new ${Names.concept(placeholderConcept)}; 
                }
            
                @action
                private initialize() {
                    this.rootElement = new ${language.name}Initialization().initialize();
                }
            }
        
        `;
    }
}
