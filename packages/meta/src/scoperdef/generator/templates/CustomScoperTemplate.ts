import { FreLanguage } from "../../../languagedef/metalanguage";
import { Names, PROJECTITCORE, TYPER_GEN_FOLDER } from "../../../utils";

export class CustomScoperTemplate {
    generateCustomScoperPart(language: FreLanguage, relativePath: string): string {
        const scoperInterfaceName: string = Names.FrScoperPart;
        const generatedClassName: string = Names.customScoper(language);

        // TODO add comments to generated class
        // Template starts here
        return `
        import { ${Names.PiElement}, ${Names.PiNamedElement}, ${Names.FrScoperPart}, ${Names.FreScoperComposite}  } from "${PROJECTITCORE}";
        
        /**
         * Class '${generatedClassName}' is meant to be a convient place to add any
         * custom code for scoping.
         */
        export class ${generatedClassName} implements ${scoperInterfaceName} {
            mainScoper: ${Names.FreScoperComposite};
            
            resolvePathName(modelelement: ${Names.PiElement}, doNotSearch: string, pathname: string[], metatype?: string): ${Names.PiNamedElement} {
                return undefined;
            }
        
            isInScope(modelElement: ${Names.PiElement}, name: string, metatype?: string, excludeSurrounding?: boolean): boolean {
                return undefined;
            }
        
            getVisibleElements(modelelement: ${Names.PiElement}, metatype?: string, excludeSurrounding?: boolean): ${Names.PiNamedElement}[] {
                return undefined;
            }
        
            getFromVisibleElements(modelelement: ${Names.PiElement}, name: string, metatype?: string, excludeSurrounding?: boolean): ${Names.PiNamedElement} {
                return undefined;
            }
        
            getVisibleNames(modelelement: ${Names.PiElement}, metatype?: string, excludeSurrounding?: boolean): string[] {
                return undefined;
            }
        
            additionalNamespaces(element: ${Names.PiElement}): ${Names.PiElement}[] {
                return undefined;
            }
        }`;
    }
}
