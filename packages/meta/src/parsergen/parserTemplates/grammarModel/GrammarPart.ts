import { GrammarRule } from "./GrammarRule";
import { FreClassifier, FreLanguage, FrePrimitiveType } from "../../../languagedef/metalanguage";
import { LANGUAGE_GEN_FOLDER, Names, READER_GEN_FOLDER } from "../../../utils";
import { FreUnitDescription } from "../../../languagedef/metalanguage/FreLanguage";

export class GrammarPart {
    unit: FreUnitDescription;
    rules: GrammarRule[] = [];
    private imports: FreClassifier[] = [];

    public addToImports(extra: FreClassifier | FreClassifier[]) {
        if (!!extra) {
            if (Array.isArray(extra)) {
                for (const ext of extra) {
                    if (!this.imports.includes(ext) && !(ext instanceof FrePrimitiveType)) {
                        this.imports.push(ext);
                    }
                }
            } else if (!this.imports.includes(extra) && !(extra instanceof FrePrimitiveType)) {
                this.imports.push(extra);
            }
        }
    }

    toMethod(language: FreLanguage, relativePath: string): string {
        const className: string = Names.unitAnalyser(language, this.unit);

        return `import {net} from "net.akehurst.language-agl-processor";
        import SPPTBranch = net.akehurst.language.api.sppt.SPPTBranch;
        import { ${this.imports.map(imp => `${Names.classifier(imp)}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
        import { ${Names.syntaxAnalyser(language)} } from "./${Names.syntaxAnalyser(language)}";
        import { ${Names.PiElementReference} } from "@projectit/core";
        
        export class ${className} {
            mainAnalyser: ${Names.syntaxAnalyser(language)};
            
            constructor(mainAnalyser: ${Names.syntaxAnalyser(language)}) {
                this.mainAnalyser = mainAnalyser;
            }
            
            ${this.rules.map(rule => `${rule.toMethod("mainAnalyser")}`).join("\n\n")}
        }`

    }
}
