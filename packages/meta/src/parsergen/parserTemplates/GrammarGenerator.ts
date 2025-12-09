import type { FreMetaLanguage } from "../../languagedef/metalanguage/index.js";
import type {
    FreEditBoolKeywords,
    FreEditProjectionGroup,
    FreEditUnit} from "../../editordef/metalanguage/index.js";
import {
    ForType
} from "../../editordef/metalanguage/index.js";
import { LimitedMaker } from "./LimitedMaker.js";
import { BinaryExpMaker } from "./BinaryExpMaker.js";
import { ChoiceRuleMaker } from "./ChoiceRuleMaker.js";
import { ConceptMaker } from "./ConceptMaker.js";
import { GrammarModel } from "./grammarModel/index.js";
import type { LanguageAnalyser, FreAnalyser } from "./LanguageAnalyser.js";
import { GrammarPart } from "./grammarModel/GrammarPart.js";
import { Names } from "../../utils/on-lang/index.js";
import { ParserGenUtil } from "./ParserGenUtil.js";
import { LOG2USER } from '../../utils/basic-dependencies/index.js';

export class GrammarGenerator {
    createGrammar(
        language: FreMetaLanguage,
        analyser: LanguageAnalyser,
        editUnit: FreEditUnit,
    ): GrammarModel | undefined {
        // create an empty model of the grammar and syntax analysis
        const grammar: GrammarModel = new GrammarModel(language);

        // add the standard option from the editor definition
        const defProjGroup: FreEditProjectionGroup | undefined = editUnit.getDefaultProjectiongroup();
        let stdBoolKeywords: FreEditBoolKeywords | undefined;
        let refSeparator: string | undefined;
        if (!!defProjGroup) {
            stdBoolKeywords = defProjGroup.findGlobalProjFor(ForType.Boolean)?.keywords;
            refSeparator = defProjGroup.findGlobalProjFor(ForType.ReferenceSeparator)?.separator;
        }
        if (!!stdBoolKeywords) {
            grammar.trueValue = stdBoolKeywords.trueKeyword ? stdBoolKeywords.trueKeyword : "true";
            grammar.falseValue = stdBoolKeywords.falseKeyword ? stdBoolKeywords.falseKeyword : "false";
        }
        if (!!refSeparator && refSeparator.length > 0) {
            grammar.refSeparator = refSeparator;
        }
        // console.log("Grammar generator, stdBoolKeywords:" + stdBoolKeywords?.toString() + ", refSeparator: " + refSeparator);
        // find the projection group that can be used for the parser and unparser
        const projectionGroup: FreEditProjectionGroup | undefined = ParserGenUtil.findParsableProjectionGroup(editUnit);
        // if no projection group found, return
        if (!projectionGroup) {
            // todo better error message
            LOG2USER.error("No projection group found for generating a grammar.");
            return undefined;
        }

        // create the grammar rules and add them to the model
        this.createGrammarRules(grammar, projectionGroup, analyser);
        return grammar;
    }

    private createGrammarRules(
        grammar: GrammarModel,
        projectionGroup: FreEditProjectionGroup,
        myLanguageAnalyser: LanguageAnalyser,
    ) {
        // generate the rules for each unit
        for (const unitAnalyser of myLanguageAnalyser.unitAnalysers) {
            this.createRulesPerAnalyser(grammar, projectionGroup, unitAnalyser);
        }
        // do the same for the common analyser
        this.createRulesPerAnalyser(grammar, projectionGroup, myLanguageAnalyser.commonAnalyser);
    }

    private createRulesPerAnalyser(
        grammar: GrammarModel,
        projectionGroup: FreEditProjectionGroup,
        analyser: FreAnalyser,
    ) {
        const grammarPart: GrammarPart = new GrammarPart();
        if (!!analyser.unit) {
            grammarPart.unit = analyser.unit;
        }
        // create parse rules and syntax analysis methods for the concepts
        const conceptMaker: ConceptMaker = new ConceptMaker();
        grammarPart.rules.push(...conceptMaker.generateClassifiers(projectionGroup, analyser.classifiersUsed));

        // create parse rules and syntax analysis methods for the interfaces and abstracts
        const choiceRuleMaker: ChoiceRuleMaker = new ChoiceRuleMaker();
        grammarPart.rules.push(...choiceRuleMaker.generateChoiceRules(analyser.interfacesAndAbstractsUsed));

        // create parse rules and syntax analysis methods for the concepts that have sub-concepts
        grammarPart.rules.push(...choiceRuleMaker.generateSuperRules(analyser.conceptsWithSub));

        // create parse rules and syntax analysis methods for the binary expressions
        const binaryExpMaker: BinaryExpMaker = new BinaryExpMaker();
        // always use the default projection group for binary expressions
        let groupForBinaries: FreEditProjectionGroup = projectionGroup;
        if (
            projectionGroup.name !== Names.defaultProjectionName &&
            !!projectionGroup.owningDefinition?.getDefaultProjectiongroup()
        ) {
            groupForBinaries = projectionGroup.owningDefinition.getDefaultProjectiongroup()!;
        }
        if (analyser.binaryConceptsUsed.length > 0) {
            grammarPart.rules.push(
                ...binaryExpMaker.generateBinaryExpressions(groupForBinaries, analyser.binaryConceptsUsed),
            );
        }

        // create parse rules and syntax analysis methods for the limited concepts
        const limitedMaker: LimitedMaker = new LimitedMaker();
        grammarPart.rules.push(...limitedMaker.generateLimitedRules(analyser.limitedsReferred));

        // imports
        grammarPart.addToImports(analyser.classifiersUsed);
        grammarPart.addToImports(conceptMaker.imports);
        grammarPart.importParsedNodeReference = conceptMaker.importParsedNodeReference;
        grammarPart.addToImports(choiceRuleMaker.imports);
        grammarPart.addToImports(limitedMaker.imports);
        grammarPart.addToImports(binaryExpMaker.imports);

        // add the rules to the grammar model
        grammar.parts.push(grammarPart);
    }
}
