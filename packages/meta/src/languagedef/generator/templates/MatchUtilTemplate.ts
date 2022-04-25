import { PiLanguage } from "../../metalanguage";
import { Names, LANGUAGE_GEN_FOLDER } from "../../../utils";

export class MatchUtilTemplate {

    generateMatchUtil(language: PiLanguage, relativePath: string): string {
        const generatedClassName: String = Names.matchUtil;

        // TODO JOS: do we need the <T extends PiNamedElement> here?
        // Template starts here
        return `
        import { PiNamedElement } from "@projectit/core";
        import { PiElementReference } from "${relativePath}${LANGUAGE_GEN_FOLDER }";      

        /**
         * Class MatchUtil implements the match functionality on a list of PiElementReferences.
         */
        export class ${generatedClassName}  {
        
            static matchReferenceList<T extends PiNamedElement>(list: PiElementReference<T>[], toBeMatched: Partial<PiElementReference<T>>[]): boolean {
                let foundMatch: boolean = true;
                for (const theirs of toBeMatched) {
                    let xx: boolean = false;
                    for (const mine of list) {
                        if (mine.match(theirs)) {
                            xx = true;
                            break;
                        }
                    }
                    foundMatch = foundMatch && xx;
                    if (!foundMatch) {
                        return false;
                    }
                }
                return foundMatch;
            }
        }`;
    }
}
