{
    let creator = require("./PiEditCreators");
    let expCreate = require("../../languagedef/parser/ExpressionCreators");
}

// TODO make order of things more flexible
Editor_Definition = group:projectionGroup
{
    return creator.createEditUnit(group);
}

projectionGroup = ws "editor" ws name:var ws
        x:standardBooleanProjection? ws
        y:standardReferenceSeparator? ws
        projections:classifierProjection* ws
{
    return creator.createProjectionGroup({
        "name"                          : name,
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

/* rules that make order of extra info flexible */
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
                         "self."? propName:var (colon_separator editorName:var)? ws
                      propProjectionEnd
{
    return creator.createPropertyProjection( {
        "expression": creator.createSelfExp(propName),
        "location": location()
    });
}

listProperty = propProjectionStart ws
                         "self."? propName:var (colon_separator editorName:var)? ws l:listInfo? ws
                      propProjectionEnd
{
    return creator.createListPropertyProjection( {
        "expression": creator.createSelfExp(propName),
        "listInfo": l,
        "location": location()
    });
}

tableProperty = propProjectionStart ws
                         "self."? propName:var (colon_separator editorName:var)? ws t:tableInfo? ws
                      propProjectionEnd
{
    return creator.createTablePropertyProjection( {
        "expression": creator.createSelfExp(propName),
        "tableInfo": t,
        "location": location()
    });
}

booleanProperty = propProjectionStart ws
                         "self."? propName:var (colon_separator editorName:var)? ws k:keywordDecl? ws
                      propProjectionEnd
{
    return creator.createBooleanPropertyProjection( {
        "expression": creator.createSelfExp(propName),
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
