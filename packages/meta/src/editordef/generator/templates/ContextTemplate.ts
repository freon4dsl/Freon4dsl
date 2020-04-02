import { Names, PathProvider, PROJECTITCORE, LANGUAGE_GEN_FOLDER } from "../../../utils";
import { PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";


export class ContextTemplate {
    constructor() {
    }

    generateContext(language: PiLanguageUnit, relativePath: string): string {
        const rootConceptName = Names.concept(language.rootConcept());
        const placeHolderConceptName = Names.concept(language.expressionPlaceholder());
        const initializationName = Names.initialization(language);

        return `
            import { action, observable } from "mobx";
            import { ${Names.PiContext}, ${Names.PiExpression} } from "${PROJECTITCORE}";
            import { ${initializationName} } from "../${initializationName}";
            import { ${rootConceptName}, ${placeHolderConceptName} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
            
            export class ${Names.context(language)} implements PiContext {
                @observable private _rootElement: ${rootConceptName};
            
                model: ${rootConceptName} = new ${rootConceptName}();
            
                constructor(initialExpression?: ${rootConceptName}) {
                    this.rootElement = initialExpression ? initialExpression : this.model;
                    this.initialize();
                }
            
                set rootElement(exp: ${rootConceptName}) {
                    this._rootElement = exp;
                    this._rootElement.container = null;
                    exp.container = this;
                    exp.propertyIndex = undefined;
                    exp.propertyName = "rootElement";
                    // not a PiElement , therefore no root.
                    exp.container = null;
                }
            
                get rootElement(): ${rootConceptName} {
                    return this._rootElement;
                }
            
                toString(): string {
                    return "${Names.context(language)}";
                }
            
                getPlaceHolderExpression(): PiExpression {
                    return new ${placeHolderConceptName}; 
                }
            
                @action
                private initialize() {
                    this.rootElement = new ${initializationName}().initialize();
                }
            }
        
        `;
    }
}
