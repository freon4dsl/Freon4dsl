import {
    PitInferenceRule,
    PiTyperDef
} from "../../new-metalanguage";
import { Names } from "../../../utils";
import { PiClassifier, PiLimitedConcept } from "../../../languagedef/metalanguage";
import { NewTyperGenUtils } from "./NewTyperGenUtils";

export class InferMaker {
    extraMethods: string[] = [];
    typerdef: PiTyperDef = null;
    private toBeCopied: PiClassifier[] = [];

    public makeInferType(typerDef: PiTyperDef, allLangConcepts: string, rootType: string, varName: string, imports: PiClassifier[]): string {
        NewTyperGenUtils.types = typerDef.types;
        this.typerdef = typerDef;
        let result: string[] = [];
        // find all infertype rules
        const inferRules: PitInferenceRule[] = [];
        typerDef.classifierSpecs.forEach(spec => {
            inferRules.push(...(spec.rules.filter(r => r instanceof PitInferenceRule)))
        });
        // make an entry for all classifiers that have an infertype rule
        inferRules.forEach(conRule =>
            result.push(`if (${varName}.piLanguageConcept() === "${Names.classifier(conRule.owner.myClassifier)}") {
                result = ${NewTyperGenUtils.makeExpAsType(conRule.exp, varName, imports)};
             }`)
        );
        // add an entry for all limited concepts
        const allLimited = typerDef.language.concepts.filter(con => con instanceof PiLimitedConcept) as PiLimitedConcept[];
        allLimited.map(lim =>
            result.push(`if (${varName}.piLanguageConcept() === "${Names.classifier(lim)}") {
                result = PiType.create({ internal: modelelement });
             }`)
        );
        // add an entry for classifiers that do not have an inferType rule
        result.push(`if (this.mainTyper.isType(${varName})) {
                result = PiType.create({ internal: ${varName} });
            }`);
        return result.map(r => r).join(" else ");
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


