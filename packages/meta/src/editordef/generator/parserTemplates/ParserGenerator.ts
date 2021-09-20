import {
    PiClassifier,
    PiConcept,
    PiLanguage,
    PiLimitedConcept,
    PiPrimitiveType, PiProperty
} from "../../../languagedef/metalanguage";
import { PiEditUnit } from "../../metalanguage";
import { Names } from "../../../utils";
import { GrammarTemplate } from "./GrammarTemplate";
import { SyntaxAnalyserTemplate } from "./SyntaxAnalyserTemplate";
import { SemanticAnalysisTemplate } from "./SemanticAnalysisTemplate";
import { LanguageAnalyser } from "./LanguageAnalyser";
import { LimitedMaker } from "./LimitedMaker";
import { BinaryExpMaker } from "./BinaryExpMaker";
import { ChoiceRuleMaker } from "./ChoiceRuleMaker";
import { ConceptMaker } from "./ConceptMaker";

export class ParserGenerator {
    private language: PiLanguage = null;
    private unit: PiConcept = null;
    private editUnit: PiEditUnit = null;
    private generatedParseRules: string[] = [];             // holds all rules that need to be added to the grammar
    private generatedSyntaxAnalyserMethods: string[] = [];  // holds all methods that needs to be added to the syntax analyser class
    private branchNames: string[] = [];     // to be used as part of the if-statement in transformBranch()
    private imports: PiClassifier[] = [];   // holds all the concepts that need to be imported in the syntax analyser class

    private refCorrectorMaker: SemanticAnalysisTemplate = new SemanticAnalysisTemplate();

    generateParserForUnit(language: PiLanguage, langUnit: PiConcept, editUnit: PiEditUnit) {
        // reset all attributes that are global to this class
        this.reset();
        this.language = language;
        this.unit = langUnit;
        this.editUnit = editUnit;
        // analyse the language unit
        let myLanguageAnalyser: LanguageAnalyser = new LanguageAnalyser();
        myLanguageAnalyser.analyseUnit(langUnit);
        // create parse rules and syntax analysis methods for the concepts
        this.generateConcepts(editUnit, myLanguageAnalyser.conceptsUsed, myLanguageAnalyser.optionalProps);
        // create parse rules and syntax analysis methods for the interfaces and abstracts
        this.generateChoiceRules(myLanguageAnalyser.interfacesAndAbstractsUsed);
        // create parse rules and syntax analysis methods for the binary expressions
        if (myLanguageAnalyser.binaryConceptsUsed.length > 0) {
            this.generateBinaryExpressions(language, editUnit, myLanguageAnalyser);
        }
        // create parse rules and syntax analysis methods for the limited concepts
        this.generateLimitedConcepts(editUnit, myLanguageAnalyser.limitedsReferred);
        // do analysis for semantic phase
        this.refCorrectorMaker.analyse(myLanguageAnalyser.interfacesAndAbstractsUsed);
    }

    private generateConcepts(editUnit: PiEditUnit, conceptsUsed: PiConcept[], optionalProps: PiProperty[]) {
        this.addToImports(conceptsUsed);
        let conceptMaker: ConceptMaker = new ConceptMaker();
        conceptMaker.generateConcepts(editUnit, conceptsUsed, optionalProps);
        this.branchNames.push(...conceptMaker.branchNames);
        this.generatedParseRules.push(...conceptMaker.generatedParseRules);
        this.generatedSyntaxAnalyserMethods.push(...conceptMaker.generatedSyntaxAnalyserMethods);
        this.addToImports(conceptMaker.imports);
    }

    private generateChoiceRules(interfacesAndAbstractsUsed: PiClassifier[]) {
        let choiceRuleMaker: ChoiceRuleMaker = new ChoiceRuleMaker();
        choiceRuleMaker.generateChoiceRules(interfacesAndAbstractsUsed);
        this.branchNames.push(...choiceRuleMaker.branchNames);
        this.generatedParseRules.push(...choiceRuleMaker.generatedParseRules);
        this.generatedSyntaxAnalyserMethods.push(...choiceRuleMaker.generatedSyntaxAnalyserMethods);
        this.addToImports(choiceRuleMaker.imports);
    }

    private generateBinaryExpressions(language: PiLanguage, editUnit: PiEditUnit, myLanguageAnalyser: LanguageAnalyser) {
        let binaryExpMaker: BinaryExpMaker = new BinaryExpMaker();
        binaryExpMaker.generateBinaryExpressions(language, editUnit, myLanguageAnalyser.binaryConceptsUsed);
        this.branchNames.push(...binaryExpMaker.branchNames);
        this.generatedParseRules.push(...binaryExpMaker.generatedParseRules);
        this.generatedSyntaxAnalyserMethods.push(...binaryExpMaker.generatedSyntaxAnalyserMethods);
        this.addToImports(binaryExpMaker.imports);
    }

    private generateLimitedConcepts(editUnit: PiEditUnit, limitedsReferred: PiLimitedConcept[]) {
        let limitedMaker: LimitedMaker = new LimitedMaker();
        limitedMaker.generateLimitedRules(editUnit, limitedsReferred);
        this.branchNames.push(...limitedMaker.branchNames);
        this.generatedParseRules.push(...limitedMaker.generatedParseRules);
        this.generatedSyntaxAnalyserMethods.push(...limitedMaker.generatedSyntaxAnalyserMethods);
    }

    getGrammarContent() : string {
        const grammarTemplate: GrammarTemplate = new GrammarTemplate();
        return grammarTemplate.generateGrammar(Names.language(this.language), Names.concept(this.unit), this.generatedParseRules);
    }

    getSyntaxAnalyserContent(relativePath: string) : string {
        const analyserTemplate: SyntaxAnalyserTemplate = new SyntaxAnalyserTemplate();
        const imports: string[] = this.imports.map(concept => Names.classifier(concept));
        return analyserTemplate.generateSyntaxAnalyser(this.unit, this.branchNames, imports, this.generatedSyntaxAnalyserMethods, relativePath);
    }

    getRefCorrectorContent(relativePath: string): string {
        return this.refCorrectorMaker.makeCorrector(this.language, relativePath);
    }

    getRefCorrectorWalkerContent(relativePath: string): string {
        return this.refCorrectorMaker.makeWalker(this.language, relativePath);
    }

    private reset() {
        this.language = null;
        this.unit = null;
        this.editUnit = null;
        this.generatedParseRules = [];
        this.generatedSyntaxAnalyserMethods = [];
        this.branchNames = [];
        this.imports = [];
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
