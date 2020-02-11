/**
 * Parser for PiLanguage syntax.
 * Implemented using parjs, a parser combinator written in TypeScript.
 */
import { anyChar, anyCharOf, anyStringOf, digit, float, letter, noCharOf, Parjser, string, whitespace } from "parjs";
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
import { parsePiLanguage } from "./LanguageParser";
import { PiLanguageConceptDef, PiLanguageDef } from "./PiLanguageDef";

export type EditorPropertyType = "priority" | "trigger" | "symbol";

// Marker property keys
const IS_PROPERTY = "isProperty";
const IS_PART = "isPart";
const IS_REFERENCE = "isReference";
const IS_EDITOR = "isEditor";

/****************************************************************
 * Keywords
 ****************************************************************/
const parjsKeywordDollar: Parjser<string> = string("$");
const parjsKeywordStartEnd: Parjser<string> = string("````");
const parjsKeywordProjection = string("projection").pipe(between(whitespace()));

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
const pStr = pCharOrEscape.pipe(
    many(),
    stringify(),
    between('"'),
    between(whitespace())
);

// const allButDollar =
// console.log(pStr.parse("\"appe\\\\ new \\n moes\""));

/****************************************************************
 * PiLanguage
 ****************************************************************/
const parjsProjection: Parjser<string> =
    parjsKeywordProjection.pipe(
        then(
            pStr
        )
    ).pipe(map(result => {
        return (result[1]);
    }));

const parjsWordText: Parjser<string> =
    noCharOf('$`\n').pipe(
        many()
    ).pipe(
        map(l => l.join(""))
    ).pipe(map(result => {
        console.log("Parsed WordText as ["+ result + "]");
        return (result);
    }));

const any : Parjser<string> =
    anyChar().pipe(
        many()
    ).pipe(map(result => {
        console.log("Parsed any as ["+ result + "]");
        return (result[0]);
    }));


const parjsWordRef: Parjser<string> =
    parjsKeywordDollar.pipe(
        then(
            anyChar().pipe(
                many()
            ).pipe(
                map(l => l.join(""))
            )
        )
    ).pipe(map(result => {
        console.log("Parsed parjsWordRef as ["+ result + "]");
        return (result[0]);
    }));

const parjsWord: Parjser<string> =
    parjsWordText.pipe(
        or(parjsWordRef)
    ).pipe(map(result => {
        console.log("Parsed parjsWord as ["+ result + "]");
        return (result[0] === null ? result[1] : result[0]);
    }));

const parjsProjectionLine: Parjser<Object> =
    parjsWord.pipe(
        many(),
    ).pipe(
        then("\n")
    ).pipe(map(result => {
        return (result[1]);
    }));


const parjsProjectionBody: Parjser<Object> =
    parjsProjectionLine.pipe(
        many(),
        between('````','````')
    ).pipe(map(result => {
        return (result[1]);
    }));

export function parseEditor(spec: string): Object | string {
    const result: ParjsFailure | ParjsSuccess<Object> = parjsProjectionBody.parse(spec);
    if (result instanceof ParjsFailure) {
        const failure = result as ParjsFailure;
        return "Line " + (failure.trace.location.line + 1) + ", column " + failure.trace.location.column + ": " + failure.trace.reason;
    } else {
        const success = result as ParjsSuccess<Object>;
        return success.value;
    }
}

const RESULT3 = parseEditor("```` name: string ${ll}````");

console.log(RESULT3);
console.log(JSON.stringify(RESULT3, null, 4));



