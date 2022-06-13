import { PitInferenceRule,PiTyperDef } from "../../metalanguage";
import { Names, GenerationUtil } from "../../../utils";
import { PiClassifier, PiLimitedConcept } from "../../../languagedef/metalanguage";
import { FreonTyperGenUtils } from "./FreonTyperGenUtils";
import { PitEqualsRule } from "../../metalanguage/PitEqualsRule";

/**
 * This class generates the code for all 'infertype' entries in the .type file.
 */
export class FreonTypeInferMaker {
    extraMethods: string[] = [];
    typerdef: PiTyperDef = null;
    // private toBeCopied: PiClassifier[] = [];

    public makeInferType(typerDef: PiTyperDef, allLangConcepts: string, rootType: string, varName: string, imports: PiClassifier[]): string {
        FreonTyperGenUtils.types = typerDef.types;
        this.typerdef = typerDef;
        let result: string[] = [];
        // find all infertype rules
        const inferRules: PitInferenceRule[] = [];
        typerDef.classifierSpecs.forEach(spec => {
            inferRules.push(...(spec.rules.filter(r => r instanceof PitInferenceRule)))
        });
        // sort the types such that any type comes before its super type
        const sortedTypes = GenerationUtil.sortClassifiers(typerDef.conceptsWithType);
        // make an entry for all classifiers that have an infertype rule
        sortedTypes.forEach( type => {
            // find the equalsRule, if present
            const foundRule: PitEqualsRule = inferRules.find(conRule => conRule.owner.myClassifier === type);
            if (!!foundRule) {
                result.push(`if (Language.getInstance().metaConformsToType(${varName}, "${Names.classifier(foundRule.owner.myClassifier)}")) {
                result = ${FreonTyperGenUtils.makeExpAsType(foundRule.exp, varName, false, imports)};
             }`)
            }
        });

        // add an entry for all limited concepts
        const allLimited = typerDef.language.concepts.filter(con => con instanceof PiLimitedConcept) as PiLimitedConcept[];
        allLimited.map(lim =>
            result.push(`if (Language.getInstance().metaConformsToType(${varName}, "${Names.classifier(lim)}")) {
                result = AstType.create({ astElement: modelelement });
             }`)
        );
        // add an entry for classifiers that do not have an inferType rule
        result.push(`if (this.mainTyper.isType(${varName})) {
                result = AstType.create({ astElement: ${varName} });
            }`);
        return result.map(r => r).join(" else ");
    }

    // TODO see if there are parts that need to be copied, because when the container/owner changes, the link
    // with the previous container/owner is dropped by Mobx.

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


