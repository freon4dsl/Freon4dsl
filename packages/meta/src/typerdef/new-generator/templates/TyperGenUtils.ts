import { PiClassifier, PiLanguage } from "../../../languagedef/metalanguage";
import { PiTypeDefinition } from "../../metalanguage";
import { Names } from "../../../utils";
import { PiTyperDef } from "../../new-metalanguage";

export class TyperGenUtils {

    static getTypeRoot(language: PiLanguage, typerdef: PiTyperDef) {
        let rootType: string = Names.allConcepts(language);
        if (!!typerdef && !!typerdef.typeRoot) {
            if (typerdef.typeRoot !== PiClassifier.ANY) {
                rootType = Names.classifier(typerdef.typeRoot);
            }
        }
        return rootType;
    }
}
