import {
    FreMetaClassifier,
    FreMetaConcept,
    FreMetaConceptProperty,
    FreMetaInterface,
    FreMetaLanguage,
    FreMetaLimitedConcept,
    LangUtil,
} from "../../languagedef/metalanguage/index.js"
import { getLangiumTypeName } from "./grammarModel/GrammarUtils.js"
import { Imports, Names } from "../../utils/on-lang/index.js"
import { langiumPrefix } from "./LangiumGrammarGenerator.js"
import { isNullOrUndefined } from "../../utils/file-utils/index.js"

export class LangiumConverterMaker {
    public makeLangiumConverter(language: FreMetaLanguage, relativePath: string): string {
        // TODO change the hardcoded string 'LG_IKeyed' in the template
        //  The name is dependent on `language` and the LangiumGrammarGenerator.
        const imports = new Imports(relativePath)
        imports.core.add(Names.FreNodeReference).add("CoreConfig").add("FREON")

        let langBase: FreMetaClassifier | undefined = undefined
        let result = ""
        for (const cls of language.units) {
            // TODO We should actually build a converter for each of the unit types.
            //  Here we build just one for the last of the unit types.
            //  Or, we could add a switch to convert2freon.
            imports.language.add(Names.classifier(cls))
            result += this.makeConvertFunc(cls)
            langBase = cls
        }
        for (const cls of language.classifiers()) {
            if (cls instanceof FreMetaConcept && !cls.isAbstract) {
                imports.language.add(Names.classifier(cls))
                result += this.makeConvertFunc(cls)
            } else {
                imports.language.add(Names.classifier(cls))
                result += this.makeConvertChoice(cls, imports)
            }
        }
        // TODO The LG imports do not yet have the right location from where the types should be imported
        //  The location of the imports from the generated language should be brought inline with the
        //  expectations of the project that uses Langium.
        //  Now the generator creates `from "../language/index.js"` and `from "LionCore_M3-langium-types"`,
        //  In the VScode project these should be `from "./freon/language/index.js"` and `from "limonaid-language"`,
        //  of course, both dependent and how the VScode project is scaffolded.

        return `// TEMPLATE: LangiumConverterMaker.makeLangiumConverter(...)
        import { ParseResult, AstNode as LangiumNode } from 'langium';
        import type { Reference as LangiumReference } from 'langium';
        import chalk from 'chalk';
        ${imports.makeImports(language)}
        ${this.makeLG_imports(language)}
        import { ${Names.environment(language)} } from "./freon/config/${Names.environment(language)}.js"
        import { ${Names.writer(language)} } from "./freon/writer/${Names.writer(language)}.js"
        
        export function convert2freon(parseResult: ParseResult<LangiumNode>) {
            console.log(chalk.blue('Converting langium AST to Freon in-memory classes'));
            CoreConfig.initializeWithoutServer(${Names.environment(language)}.getInstance())
                
            const ast = parseResult.value
        
            if (!isLG_Language(ast)) {
                throw new Error('Expected a Language as root of the AST')
            }
        
            let freonLanguage = undefined
            FREON.astChanger.change(() => {
                freonLanguage = ${this.makeConvertFuncName(langBase)}(ast);
            })
            const writer = new ${Names.writer(language)}();
            console.log(writer.writeToLines(freonLanguage))
        }
        
        ${result}
        
        function convertNodeReference<T extends LG_IKeyed>(
            source: LangiumReference<T>
        ): ${Names.FreNodeReference}<any> {
            const target = source.ref
        
            if (!target) {
                throw new Error(\`Unexpected unresolved reference '\${source.$refText}'\`)
            }
        
            return ${Names.FreNodeReference}.createFromLionWeb(
                source.$refText,
                target.key,
                target.$type
            )
        }
        `
    }

    private makeConvertFunc(cls: FreMetaClassifier): string {
        // TODO Primitive properties of type string or identifier that are parsed by langium, still contain
        //  the ending backslashes, like `mayBeNull`. We will most likely want to strip these.
        //  Likewise, the quotes around the key values remain, as in `"-key-PropertyDef"`.
        return `function ${this.makeConvertFuncName(cls)}(source: ${getLangiumTypeName(cls)}): ${cls.name} {
            const result = ${cls.name}.create({
            ${cls
                .allPrimProperties()
                .map((prim) => `${prim.name}: source.${prim.name}`)
                .join(",\n")}
            ${cls.allParts().length > 0 ? `,\n` : ``}
            ${cls
                .allParts()
                .map((part) => this.makePartProperty(part))
                .join(",\n")}
            ${cls.allReferences().length > 0 ? `,\n` : ``}    
            ${cls
                .allReferences()
                .map((ref) => this.makeRefProperty(ref))
                .join(",\n")}
            })
            return result;    
        }`
    }

    private makePartProperty(part: FreMetaConceptProperty): string {
        if (!part.isList) {
            return `${part.name}: source.${part.name} ? ${this.makeConvertFuncName(part.type)}(source.${part.name}) : undefined`
        } else {
            return `${part.name}: source.${part.name}.map(pp => ${this.makeConvertFuncName(part.type)}(pp))`
        }
    }

    private makeRefProperty(ref: FreMetaConceptProperty): string {
        const typeName: string = getLangiumTypeName(ref.type)
        if (!ref.isList) {
            return `${ref.name}: source.${ref.name} ? convertNodeReference<${typeName}>(source.${ref.name}) : undefined`
        } else {
            return `${ref.name}: source.${ref.name}.map(reference => convertNodeReference<${typeName}>(reference))`
        }
    }

    private makeLG_imports(language: FreMetaLanguage): string {
        let result = language
            .classifiers()
            .map((classifier) => langiumPrefix + classifier.name + ",\n" + "is" + langiumPrefix + classifier.name)
            .join(",\n")
        return `import { 
            ${result} 
        } from '${language.name}-langium-types'`
    }

    private makeConvertChoice(freClassifier: FreMetaClassifier, imports: Imports): string {
        let implementors: FreMetaClassifier[] = []
        if (freClassifier instanceof FreMetaInterface) {
            // do not include sub-interfaces, because then we might have 'multiple inheritance' problems
            // instead find the direct implementors and add them
            for (const intf of freClassifier.allSubInterfacesDirect()) {
                implementors.push(...LangUtil.findImplementorsDirect(intf))
            }
            implementors.push(...LangUtil.findImplementorsDirect(freClassifier))
        } else if (freClassifier instanceof FreMetaConcept) {
            implementors = freClassifier.allSubConceptsDirect()
        }
        // limited concepts can only be referenced, so exclude them
        implementors = implementors.filter((sub) => !(sub instanceof FreMetaLimitedConcept))

        // console.log(`found ${implementors.length} implementors`)
        if (implementors.length > 1) {
            let content: string = ""
            implementors.forEach((implementor) => {
                imports.language.add(Names.classifier(implementor))
                content += `if (is${langiumPrefix + implementor.name}(source)) {
                return convert${implementor.name}(source)
            }\n`
            })
            imports.language.add(Names.classifier(freClassifier))
            return `function convert${freClassifier.name}(source: ${getLangiumTypeName(freClassifier)}): ${freClassifier.name} {
            ${content}
            throw new Error(\`Unsupported ${Names.classifier(freClassifier)} '\${source.$type}'\`)
        }`
        } else {
            return ""
        }
    }

    private makeConvertFuncName(cls: FreMetaClassifier | undefined): string {
        if (isNullOrUndefined(cls)) {
            return ""
        }
        const typeName = Names.classifier(cls)
        return `convert${typeName}`
    }
}
