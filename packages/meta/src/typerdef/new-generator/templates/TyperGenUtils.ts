import { PiLanguage } from "../../../languagedef/metalanguage";
import { PiTypeDefinition } from "../../metalanguage";
import { Names } from "../../../utils";

export class TyperGenUtils {

    static getTypeRoot(language: PiLanguage, typerdef: PiTypeDefinition): string {
        const allLangConcepts: string = Names.allConcepts(language);
        let rootType: string = allLangConcepts;
        if (!!typerdef && !!typerdef.typeroot) {
            rootType = typerdef.typeroot.name;
        }
        return rootType;
    }
}
