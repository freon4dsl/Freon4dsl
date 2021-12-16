import { GrammarRule } from "./GrammarRule";
import { PiClassifier, PiLanguage, PiPrimitiveType } from "../../../languagedef/metalanguage";
import { LANGUAGE_GEN_FOLDER, Names, READER_GEN_FOLDER } from "../../../utils";
import { PiUnitDescription } from "../../../languagedef/metalanguage/PiLanguage";

export class GrammarPart {
    unit: PiUnitDescription;
    rules: GrammarRule[] = [];
    private imports: PiClassifier[] = [];

    public addToImports(extra: PiClassifier | PiClassifier[]) {
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

    toMethod(language: PiLanguage, relativePath: string): string {
        const className: string = Names.unitAnalyser(language, this.unit);

        return `import {net} from "net.akehurst.language-agl-processor";
        import SPPTBranch = net.akehurst.language.api.sppt.SPPTBranch;
        import { PiElementReference, ${this.imports.map(imp => `${Names.classifier(imp)}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
        import { ${Names.syntaxAnalyser(language)} } from "./${Names.syntaxAnalyser(language)}";
        
        export class ${className} {
            mainAnalyser: ${Names.syntaxAnalyser(language)};
            
            constructor(mainAnalyser: ${Names.syntaxAnalyser(language)}) {
                this.mainAnalyser = mainAnalyser;
            }
            
            ${this.rules.map(rule => `${rule.toMethod("mainAnalyser")}`).join("\n\n")}
        }`

    }
}
