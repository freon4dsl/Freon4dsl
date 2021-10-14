import {
    PiClassifier,
    PiConcept,
    PiLanguage,
    PiPrimitiveType
} from "../../languagedef/metalanguage";
import { PiEditUnit } from "../../editordef/metalanguage";
import { Names } from "../../utils";
import { SemanticAnalysisTemplate } from "./SemanticAnalysisTemplate";
import { LanguageAnalyser } from "./LanguageAnalyser";
import { LimitedMaker } from "./LimitedMaker";
import { BinaryExpMaker } from "./BinaryExpMaker";
import { ChoiceRuleMaker } from "./ChoiceRuleMaker";
import { ConceptMaker } from "./ConceptMaker";
import { GrammarModel } from "./grammarModel/GrammarModel";
import { PiUnitDescription } from "../../languagedef/metalanguage/PiLanguage";

export class ParserGenerator {
    private language: PiLanguage = null;
    private unit: PiUnitDescription = null;
    private editUnit: PiEditUnit = null;
    private grammar: GrammarModel = null;
    private imports: PiClassifier[] = [];   // holds all the concepts that need to be imported in the syntax analyser class

    private refCorrectorMaker: SemanticAnalysisTemplate = new SemanticAnalysisTemplate();

    generateParserForUnit(language: PiLanguage, langUnit: PiUnitDescription, editUnit: PiEditUnit) {
        // (re)set all attributes that are global to this class to new values
        this.language = language;
        this.unit = langUnit;
        this.editUnit = editUnit;
        this.grammar = null;
        this.imports = [];
        this.refCorrectorMaker = new SemanticAnalysisTemplate();

        // analyse the language unit
        let myLanguageAnalyser: LanguageAnalyser = new LanguageAnalyser();
        myLanguageAnalyser.analyseUnit(langUnit);

        // create the model of the grammar and syntax analysis
        this.grammar = new GrammarModel();
        this.grammar.langName = Names.language(this.language);
        this.grammar.unitName = Names.classifier(this.unit);
        this.createGrammarRules(editUnit, myLanguageAnalyser, language);

        // do analysis for semantic phase
        this.refCorrectorMaker.analyse(myLanguageAnalyser.interfacesAndAbstractsUsed);
    }

    private createGrammarRules(editUnit: PiEditUnit, myLanguageAnalyser: LanguageAnalyser, language: PiLanguage) {
        // create parse rules and syntax analysis methods for the concepts
        this.addToImports(myLanguageAnalyser.conceptsUsed);
        const conceptMaker: ConceptMaker = new ConceptMaker();
        this.grammar.rules.push(...conceptMaker.generateConcepts(editUnit, myLanguageAnalyser.conceptsUsed));
        // addImports must done after 'generate...'
        this.addToImports(conceptMaker.imports);

        // create parse rules and syntax analysis methods for the interfaces and abstracts
        let choiceRuleMaker: ChoiceRuleMaker = new ChoiceRuleMaker();
        this.grammar.rules.push(...choiceRuleMaker.generateChoiceRules(myLanguageAnalyser.interfacesAndAbstractsUsed));
        // addImports must done after 'generate...'
        this.addToImports(choiceRuleMaker.imports);

        // create parse rules and syntax analysis methods for the concepts that have sub-concepts
        this.grammar.rules.push(...choiceRuleMaker.generateSuperRules(myLanguageAnalyser.conceptsWithSub));
        // addImports must done after 'generate...'
        this.addToImports(choiceRuleMaker.imports);

        // create parse rules and syntax analysis methods for the binary expressions
        if (myLanguageAnalyser.binaryConceptsUsed.length > 0) {
            let binaryExpMaker: BinaryExpMaker = new BinaryExpMaker();
            this.grammar.rules.push(binaryExpMaker.generateBinaryExpressions(language, editUnit, myLanguageAnalyser.binaryConceptsUsed));
            // addImports must done after 'generate...'
            this.addToImports(binaryExpMaker.imports);
        }

        // create parse rules and syntax analysis methods for the limited concepts
        let limitedMaker: LimitedMaker = new LimitedMaker();
        this.grammar.rules.push(...limitedMaker.generateLimitedRules(editUnit, myLanguageAnalyser.limitedsReferred));
    }

    getGrammarContent() : string {
        return this.grammar.toGrammar();
    }

    getSyntaxAnalyserContent(relativePath: string) : string {
        const imports: string[] = this.imports.map(concept => Names.classifier(concept));
        return this.grammar.toMethod(this.unit, imports, relativePath);
    }

    getRefCorrectorContent(relativePath: string): string {
        return this.refCorrectorMaker.makeCorrector(this.language, relativePath);
    }

    getRefCorrectorWalkerContent(relativePath: string): string {
        return this.refCorrectorMaker.makeWalker(this.language, relativePath);
    }

    private addToImports(extra: PiClassifier | PiClassifier[]) {
        if (!!extra) {
            if (Array.isArray(extra)) {
                for (const ext of extra) {
                    if (!this.imports.includes(ext) && !(ext instanceof PiPrimitiveType)) {
                        this.imports.push(ext);
                    }
                }
            } else if (!this.imports.includes(extra) && !(extra instanceof PiPrimitiveType)) {
                this.imports.push(extra);
            }
        }
    }
}
