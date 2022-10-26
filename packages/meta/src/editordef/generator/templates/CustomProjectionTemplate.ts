import { Names, PROJECTITCORE } from "../../../utils";
import { PiLanguage } from "../../../languagedef/metalanguage";

export class CustomProjectionTemplate {

    generate(language: PiLanguage): string {
        // todo adjust comment
        return `
            import { ${Names.PiElement}, ${Names.Box}, ${Names.PiProjection} } from "${PROJECTITCORE}";
            
             /**
             * Class ${Names.customProjection(language)} provides an entry point for the language engineer to
             * define custom build additions to the editor.
             * These are merged with the custom build additions and other definition-based editor parts
             * in a three-way manner. For each modelelement,
             * (1) if a custom build creator/behavior is present, this is used,
             * (2) if a creator/behavior based on one of the editor definition is present, this is used,
             * (3) if neither (1) nor (2) yields a result, the default is used.
             */           
            export class ${Names.customProjection(language)} implements ${Names.PiProjection} {
                name: string = "manual";
                nodeTypeToBoxMethod: Map<string, (node: PiElement) => Box>= new Map<string, (node: PiElement) => Box>([
                    // ['NAME_OF_CONCEPT', this.FUNCTION_FOR_CONCEPT],            
                ]);  
                
                // FUNCTION_FOR_CONCEPT(node: NAME_OF_CONCEPT) : Box { ... }   
            }
        `;
    }

}
