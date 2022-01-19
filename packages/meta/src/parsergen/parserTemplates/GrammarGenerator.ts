import { PiLanguage } from "../../languagedef/metalanguage";
import { PiEditUnit } from "../../editordef/metalanguage";
import { LimitedMaker } from "./LimitedMaker";
import { BinaryExpMaker } from "./BinaryExpMaker";
import { ChoiceRuleMaker } from "./ChoiceRuleMaker";
import { ConceptMaker } from "./ConceptMaker";
import { GrammarModel } from "./grammarModel/GrammarModel";
import { LanguageAnalyser, PiAnalyser } from "./LanguageAnalyser";
import { GrammarPart } from "./grammarModel/GrammarPart";
import { SemanticAnalysisTemplate } from "./SemanticAnalysisTemplate";

export class GrammarGenerator {
    private refCorrectorMaker: SemanticAnalysisTemplate = new SemanticAnalysisTemplate();

    createGrammar(language: PiLanguage, analyser: LanguageAnalyser, editUnit: PiEditUnit): GrammarModel {
        // create the model of the grammar and syntax analysis
        const grammar = new GrammarModel();
        grammar.language = language;
        this.createGrammarRules(grammar, editUnit, analyser, language);
        return grammar;
    }

    private createGrammarRules(grammar: GrammarModel, editUnit: PiEditUnit, myLanguageAnalyser: LanguageAnalyser, language: PiLanguage) {
        // generate the rules for each unit
        for (const unitAnalyser of myLanguageAnalyser.unitAnalysers) {
            this.createRulesPerAnalyser(grammar, editUnit, unitAnalyser, language);
        }
        // do the same for the common analyser
        this.createRulesPerAnalyser(grammar, editUnit, myLanguageAnalyser, language);
    }

    private createRulesPerAnalyser(grammar: GrammarModel, editUnit: PiEditUnit, analyser: PiAnalyser, language: PiLanguage) {
        const grammarPart = new GrammarPart();
        grammarPart.unit = analyser.unit;
        // create parse rules and syntax analysis methods for the concepts
        const conceptMaker: ConceptMaker = new ConceptMaker();
        grammarPart.rules.push(...conceptMaker.generateClassifiers(editUnit, analyser.classifiersUsed));

        // create parse rules and syntax analysis methods for the interfaces and abstracts
        const choiceRuleMaker: ChoiceRuleMaker = new ChoiceRuleMaker();
        grammarPart.rules.push(...choiceRuleMaker.generateChoiceRules(analyser.interfacesAndAbstractsUsed));

        // create parse rules and syntax analysis methods for the concepts that have sub-concepts
        grammarPart.rules.push(...choiceRuleMaker.generateSuperRules(analyser.conceptsWithSub));

        // create parse rules and syntax analysis methods for the binary expressions
        const binaryExpMaker: BinaryExpMaker = new BinaryExpMaker();
        if (analyser.binaryConceptsUsed.length > 0) {
            grammarPart.rules.push(binaryExpMaker.generateBinaryExpressions(language, editUnit, analyser.binaryConceptsUsed));
        }

        // create parse rules and syntax analysis methods for the limited concepts
        const limitedMaker: LimitedMaker = new LimitedMaker();
        grammarPart.rules.push(...limitedMaker.generateLimitedRules(analyser.limitedsReferred));

        // imports
        grammarPart.addToImports(analyser.classifiersUsed);
        grammarPart.addToImports(conceptMaker.imports);
        grammarPart.addToImports(choiceRuleMaker.imports);
        grammarPart.addToImports(limitedMaker.imports);
        grammarPart.addToImports(binaryExpMaker.imports);

        // add the rules to the grammar model
        grammar.parts.push(grammarPart);
    }
}
