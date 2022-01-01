{
    let creator = require("./NewPiEditCreators");
    let expCreator = require("../../languagedef/parser/ExpressionCreators");
}

// TODO make order of things more flexible
Editor_Definition = ws "editor" ws name:var ws
        x:standardBooleanProjection? ws
        y:standardReferenceSeparator? ws
        projGroup:projectionGroup ws
{
    let projectionGroups = [];
    if (!!projGroup) {
        projectionGroups.push(projGroup);
    }
    return creator.createEditUnit({
        "name"                          : name,
        "standardBooleanProjection"     : x,
        "standardReferenceSeparator"    : y,
        "projectiongroups"              : projectionGroups,
        "location"                      : location()
    });
}

propProjectionStart     = "${"
propProjectionEnd       = "}"
projection_begin        = ws "["
projection_end          = "]" ws
projection_separator    = "|"

standardBooleanProjection = "boolean" projection_begin t1:textBut projection_separator t2:textBut projection_end
{
    return creator.createStdBool({
        "trueKeyword"   : t1,
        "falseKeyword"  : t2,
        "location"      : location()
    });
}

standardReferenceSeparator = "referenceSeparator" projection_begin t:textBut projection_end
{ return t; }

projectionGroup = projections:classifierProjection*
{
    return creator.createProjectionGroup({
        "projections"   : projections,
        "location"      : location()
    });
}

classifierProjection =
            classifier:classifierReference curly_begin ws
                projections:projectionChoice?
                extras: extraClassifierInfo
            curly_end
{
//    console.log("PROJECTION222: "+ projections["normal"]?.toString());
//    console.log("TABLE222: " + projections["table"]?.toString());
    return creator.createClassifierProjection({
        "classifier"       : classifier,
        "projection"       : !!projections ? projections["normal"] : undefined,
        "tableProjection"  : !!projections ? projections["table"] : undefined,
        "classifierInfo"   : extras,
        "location"         : location()
    });
}

projectionChoice = p:projection t:tableProjection? / t:tableProjection p:projection?
{
    return {
        "table"   : t,
        "normal"  : p
    };
}

extraClassifierInfo =
                trigger:trigger?
                referenceShortcut:referenceShortcut?
                symbol:symbol?
{
    return creator.createClassifierInfo({
        "trigger"          : trigger,
        "referenceShortcut": referenceShortcut,
        "symbol"           : symbol,
        "location"         : location()
    });
}

projection = projection_begin lines:lineWithOptional* projection_end
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
                   projection_end
{
    return creator.createTableProjection({ "headers" : headers, "cells": cells, "location": location() });
}

lineWithOptional = items:(templateSpace / textItem / property_projection / optionalProjection / superProjection / newline )+
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

property_projection = propProjectionStart ws
                         exp:var (colon_separator editorName:var)? ws l:listInfo? t:tableInfo? k:keywordDecl? ws
                      propProjectionEnd
{
    return creator.createPropertyProjection( { "expression": exp, "listInfo": l, "tableInfo": t, "keyword":k, "location": location() });
}

optionalProjection = projection_begin "?" lines:lineWithOutOptional* projection_end
{
    return creator.createOptionalProjection( {"lines": lines} );
}

superProjection = projection_begin "=>" ws exp:var (colon_separator projName:var)? ws projection_end
//{
//    return creator.createSuperProjection({
//        "classifier"        : exp,
//        "projectionName"    : projName,
//        "location"          : location()
//    });
//}

tableInfo = "table" ws dir:("rows" / "columns")? ws
{
    return creator.createListInfo({
        "isTable"       : true,
        "listDirection" : creator.createListDirection( {"listDirection": dir, "location": location() } ),
        "location"      : location()
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

listInfo =  dir:listDirection? type:listInfoType? text:("[" t:textBut "]" ws {return t;})?
{
    return creator.createListInfo({
        "isTable"       : false,
        "listDirection" : dir,
        "joinType"      : type,
        "joinText"      : text,
        "location"      : location()
    });
}

listDirection = dir:("horizontal" / "vertical") ws
{
    return creator.createListDirection( {"listDirection": dir, "location": location() } );
}

listInfoType = joinType:("separator" / "terminator" / "initiator") ws
{
    return creator.createJoinType( {"type": joinType, "location": location() } );
}

classifierReference = referredName:var
{
    return expCreator.createClassifierReference({"name": referredName, "location": location()})
}

trigger = "trigger" ws equals_separator ws "\"" value:string "\"" ws
{
    return value;
}

referenceShortcut = "referenceShortcut" ws equals_separator ws propProjectionStart ws exp:var propProjectionEnd ws
{
    return exp;
}

symbol = "symbol" ws equals_separator ws "\"" value:string "\"" ws
{
    return value;
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
// projection_begin        = ws "["
// projection_separator    = "|"
anythingBut = !("${" / newline / "[" / "|" / "]") src:char
{
    return src;
}

newline     = "\r"? "\n"
{
    return creator.createNewline();
}
