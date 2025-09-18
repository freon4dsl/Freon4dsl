import { FreMetaLanguage } from "../../languagedef/metalanguage/index.js";
import { Names, Imports } from "../../utils/on-lang/index.js"

export class ReaderTemplate {
    /**
     * Returns a string representation of a generic parser for 'language'. This parser is able
     * to handle every modelunit in the language.
     */
    public generateReader(language: FreMetaLanguage, relativePath: string): string {
        const semanticAnalyser: string = Names.semanticAnalyser(language);
        const syntaxAnalyser: string = Names.syntaxAnalyser(language);
        const imports = new Imports(relativePath)
        imports.core = new Set([Names.FreReader, Names.modelunit(), Names.FreNode, "AST", Names.notNullOrUndefined])
        imports.language = new Set([Names.classifier(language.modelConcept)])
        
        // Template starts here
        return `
        // TEMPLATE: ReaderTemplate.generateReader(...)
        ${imports.makeImports(language)}
        import { ${Names.grammarStr(language)} } from "./${Names.grammar(language)}.js";
        import { ${Names.syntaxAnalyser(language)} } from "./${Names.syntaxAnalyser(language)}.js";
        import { ${semanticAnalyser} } from "./${semanticAnalyser}.js";
        import {
            Agl,
            type LanguageIssue,
            type LanguageProcessor, 
            LanguageProcessorResult,
            type ProcessResult,
            type SentenceContext,
        } from 'net.akehurst.language-agl-processor';

        class MyContext {
            constructor(readonly predefined: Map<string, FreNode>) {}
        }
        
        /**
        *   Class ${Names.reader(language)} is a wrapper that is able to parse all types of
        *   model units in the language.
        */
        export class ${Names.reader(language)} implements ${Names.FreReader} {          
            analyser!: ${syntaxAnalyser};
            parser: LanguageProcessor<${Names.classifier(language.modelConcept)}, MyContext> | null | undefined;
            isInitialized: boolean = false;
        
            initialize() {
                this.analyser = new ${syntaxAnalyser}();
                const res: LanguageProcessorResult<any, any> = Agl.getInstance().processorFromString(
                  ${Names.grammarStr(language)},
                  Agl.getInstance().configuration(undefined, (b: any) => {
                      b.syntaxAnalyserResolverResult(() => this.analyser);
                  }),
                );
                this.parser = res.processor;
                this.isInitialized = true;
            }

            /**
             * Parses and performs a syntax analysis on 'sentence', using the parser and analyser
             * for 'metatype', if available. If 'sentence' is correct, a model unit will be created,
             * otherwise an error wil be thrown containing the parse or analysis error.
             * @param sentence      the input string which will be parsed
             * @param metatype      the type of the unit to be created
             * @param model         the model to which the unit will be added
             * @param sourceName    the (optional) name of the source that contains 'sentence'
             */
            readFromString(sentence: string, metatype: string, model: ${Names.classifier(language.modelConcept)}, sourceName?: string): ${Names.modelunit()} {
                if (!this.isInitialized) {
                    this.initialize();
                }
                if (notNullOrUndefined(sourceName)) this.analyser.sourceName = sourceName;
                let startRule: string = "";
                // choose the correct parser
                ${language.units
                    .map(
                        (unit) =>
                            `if (metatype === "${Names.classifier(unit)}") {
                        startRule  = "${Names.classifier(unit)}";
                    }`,
                    )
                    .join(" else ")}

                // parse the input
                let unit: ${Names.modelunit()} | null = null;
                if (this.parser) {
                    let parseResult: ProcessResult<${Names.classifier(language.modelConcept)}>  | undefined;
                    const options = this.parser.optionsDefault();
                    AST.change( () => {
                        if (this.parser) {
                            if (startRule.length > 0) {
                                options.parse.goalRuleName = startRule;
                                parseResult = this.parser.process(sentence, options);
                            } else {
                                parseResult = this.parser.process(sentence, null);
                            }
                        }
                    });
                    if (notNullOrUndefined(parseResult)) {
                    const errors = parseResult.issues.errors.asJsReadonlyArrayView();
                    if (errors.length > 0) {
                        errors.map((err: LanguageIssue) => {
                            // Strip the error message, otherwise it's too long for the webapp,
                            // and add the location information.
                            let location = \` [\${sourceName}:\${err.location?.line}:\${err.location?.column}]\`;
                            let mess = err.message.replace(/^Failed to match \\{.*?\\} at:\\s*\\.*\\s*/, "Parse error: ");
                            // if (!!err.data) {
                            //     mess += ' (expected ' + err.data + ')';
                            // }
                            if (!!mess && mess.length > 0) {
                                // console.log(mess);
                                throw new Error(mess + location);
                            }
                        });
                    } else {
                        AST.change( () => {
                            if (notNullOrUndefined(parseResult)) {
                                unit = parseResult.asm as unknown as ${Names.modelunit()};
                            }
                        });
                    }
                    // do semantic analysis taking into account the whole model, because references could be pointing anywhere
                    if (notNullOrUndefined(model)) {
                        try {
                            if (!unit) {
                              throw new Error("Parsing produced no unit.");
                            }
                            const u: FreModelUnit = unit;   // cache the narrowed value
                            const name = u.name; 
                            if (model.getUnits().some((existing) => existing.name === name)) {
                                throw new Error(\`Unit named '\${name}' already exists.\`);
                            } else {
                                AST.change( () => {
                                    model.addUnit(u);
                                    const semAnalyser = new ${semanticAnalyser}();
                                    semAnalyser.correct(u);
                                });
                            }
                        } catch (e) {
                            console.error(e instanceof Error ? e.message : String(e));
                            throw e;
                        }
                    }
                    }
                    if (!unit) {
                        throw new Error("Parsing failed to produce a model unit.");
                    }
                    return unit;
                } else {
                    throw new Error(\`No parser for \${metatype} available: grammar incorrect.\`);
                }
            }
        }
        `;
        // end Template
    }
}

// to be added later:
// if ( this.${Names.parser(unit)} == null ) {
//     try {
//         this.${Names.parser(unit)} = Agl.processorFromString(${Names.grammarStr(unit)}, new ${Names.syntaxAnalyser(unit)}(), null, null);
//     } catch (e) {
//         throw new Error(\`No parser for \${metatype} available:\\n\${e.message}.\`);
//                             }
//                         }
