import { Names, LANGUAGE_GEN_FOLDER, PROJECTITCORE, TYPER_GEN_FOLDER } from "../../../utils";
import { PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";
import { PiScopeDef } from "../../metalanguage";
import { langExpToTypeScript, PiLangExp, PiLangFunctionCallExp } from "../../../languagedef/metalanguage";

export class ScoperTemplate {
    alternativeScopeImports: string = "";

    generateScoper(language: PiLanguageUnit, scopedef: PiScopeDef, relativePath: string): string {
        // console.log("Creating Scoper");
        const allLangConcepts : string = Names.allConcepts(language);   
        const langConceptType : string = Names.metaType(language);     
        const generatedClassName : string = Names.scoper(language);
        const namespaceClassName : string = Names.namespace(language);
        const scoperInterfaceName : string = Names.PiScoper;
        const typerClassName : string = Names.typer(language);

        let generateAlternativeScopes = false;
        let alternativeScopeStatement: string = "";

        if (!!scopedef) {
            alternativeScopeStatement = this.createAlternativeScopeStatement(scopedef, language);
            if (alternativeScopeStatement.length > 0) generateAlternativeScopes = true;
        }

        // Template starts here
        return `
        import { ${allLangConcepts}, ${langConceptType}${this.alternativeScopeImports} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";   
        import { ${namespaceClassName} } from "./${namespaceClassName}";
        import { ${scoperInterfaceName},  ${Names.PiNamedElement}, PiLogger } from "${PROJECTITCORE}"
        ${generateAlternativeScopes? `import { ${typerClassName} } from "${relativePath}${TYPER_GEN_FOLDER}";
                                      import { ${Names.environment(language)} } from "${relativePath}${ENVIRONMENT_GEN_FOLDER}/${Names.environment(language)}";`:`` }
        
        const LOGGER = new PiLogger("${generatedClassName}");   

        export class ${generatedClassName} implements ${scoperInterfaceName} {
            ${generateAlternativeScopes? `myTyper: ${typerClassName};` : ``}
    
            getVisibleElements(modelelement: ${allLangConcepts}, metatype?: ${langConceptType}, excludeSurrounding? : boolean): PiNamedElement[] {
                ${generateAlternativeScopes? `this.myTyper = ${Names.environment(language)}.getInstance().typer as ${typerClassName};` : ``}
                let result : PiNamedElement[] = [];
                if (!!modelelement) {
                ${generateAlternativeScopes? 
                    `${alternativeScopeStatement}` :
                    `let ns = new ${namespaceClassName}(modelelement);
                     result = ns.getVisibleElements(metatype, excludeSurrounding); // true means that we are excluding names from parent namespaces
                    `}
                    return result;
                } else {
                    LOGGER.error(this, "getVisibleElements: modelelement is null");
                    return result;
                }
            }
            
            getFromVisibleElements(modelelement: ${allLangConcepts}, name : string, metatype?: ${langConceptType}, excludeSurrounding? : boolean) : PiNamedElement {
                let vis = this.getVisibleElements(modelelement, metatype, excludeSurrounding);
                if (vis !== null) {
                    for (let e of vis) {
                        let n: string = e.name;
                        if (name === n) {
                            return e;
                        }  
                    }
                }    
                return null;
            }
            
            getVisibleNames(modelelement: ${allLangConcepts}, metatype?: ${langConceptType}, excludeSurrounding? : boolean) : string[] {
                let result: string[] = [];
                let vis = this.getVisibleElements(modelelement, metatype, excludeSurrounding);
                for (let e of vis) {
                    let n: string = e.name;
                    result.push(n);                    
                }
                return result;
            }
            
            isInScope(modelElement: ${allLangConcepts}, name: string, metatype?: ${langConceptType}, excludeSurrounding? : boolean) : boolean {
                if (this.getFromVisibleElements(modelElement, name, metatype, excludeSurrounding) !== null) {
                    return true;
                } else {
                    return false;
                }
            }
        }`;
    }

    private createAlternativeScopeStatement(scopedef: PiScopeDef, language: PiLanguageUnit) : string {
        let result: string = "";
        let allLangConcepts: string = Names.allConcepts(language);
        let namespaceClassName: string = Names.namespace(language);
        let mustAddElse: boolean = false;
        for (let def of scopedef.scopeConceptDefs) {
            if (!!def.alternativeScope) {
                this.alternativeScopeImports = ", " + def.conceptRef.referred.name;
                result = result.concat(
                    `${mustAddElse? ` else ` : ``} if (modelelement instanceof ${def.conceptRef.name}) {
                            // use alternative scope '${def.alternativeScope.expression.toPiString()}'
                            let newScopeElement = ${this.altScopeExpToTypeScript(def.alternativeScope.expression, allLangConcepts)};
                            let ns = new ${namespaceClassName}(newScopeElement);
                            result = ns.getVisibleElements(metatype, true); // true means that we are excluding names from parent namespaces
                    }`);
                mustAddElse = true;
            }
        }
        if (mustAddElse) {
            result = result.concat(
                ` else {
                   let ns = new ${namespaceClassName}(modelelement);
                   result = ns.getVisibleElements(metatype, excludeSurrounding); // true means that we are excluding names from parent namespaces 
                }`);
        }
        return result;
    }

    generateIndex(language: PiLanguageUnit): string {
        return `
        export * from "./${Names.scoper(language)}";
        export * from "./${Names.namespace(language)}";
        `;
    }

    private altScopeExpToTypeScript(expression: PiLangExp, allLangConcepts: string): string {
        let result = ``;
        if (expression instanceof  PiLangFunctionCallExp && expression.sourceName === "typeof") {
            let actualParamToGenerate: string = ``;
            if( expression.actualparams[0].sourceName === "container" ) { // we know that typeof has exactly 1 actual parameter
                actualParamToGenerate = `modelelement.piContainer().container as ${allLangConcepts}`;
            } else {
                actualParamToGenerate = langExpToTypeScript(expression.actualparams[0]);
            }
            result = `this.myTyper.inferType(${actualParamToGenerate})`;
        } else {
            result = langExpToTypeScript(expression);
        }
        return result;
    }
}
