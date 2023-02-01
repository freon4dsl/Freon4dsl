import { Names, PROJECTITCORE } from "../../../utils";
import { PiLanguage } from "../../../languagedef/metalanguage";

export class CustomProjectionTemplate {

    generate(language: PiLanguage): string {
        return `
            import { ${Names.PiElement}, ${Names.Box}, ${Names.PiProjection}, PiTableDefinition } from "${PROJECTITCORE}";
            
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
                name: string = "Manual";
                nodeTypeToBoxMethod: Map<string, (node: ${Names.PiElement}) => ${Names.Box}> = 
                    new Map<string, (node: ${Names.PiElement}) => ${Names.Box}>([
                        // register your custom box methods here
                        // ['NAME_OF_CONCEPT', this.BOX_FOR_CONCEPT],            
                    ]);  
                nodeTypeToTableDefinition: Map<string, () => PiTableDefinition> =
                    new Map<string, () => PiTableDefinition>([
                        // register your custom table definition methods here                       
                        // ['NAME_OF_CONCEPT', this.TABLE_DEFINITION_FOR_CONCEPT],            
                    ]);                  
                
                // add your custom methods here
                
                // BOX_FOR_CONCEPT(node: NAME_OF_CONCEPT) : ${Names.Box} { ... }   
                
                // TABLE_DEFINITION_FOR_CONCEPT() : PiTableDefinition { ... }
            }
        `;
    }

}
