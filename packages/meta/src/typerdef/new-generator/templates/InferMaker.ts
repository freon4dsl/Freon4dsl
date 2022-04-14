import {
    PitInferenceRule,
    PiTyperDef
} from "../../new-metalanguage";
import { Names } from "../../../utils";
import { PiClassifier } from "../../../languagedef/metalanguage";
import { NewTyperGenUtils } from "./NewTyperGenUtils";

export class InferMaker {
    extraMethods: string[] = [];
    typerdef: PiTyperDef = null;
    private toBeCopied: PiClassifier[] = [];

    public makeInferType(typerDef: PiTyperDef, allLangConcepts: string, rootType: string, varName: string, imports: PiClassifier[]): string {
        NewTyperGenUtils.types = typerDef.types;
        this.typerdef = typerDef;
        let result: string = "";
        // find all infertype rules
        const inferRules: PitInferenceRule[] = [];
        typerDef.classifierSpecs.forEach(spec => {
            inferRules.push(...(spec.rules.filter(r => r instanceof PitInferenceRule)))
        });
        // make an entry for all classifiers that have an infertype rule
        result = `${inferRules.map(conRule =>
            `if (${varName}.piLanguageConcept() === "${Names.classifier(conRule.owner.myClassifier)}") {
                result = ${NewTyperGenUtils.makeExpAsType(conRule.exp, varName, imports)};
             }`
        ).join(" else ")}`;
        // add an entry for all types that do not have an inferType rule
        if (result.length > 0) { // include an else only if we already have an if-statement
            result += " else ";
        }
        result += `if (this.mainTyper.isType(${varName})) {
                result = PiType.create({ internal: ${varName} });
            }`;
        return result;
    }

    // // for all elements in toBeCopied add a method to extraMethods
    // // first, make sure all parts can be copied as well
    // const extraToBeCopied: PiClassifier[] = [];
    // extraToBeCopied.push(...this.toBeCopied);
    // this.toBeCopied.forEach(cls =>{
    //     const subs: PiClassifier[] = LangUtil.findAllImplementorsAndSubs(cls).filter(c => c instanceof PiConcept && !c.isAbstract);
    //     subs.forEach(sub => {
    //         sub.allParts().forEach(prop => {
    //             ListUtil.addIfNotPresent(extraToBeCopied, prop.type);
    //         })
    //     })
    // });
    // // second, make the methods
    // extraToBeCopied.forEach(cls => {
    //     const typeName: string = Names.classifier(cls);
    //     const subs: PiClassifier[] = LangUtil.findAllImplementorsAndSubs(cls).filter(c => c instanceof PiConcept && !c.isAbstract);
    //
    //     let method: string = `private makeCopyOf${cls.name}(toBeCopied: ${typeName}): ${typeName} {
    //         let result: ${typeName} = toBeCopied;
    //         ${subs.map(s => `if (toBeCopied.piLanguageConcept() === "${Names.classifier(s)}") {
    //             result = ${Names.classifier(s)}.create({
    //                 ${s.allProperties().map(prop =>
    //             `${prop.name}:${TyperGenUtils.makeCopyEntry(prop, "toBeCopied", Names.classifier(s))}`).join(",\n")}
    //             });
    //         }`).join(" else ")}
    //         return result;
    //     }`;
    //
    //     this.extraMethods.push(method);
    //     ListUtil.addIfNotPresent(imports, typeName);
    // });

}


