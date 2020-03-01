import { PiLanguage } from "../../../metalanguage/PiLanguage";
import { Names } from "../../Names";

export class TyperInterfaceTemplate {
    constructor() {
    }

    generateTyperInterface(language: PiLanguage) : string {
        const allConceptsName = Names.allConcepts(language);
        const typeName = "DemoType"; // TODO get the types from the .lang file

        return `
        import { ${allConceptsName} } from "./${allConceptsName}";
        import { ${typeName} } from "./${typeName}";
                        
        export interface I${language.name}Typer {
            inferType(modelelement: ${allConceptsName}) : ${typeName};
            conform(type1: ${typeName}, type2: ${typeName}) : boolean; // type 1 <= type 2 conformance direction
            conformList(typelist1: ${typeName}[], typelist2: ${typeName}[]) : boolean;             
            isType(elem : ${allConceptsName}) : boolean;
            typeName(elem : ${typeName}): string;           
        }
    `;
}
}

// import { ${allConceptsName} } from "./${allConceptsName}";
// import { ${typeName} } from "./${typeName}";

// export interface I${typeName}r {
//     inferType(modelelement: ${allConceptsName}) : ${typeName};

//     conform(type1: ${typeName}, type2: ${typeName}) : boolean; // type 1 <= type 2 conformance direction
//     conformList(typelist1: ${typeName}[], typelist2: ${typeName}[]) : boolean;  

//     isType(elem : ${allConceptsName}) : boolean;
//     typeName(elem : ${typeName}): string; 
// }