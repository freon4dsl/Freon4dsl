import { FreLanguage } from "../../../languagedef/metalanguage";
import { Names, PROJECTITCORE, TYPER_GEN_FOLDER } from "../../../utils";

export class CustomScoperTemplate {
    generateCustomScoperPart(language: FreLanguage, relativePath: string): string {
        const scoperInterfaceName: string = Names.FrScoperPart;
        const generatedClassName: string = Names.customScoper(language);

        // TODO add comments to generated class
        // Template starts here
        return `
        import { ${Names.FreNode}, ${Names.FreNamedNode}, ${Names.FrScoperPart}, ${Names.FreScoperComposite}  } from "${PROJECTITCORE}";
        
        /**
         * Class '${generatedClassName}' is meant to be a convient place to add any
         * custom code for scoping.
         */
        export class ${generatedClassName} implements ${scoperInterfaceName} {
            mainScoper: ${Names.FreScoperComposite};
            
            resolvePathName(modelelement: ${Names.FreNode}, doNotSearch: string, pathname: string[], metatype?: string): ${Names.FreNamedNode} {
                return undefined;
            }
        
            isInScope(modelElement: ${Names.FreNode}, name: string, metatype?: string, excludeSurrounding?: boolean): boolean {
                return undefined;
            }
        
            getVisibleElements(modelelement: ${Names.FreNode}, metatype?: string, excludeSurrounding?: boolean): ${Names.FreNamedNode}[] {
                return undefined;
            }
        
            getFromVisibleElements(modelelement: ${Names.FreNode}, name: string, metatype?: string, excludeSurrounding?: boolean): ${Names.FreNamedNode} {
                return undefined;
            }
        
            getVisibleNames(modelelement: ${Names.FreNode}, metatype?: string, excludeSurrounding?: boolean): string[] {
                return undefined;
            }
        
            additionalNamespaces(element: ${Names.FreNode}): ${Names.FreNode}[] {
                return undefined;
            }
        }`;
    }
}
