import { GrammarRule } from "./GrammarRule.js";
import { FreMetaClassifier, FreMetaLanguage, FreMetaPrimitiveType } from "../../../languagedef/metalanguage/index.js";
import { LANGUAGE_GEN_FOLDER, Names } from "../../../utils/index.js";
import { FreMetaUnitDescription } from "../../../languagedef/metalanguage/FreMetaLanguage.js";

export class GrammarPart {
    unit: FreMetaUnitDescription | undefined;
    rules: GrammarRule[] = [];
    private imports: FreMetaClassifier[] = [];

    public addToImports(extra: FreMetaClassifier | FreMetaClassifier[]) {
        if (!!extra) {
            if (Array.isArray(extra)) {
                for (const ext of extra) {
                    if (!this.imports.includes(ext) && !(ext instanceof FreMetaPrimitiveType)) {
                        this.imports.push(ext);
                    }
                }
            } else if (!this.imports.includes(extra) && !(extra instanceof FreMetaPrimitiveType)) {
                this.imports.push(extra);
            }
        }
    }

    toMethod(language: FreMetaLanguage, relativePath: string): string {
        const className: string = Names.unitAnalyser(language, this.unit);

        return `${this.rules.length > 0 ? `import {
            KtList,
            Sentence,
            SpptDataNodeInfo
        } from "net.akehurst.language-agl-processor/net.akehurst.language-agl-processor.mjs";
        import { ${Names.FreNodeReference} } from "@freon4dsl/core";` : ""}
        ${
            this.imports.length > 0
                ? `import { ${this.imports.map((imp) => `${Names.classifier(imp)}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER}/index.js";`
                : ""
        }
        import { PrimValueType, ${Names.syntaxAnalyser(language)} } from "./${Names.syntaxAnalyser(language)}.js";

        export class ${className} {
            mainAnalyser: ${Names.syntaxAnalyser(language)};

            constructor(mainAnalyser: ${Names.syntaxAnalyser(language)}) {
                this.mainAnalyser = mainAnalyser;
            }

            ${this.rules.map((rule) => `${rule.toMethod("mainAnalyser")}`).join("\n\n")}
        }`;
    }
}
