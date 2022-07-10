{
    let creator = require("./PiEditCreators");
    let expCreate = require("../../languagedef/parser/ExpressionCreators");
}

Editor_Definition = group:projectionGroup
{
    return creator.createEditUnit(group);
}

projectionGroup = ws "editor" ws name:var ws num:("precedence" ws n:numberliteral ws {return n;})?
        x:standardBooleanProjection? ws
        y:standardReferenceSeparator? ws
        projections:classifierProjection* ws
{
    return creator.createProjectionGroup({
        "name"                          : name,
        "precedence"                    : num !== undefined && num !== null ? Number.parseInt(num, 10) : undefined, // the default for parseInt is not (!) the decimal system,
        "standardBooleanProjection"     : x,
        "standardReferenceSeparator"    : y,
        "projections"                   : projections,
        "location"                      : location()
    });
}

propProjectionStart     = "${"
propProjectionEnd       = "}"
projection_begin        = "["
projection_end          = "]"
projection_separator    = "|"

standardBooleanProjection = "boolean" ws projection_begin t1:textBut projection_separator t2:textBut projection_end ws
{
    return creator.createStdBool({
        "trueKeyword"   : t1,
        "falseKeyword"  : t2,
        "location"      : location()
    });
}

standardReferenceSeparator = "referenceSeparator" ws projection_begin t:textBut projection_end ws
{ return t; }

classifierProjection =
            classifier:classifierReference curly_begin ws
                projections:projectionChoice?
                extras: extraClassifierInfo?
            curly_end
{
    return creator.createParsedClassifier({
        "classifier"       : classifier,
        "projection"       : !!projections ? projections["normal"] : null,
        "tableProjection"  : !!projections ? projections["table"] : null,
        "classifierInfo"   : extras,
        "location"         : location()
    });
}

/* rule that makes order of projections flexible */
projectionChoice = p:projection t:tableProjection?
{
    return {
        "table"   : t,
        "normal"  : p
    };
}
    / t:tableProjection p:projection?
{
    return {
        "table"   : t,
        "normal"  : p
    };
}

/* rules that make the order of extra info flexible */
extraClassifierInfo = trigger:trigger
              sub:extraChoiceSub1?
{
    return creator.createClassifierInfo({
        "trigger"               : trigger,
        "referenceShortcutExp"  : !!sub ? sub["referenceShortcut"] : null,
        "symbol"                : !!sub ? sub["symbol"] : null,
        "location"      : location()
    });
}
    / symbol:symbol
      sub:extraChoiceSub2?
{
    return creator.createClassifierInfo({
        "trigger"               : !!sub ? sub["trigger"] : null,
        "referenceShortcutExp"  : !!sub ? sub["referenceShortcut"] : null,
        "symbol"                : symbol,
        "location"      : location()
    });
}
    / referenceShortcut:referenceShortcut
      sub:extraChoiceSub3?
{
    return creator.createClassifierInfo({
        "trigger"               : !!sub ? sub["trigger"] : null,
        "referenceShortcutExp"  : referenceShortcut,
        "symbol"                : !!sub ? sub["symbol"] : null,
        "location"      : location()
    });
}

extraChoiceSub1 = referenceShortcut:referenceShortcut
                  symbol:symbol?
{
    return {
        "referenceShortcut"   : referenceShortcut,
        "symbol"   : symbol,
    };
}
    / symbol:symbol
      referenceShortcut:referenceShortcut?
{
    return {
        "referenceShortcut"   : referenceShortcut,
        "symbol"   : symbol,
    };
}

extraChoiceSub2 = referenceShortcut:referenceShortcut
                  trigger:trigger?
{
    return {
        "referenceShortcut"   : referenceShortcut,
        "trigger"  : trigger
    };
}
    / trigger:trigger
      referenceShortcut:referenceShortcut?
{
    return {
        "referenceShortcut"   : referenceShortcut,
        "trigger"  : trigger
    };
}

extraChoiceSub3 = symbol:symbol
                  trigger:trigger?
{
    return {
        "symbol"   : symbol,
        "trigger"  : trigger
    };
}
    / trigger:trigger
      symbol:symbol?
{
    return {
        "symbol"   : symbol,
        "trigger"  : trigger
    };
}
/* END of rules that make order of extra info flexible */

projection = ws projection_begin lines:lineWithOptional* projection_end ws
{
    return creator.createProjection({
        "lines" : lines,
        "location": location()
    });
}

tableProjection = "table" ws projection_begin ws
                       headers:( head:textBut
                                tail:(ws projection_separator ws v:textBut { return v; })* ws
                                    { return [head].concat(tail); }
                               )?
                       cells:( head:property_projection
                                tail:(ws projection_separator ws v:property_projection { return v; })*
                                    { return [head].concat(tail); }
                             ) ws
                   projection_end ws
{
    return creator.createTableProjection({ "headers" : headers, "cells": cells, "location": location() });
}

lineWithOptional = items:(templateSpace / textItem / optionalProjection / property_projection / superProjection / newline )+
{
    return creator.createLine( {"items": items} );
}

lineWithOutOptional = items:(templateSpace / textItem / property_projection / superProjection / newline )+
{
    return creator.createLine( {"items": items} );
}

templateSpace = s:[ \t]+
{
    return creator.createIndent( { "indent": s.join(""), "location": location() });
}

textItem = chars:anythingBut+
{
    return creator.createTextItem( chars.join("") );
}

property_projection = s:singleProperty {return s;}
    / l:listProperty {return l;}
    / t:tableProperty {return t;}
    / b:booleanProperty {return b;}

singleProperty = propProjectionStart ws
                         "self."? propName:var projName:(colon_separator v:var {return v;})? ws
                      propProjectionEnd
{
    return creator.createPropertyProjection( {
        "expression": creator.createSelfExp(propName),
        "projectionName": projName,
        "location": location()
    });
}

listProperty = propProjectionStart ws
                         "self."? propName:var projName:(colon_separator v:var {return v;})? ws l:listInfo? ws
                      propProjectionEnd
{
    return creator.createListPropertyProjection( {
        "expression": creator.createSelfExp(propName),
        "projectionName": projName,
        "listInfo": l,
        "location": location()
    });
}

tableProperty = propProjectionStart ws
                         "self."? propName:var projName:(colon_separator v:var {return v;})? ws t:tableInfo? ws
                      propProjectionEnd
{
    return creator.createTablePropertyProjection( {
        "expression": creator.createSelfExp(propName),
        "projectionName": projName,
        "tableInfo": t,
        "location": location()
    });
}

booleanProperty = propProjectionStart ws
                         "self."? propName:var projName:(colon_separator v:var {return v;})? ws k:keywordDecl? ws
                      propProjectionEnd
{
    return creator.createBooleanPropertyProjection( {
        "expression": creator.createSelfExp(propName),
        "projectionName": projName,
        "keyword":k,
        "location": location()
    });
}

optionalProjection = projection_begin "?" lines:lineWithOutOptional* projection_end
{
    return creator.createOptionalProjection( {"lines": lines, "location": location()} );
}

superProjection = projection_begin "=>" ws superRef:classifierReference projName:(colon_separator v:var {return v;})? ws projection_end
{
    return creator.createSuperProjection({
        "superRef"          : superRef,
        "projectionName"    : projName,
        "location"          : location()
    });
}

tableInfo = "table" ws dir:("rows" / "columns")? ws
{
    return creator.createListInfo({
        "isTable"   : true,
        "direction" : creator.createListDirection( {"direction": dir, "location": location() } ),
        "location"  : location()
    });
}

keywordDecl = projection_begin text1:textBut text2:(projection_separator t2:textBut {return t2;})? projection_end
{
    return creator.createBoolKeywords({
        "trueKeyword"   : text1,
        "falseKeyword"  : text2,
        "location"      : location()
    });
}

listInfo =  dir:listDirection? l:(type:listInfoType "[" t:textBut "]" {return { "type": type, "text": t }})? ws
{
    return creator.createListInfo({
        "isTable"   : false,
        "direction" : dir,
        "joinType"  : !!l ? l["type"] : undefined,
        "joinText"  : !!l ? l["text"] : undefined,
        "location"  : location()
    });
}

listDirection = dir:("horizontal" / "vertical") ws
{
    return creator.createListDirection( {"direction": dir, "location": location() } );
}

listInfoType = joinType:("separator" / "terminator" / "initiator") ws
{
    return creator.createJoinType( {"type": joinType, "location": location() } );
}

trigger = "trigger" ws equals_separator ws "\"" triggerValue:string "\"" ws
{
    return !!triggerValue ? triggerValue : "ERROR";
}

referenceShortcut = "referenceShortcut" ws equals_separator ws propProjectionStart ws "self."? exp:var propProjectionEnd ws
{
    return creator.createSelfExp(exp);
}

symbol = "symbol" ws equals_separator ws "\"" symbolValue:string "\"" ws
{
    return !!symbolValue ? symbolValue : "ERROR";
}

priority = "priority" ws ":" ws "\"" value:string "\"" ws
{
    return value;
}

// This rule parses text until one of the special starter chars or string is encountered.
textBut  = chars:anythingBut+
{
    return chars.join("").trim();
}

// The 'anythingBut' rule parses text until one of the special starter chars or string is encountered.
// Note that these chars can still be escaped, through the 'char' rule in the basic grammar
// The following are excluded:
// propProjectionStart     = "${"
// projection_begin        = "["
// projection_end          = "]"
// projection_separator    = "|"
anythingBut = !("${" / newline / "[" / "|" / "]") src:char
{
    return src;
}

newline     = "\r"? "\n"
{
    return creator.createNewline();
}
// These are the parsing rules for the expressions over the language structure,
// as defined in meta/src/languagedef/metalanguage/PiLangExpressions.ts
// They are not meant to be used separately, they should be used in the parser for 
// projectIt parts that use the language expressions.
// Because they are common they are developed and tested separately, together with the
// creator functions in LanguageExpressionCreators.ts.

// the following rules should be part of a parser that wants to use PiLangExpressions.ts

classifierReference = referredName:var
{
    return expCreate.createClassifierReference({"name": referredName, "location": location()})
}

langExpression = functionExpression:functionExpression  { return functionExpression; }
               / instanceExpression:instanceExpression  { return instanceExpression; }
               / expression:expression                  { return expression; }
               / simpleExpression:simpleExpression      { return simpleExpression; }

instanceExpression = conceptName:var ':' instance:var
    {
        return expCreate.createInstanceExp ({
            "sourceName": conceptName,
            "instanceName": instance,
            "location": location()
        })
    }

expression = sourceName:var appliedfeature:dotExpression
            {
                return expCreate.createExpression ({
                    "sourceName": sourceName,
                    "appliedfeature": appliedfeature,
                    "location": location()
                })
            }
            / sourceName:var
            {
                return expCreate.createExpression ({
                    "sourceName": sourceName,
                    "location": location()
                })
            }

dotExpression = '.' sourceName:var appliedfeature:dotExpression?  {
  return expCreate.createAppliedFeatureExp
( {
    "sourceName": sourceName,
    "appliedfeature": appliedfeature,
    "location": location()
  })
}

functionExpression = sourceName:var round_begin actualparams:(
      head:langExpression
      tail:(comma_separator v:langExpression { return v; })*
      { return [head].concat(tail); }
    )?
    round_end appliedfeature:dotExpression? {
  return expCreate.createFunctionCall ({
    "sourceName": sourceName,
    "actualparams": actualparams,
    "appliedfeature": appliedfeature,
    "location": location()
  })
}

simpleExpression = number:numberliteral {
    return expCreate.createSimpleExpression
( {
    "value": !isNaN(parseInt(number, 10)) ? parseInt(number, 10) : 0, // the default for parseInt is not (!) the decimal system
    "location": location()
  })
}



// This is a partial grammar file for re-use in other grammars

// the following is basic stuff

curly_begin    = ws "{" ws
curly_end      = ws "}" ws
round_begin    = ws "(" ws
round_end      = ws ")" ws
comma_separator = ws "," ws
semicolon_separator = ws ";" ws
colon_separator  = ws ":" ws
equals_separator  = ws "=" ws
plus_separator = ws "+" ws
ws "whitespace" = (([ \t\n\r]) / (SingleLineComment) / (MultiLineComment) )*
rws "required whitespace" = (([ \t\n\r]) / (SingleLineComment) / (MultiLineComment) )+

var "variable"
  = first:varLetter rest:identifierChar* { return first + rest.join(""); }

string           = chars:(char)* { return chars.join(""); }

varLetter           = [a-zA-Z]
identifierChar      = [a-zA-Z0-9_$] // any char but not /.,!?@~%^&*-=+(){}"':;<>?[]\/
anyChar             = [*a-zA-Z0-9' /\-[\]\|+<>=#$_.,!?@~%^&*-=+(){}:;<>?]
number              = [0-9]

numberliteral     = nums:number+ { return nums.join(""); }

// from javascript example
SingleLineComment
  = "//" (!LineTerminator SourceCharacter)*

LineTerminator
  = [\n\r\u2028\u2029]

SourceCharacter
  = .

Comment "comment"
  = MultiLineComment
  / SingleLineComment

MultiLineComment
  = "/*" (!"*/" SourceCharacter)* "*/"

// from JSON example
// see also ParserGenUtil.escapeRelevantChars()
char
  = unescaped
  / escape
    sequence:(
        '"'
      / "\\"
      / "/"
      / "|"
      / "["
      / "]"
      / "{"
      / "}"
      / "$"
      / "b" { return "\b"; }
      / "f" { return "\f"; }
      / "n" { return "\n"; }
      / "r" { return "\r"; }
      / "t" { return "\t"; }
      / "u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG) {
          return String.fromCharCode(parseInt(digits, 16));
        }
    )
    { return sequence; }

escape
  = "\\"

unescaped
  = [^\0-\x1F\x22\x5C]

// ----- Core ABNF Rules -----

// See RFC 4234, Appendix B (http://tools.ietf.org/html/rfc4234).
DIGIT  = [0-9]
HEXDIG = [0-9a-f]
