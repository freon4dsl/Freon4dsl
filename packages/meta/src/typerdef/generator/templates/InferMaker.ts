import {
    PitInferenceRule,
    PiTyperDef
} from "../../metalanguage";
import { Names } from "../../../utils";
import { PiClassifier, PiLimitedConcept } from "../../../languagedef/metalanguage";
import { TyperGenUtils } from "./TyperGenUtils";
import { PitEqualsRule } from "../../metalanguage/PitEqualsRule";

export class InferMaker {
    extraMethods: string[] = [];
    typerdef: PiTyperDef = null;
    private toBeCopied: PiClassifier[] = [];

    public makeInferType(typerDef: PiTyperDef, allLangConcepts: string, rootType: string, varName: string, imports: PiClassifier[]): string {
        TyperGenUtils.types = typerDef.types;
        this.typerdef = typerDef;
        let result: string[] = [];
        // find all infertype rules
        const inferRules: PitInferenceRule[] = [];
        typerDef.classifierSpecs.forEach(spec => {
            inferRules.push(...(spec.rules.filter(r => r instanceof PitInferenceRule)))
        });
        // sort the types such that any type comes before its super type
        const sortedTypes = TyperGenUtils.sortTypes(typerDef.conceptsWithType);
        // make an entry for all classifiers that have an infertype rule
        sortedTypes.forEach( type => {
            // find the equalsRule, if present
            const foundRule: PitEqualsRule = inferRules.find(conRule => conRule.owner.myClassifier === type);
            if (!!foundRule) {
                result.push(`if (this.metaTypeOk(${varName}, "${Names.classifier(foundRule.owner.myClassifier)}")) {
                result = ${TyperGenUtils.makeExpAsType(foundRule.exp, varName, false, imports)};
             }`)
            }
        });

        // add an entry for all limited concepts
        const allLimited = typerDef.language.concepts.filter(con => con instanceof PiLimitedConcept) as PiLimitedConcept[];
        allLimited.map(lim =>
            result.push(`if (this.metaTypeOk(${varName}, "${Names.classifier(lim)}")) {
                result = AstType.create({ astElement: modelelement });
             }`)
        );
        // add an entry for classifiers that do not have an inferType rule
        result.push(`if (this.mainTyper.isType(${varName})) {
                result = AstType.create({ astElement: ${varName} });
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


