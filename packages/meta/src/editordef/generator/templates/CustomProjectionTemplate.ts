import { Names, PROJECTITCORE } from "../../../utils";
import { PiLanguageUnit } from "../../../languagedef/metalanguage/PiLanguage";
import { DefEditorLanguage } from "../../metalanguage";

export class CustomProjectionTemplate {
    constructor() {
    }

    generate(language: PiLanguageUnit): string {
        return `
            import { ${Names.PiProjection}, ${Names.PiElement}, ${Names.Box} } from "${PROJECTITCORE}";
        
            export class ${Names.customProjection(language)} implements ${Names.PiProjection} {
                rootProjection: ${Names.PiProjection};
                name: string = "manual";
                
                constructor(name?: string) {
                    if (!!name) {
                        this.name = name;
                    }
                }
                
                getBox(element: ${Names.PiElement}) : Box {
                    // Add any handmade projections of your own before next statement 
                    return null;
                }            
            }
        `;
    }

}
