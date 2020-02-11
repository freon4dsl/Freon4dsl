/**
 * Parser for PiLanguage syntax.
 * Implemented using parjs, a parser combinator written in TypeScript.
 */
import { anyCharOf, anyStringOf, digit, float, letter, noCharOf, Parjser, string, whitespace } from "parjs";
import {
    PiLanguageDef,
    PiLanguageConceptDef, PiLanguageConceptReferenceDef,
    PiLanguageElementPropertyDef, PiLanguageEnumerationDef,
    PiLanguagePrimitivePropertyDef, PiLanguageEditorPropertyDef
} from "./PiLanguageDef";
import {
    between,
    many,
    manySepBy,
    manyTill,
    map,
    not,
    or,
    stringify,
    then,
    maybe,
    later,
    qthen
} from "parjs/combinators";
import { ParjsFailure, ParjsSuccess } from "parjs/internal/result";

export type EditorPropertyType = "priority" | "trigger" | "symbol";

// Marker property keys
const IS_PROPERTY = "isProperty";
const IS_PART = "isPart";
const IS_REFERENCE = "isReference";
const IS_EDITOR = "isEditor";

/****************************************************************
 * Keywords
 ****************************************************************/
const parjsKeywordLanguage: Parjser<string> = string("language").pipe(between(whitespace()));
const parjsKeywordConcept = string("concept").pipe(between(whitespace()));
const parjsKeywordEnumeration = string("enumeration").pipe(between(whitespace()));
const parjsKeywordPart = string("@part").pipe(between(whitespace()));
const parjsKeywordReference = string("@reference").pipe(between(whitespace()));
const parjsSquareBracketsOptional = string("[]").pipe(maybe()).pipe(between(whitespace()));
const parjsKeywordAbstractOptional = string("abstract").pipe(maybe()).pipe(between(whitespace()));
const parjsKeywordBase = string("base").pipe(maybe()).pipe(between(whitespace()));
const parjsKeywordExpressionOptional = string("expression").pipe(maybe()).pipe(between(whitespace()));
const parjsKeywordRootOptional = string("root").pipe(maybe()).pipe(between(whitespace()));
const parjsKeywordPlaceholder = string("placeholder").pipe(maybe()).pipe(between(whitespace()));
const parjsKeywordBinaryOptional = string("binary").pipe(maybe()).pipe(between(whitespace()));
const parjsKeywordSymbol = string("symbol").pipe(between(whitespace()));
const parjsKeywordRegexp: Parjser<string> = string("regexp").pipe(between(whitespace()));
const parjsKeywordTrigger: Parjser<string> = string("trigger").pipe(between(whitespace()));
const parjsKeywordPriority: Parjser<string> = string("priority").pipe(between(whitespace()));
const parjsKeywordEditor: Parjser<string> = string("@editor").pipe(between(whitespace()));
const parjsKeywordBracketOpen = string("{").pipe(between(whitespace()));
const parjsKeywordBracketClose = string("}").pipe(between(whitespace()));
const parjsKeywordEquals = string("=").pipe(between(whitespace()));
const parjsKeywordStaticOptional = string("static").pipe(maybe()).pipe(between(whitespace()));
const keywords = anyStringOf("parts", "references").pipe(between(whitespace()));

/****************************************************************
 * Identifiers
 ****************************************************************/
const parjsLetter = letter();
const parjsDigit = digit();
const parjsLetterOrDigit = parjsLetter.pipe(or(parjsDigit));
const parjsTail = parjsLetterOrDigit.pipe(many()).pipe(map(l => l.join("")));
const parjsIdentifier: Parjser<string> =
    parjsLetter.pipe(
        then(
            parjsTail
        ),
        between(whitespace())
    ).pipe(
        map(s => s.join("")));

/****************************************************************
 * String literals:  copied and adapted from the parjs examples
****************************************************************/
const escapes = {
    "\"": `"`,
    "\\": "\\",
    "/": "/",
    f: "\f",
    n: "\n",
    r: "\r",
    t: "\t"
};

let pEscapeChar = anyCharOf(
    Object.getOwnPropertyNames(escapes).join()
).pipe(
    map(char => escapes[char] as string)
);

// Any escape sequence begins with a \
let pEscapeAny = string("\\").pipe(
    qthen(
        pEscapeChar
    )
);

// Here we process regular characters vs escape sequences
let pCharOrEscape = pEscapeAny.pipe(
    or(
        noCharOf('"')
    )
);
// Repeat the char/escape to get a sequence, and then put between quotes to get a string
let pStr = pCharOrEscape.pipe(
    many(),
    stringify(),
    between('"'),
    between(whitespace())
);

// console.log(pStr.parse("\"appe\\\\ new \\n moes\""));

/****************************************************************
 * PiLanguage
 ****************************************************************/
const parjsInitialValue: Parjser<string> =
    parjsKeywordEquals.pipe(
        then(
            pStr
        )
    ).pipe(
        maybe()
    ).pipe(map(result => {
        return (result !== undefined ? result[1] : undefined);
    }));

const parjsPrimitiveProperty: Parjser<PiLanguagePrimitivePropertyDef> =
    parjsKeywordStaticOptional.pipe(
        then(
            parjsIdentifier,
            string(":"),
            parjsIdentifier,
            parjsInitialValue,
        ))
        .pipe(map(result => {
            var r: PiLanguagePrimitivePropertyDef = {
                isStatic: result[0] !== undefined,
                name: result[1] as string,
                type: result[3] as string,
                initialValue: ( result[4] !== undefined ? result[4] : undefined)
            };
            r[IS_PROPERTY] = true;
            return r;
        }));

const parjsEditorPropertyType: Parjser<EditorPropertyType> =
    parjsKeywordPriority.pipe(
        or(
            parjsKeywordSymbol,
            parjsKeywordTrigger
        )
    ).pipe(map(result => {
        if (result === "priority") { return "priority"; }
        if (result === "symbol") { return "symbol"; }
        if (result === "trigger") { return "trigger"; }
    }));

const parjsEditorProperty: Parjser<PiLanguageEditorPropertyDef> =
    parjsKeywordEditor.pipe(
        then(
            parjsEditorPropertyType,
            string(":"),
            parjsIdentifier,
            parjsInitialValue,
        ))
        .pipe(map(result => {
            var r: PiLanguagePrimitivePropertyDef = {
                name: result[1] as string,
                type: result[3] as string,
                initialValue: ( result[4] !== undefined ? result[4] : undefined)
            };
            r[IS_EDITOR] = true;
            return r;
        }));

const parjsElementProperty: Parjser<PiLanguageElementPropertyDef> =
    parjsIdentifier.pipe(
        then(
            string(":"),
            parjsIdentifier,
            parjsSquareBracketsOptional,
        ))
        .pipe(map(result => {
            return {
                name: result[0] as string,
                type: {
                    concept: result[2] as string
                },
                isList: result[3] !== undefined,
            };
        }));

const parjsPart: Parjser<PiLanguageElementPropertyDef> =
    parjsKeywordPart.pipe(
        then(
            parjsElementProperty
        ))
        .pipe(map(result => {
            result[1][IS_PART] = true;
            return result[1] as PiLanguageElementPropertyDef;
        }));

const parjsReference: Parjser<PiLanguageElementPropertyDef> =
    parjsKeywordReference.pipe(
        then(
            parjsElementProperty
        ))
        .pipe(map(result => {
            result[1][IS_REFERENCE] = true;
            return result[1] as PiLanguageElementPropertyDef;
        }));

const parjsConceptExpressionPart =
    parjsKeywordBinaryOptional.pipe(
        then(
            parjsKeywordExpressionOptional,
            parjsKeywordPlaceholder,
        )
    );

const parjsConceptStart =
    parjsKeywordAbstractOptional.pipe(
        then(
            parjsKeywordRootOptional,
            parjsConceptExpressionPart,
            // parjsKeywordBinaryOptional,
            // parjsKeywordExpressionOptional,
            // parjsKeywordPlaceholder,
            parjsKeywordConcept
        )
    );

const parjsBase =
    parjsKeywordBase.pipe(
        then(
            parjsIdentifier
        )
    ).pipe(
        maybe()
    );

const parjsConcept: Parjser<PiLanguageConceptDef> =
    parjsConceptStart.pipe(
        then(
            parjsIdentifier,
            parjsBase,
            parjsPrimitiveProperty.pipe(
                or(
                    parjsPart,
                    parjsReference,
                    parjsEditorProperty
                ),
                many(),
                between(parjsKeywordBracketOpen, parjsKeywordBracketClose)
            )
        ))
        .pipe(map(result => {
            return {
                isAbstract: result[0][0] !== undefined,
                isRoot: result[0][1] !== undefined,
                isBinaryExpression: result[0][2][0] !== undefined,
                isExpression: result[0][2][1] !== undefined,
                isExpressionPlaceHolder: result[0][2][2] !== undefined,
                name: result[1],
                base: (result[2] !== undefined && result[2][0] !== undefined ? {
                    concept: result[2][1]
                } : undefined),
                properties: result[3].filter(r => isProperty(r)).map(p => p as any as PiLanguagePrimitivePropertyDef),
                parts: result[3].filter(r => isPart(r)).map(p => p as any as PiLanguageElementPropertyDef),
                references: result[3].filter(r => isReference(r)).map(p => p as any as PiLanguageElementPropertyDef),
                editor: result[3].filter(r => isEditor(r)).map(p => p as any as PiLanguageEditorPropertyDef)
            };
        }));

const parjsEnumeration: Parjser<PiLanguageEnumerationDef> =
    parjsKeywordEnumeration.pipe(
        then(
            parjsIdentifier,
            parjsIdentifier.pipe(
                many(),
                between(parjsKeywordBracketOpen, parjsKeywordBracketClose)
            )
        )
    )
    .pipe(map(result => {
        return {
            name: result[1],
            literals: result[2]
        };
    }));


const parjsLanguage: Parjser<PiLanguageDef> =
    parjsKeywordLanguage.pipe(
        then(
            parjsIdentifier,
            parjsConcept.pipe(
                many()
            ),
            parjsEnumeration.pipe(
                many()
            ),
        )
    )
    .pipe(map(result => {
        return {
            name: result[1],
            concepts: result[2],
            enumerations: result[3]
        };
    }));

function isProperty(p: PiLanguageElementPropertyDef | PiLanguagePrimitivePropertyDef | string): boolean {
    if (p[IS_PROPERTY] === true) {
        delete p[IS_PROPERTY];
        return true;
    }
    return false;

}

function isPart(p: PiLanguageElementPropertyDef | PiLanguagePrimitivePropertyDef | string): boolean {
    if (p[IS_PART] === true) {
        delete p[IS_PART];
        return true;
    }
    return false;

}

function isReference(p: PiLanguageElementPropertyDef | PiLanguagePrimitivePropertyDef | string): boolean {
    if (p[IS_REFERENCE] === true) {
        delete p[IS_REFERENCE];
        return true;
    }
    return false;

}

function isEditor(p: PiLanguageElementPropertyDef | PiLanguagePrimitivePropertyDef | string): boolean {
    if (p[IS_EDITOR] === true) {
        delete p[IS_EDITOR];
        return true;
    }
    return false;

}

export function parsePiLanguage(spec: string): PiLanguageDef | string {
    const result: ParjsFailure | ParjsSuccess<PiLanguageDef> = parjsLanguage.parse(spec);
    if (result instanceof ParjsFailure) {
        const failure = result as ParjsFailure;
        return "Line " + (failure.trace.location.line + 1) + ", column " + failure.trace.location.column + ": " + failure.trace.reason;
    } else {
        const success = result as ParjsSuccess<PiLanguageDef>;
        return success.value;
    }
}

const RESULT3 = parsePiLanguage(`
language DemoLanguage

concept DemoModel {
    name: string
    @part entitites: DemoEntity[]
    @part functions: DemoFunction[]
}

concept DemoEntity {
    name: string
    @part attributes: DemoAttribute[]
}

concept DemoAttribute {
    name: string
    type: DemoAttributeType
}`
);

// console.log(RESULT3);
// console.log(JSON.stringify(RESULT3, null, 4));


