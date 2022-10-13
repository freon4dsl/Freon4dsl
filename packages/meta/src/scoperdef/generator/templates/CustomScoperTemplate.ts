import { PiLanguage } from "../../../languagedef/metalanguage";
import { Names, PROJECTITCORE, TYPER_GEN_FOLDER } from "../../../utils";

export class CustomScoperTemplate {
    generateCustomScoperPart(language: PiLanguage, relativePath: string): string {
        const scoperInterfaceName: string = Names.FrScoperPart;
        const generatedClassName: string = Names.customScoper(language);

        // TODO add comments to generated class
        // Template starts here
        return `
        import { PiElement, PiNamedElement, ${Names.FrScoperPart}, ${Names.FrScoperComposite}  } from "${PROJECTITCORE}";
        
        /**
         * Class '${generatedClassName}' is meant to be a convient place to add any
         * custom code for scoping.
         */
        export class ${generatedClassName} implements ${scoperInterfaceName} {
            mainScoper: ${Names.FrScoperComposite};
            
            resolvePathName(modelelement: PiElement, doNotSearch: string, pathname: string[], metatype?: string): PiNamedElement {
                return undefined;
            }
        
            isInScope(modelElement: PiElement, name: string, metatype?: string, excludeSurrounding?: boolean): boolean {
                return undefined;
            }
        
            getVisibleElements(modelelement: PiElement, metatype?: string, excludeSurrounding?: boolean): PiNamedElement[] {
                return undefined;
            }
        
            getFromVisibleElements(modelelement: PiElement, name: string, metatype?: string, excludeSurrounding?: boolean): PiNamedElement {
                return undefined;
            }
        
            getVisibleNames(modelelement: PiElement, metatype?: string, excludeSurrounding?: boolean): string[] {
                return undefined;
            }
        
            additionalNamespaces(element: PiElement): PiElement[] {
                return undefined;
            }
        }`;
    }
}
