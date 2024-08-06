//{
//    let creator = require("./FreEditCreators");
//    let expCreate = require("../../languagedef/parser/ExpressionCreators");
//}

Editor_Definition = group:projectionGroup
{
    return creator.createEditUnit(group);
}

projectionGroup = ws "editor" ws name:var ws num:("precedence" ws n:numberliteral ws {return n;})?
        globals:("global" ws "{" ws list:singleGlobalProjection* ws "}" ws {return list;})?
        projections:classifierProjection* ws
{
    return creator.createProjectionGroup({
        "name"                          : name,
        "precedence"                    : num !== undefined && num !== null ? Number.parseInt(num, 10) : undefined, // the standard for parseInt is not (!) the decimal system,
        "globalProjections"             : globals,
        "projections"                   : projections,
        "location"                      : location()
    });
}

propProjectionStart     = "${"
propProjectionEnd       = "}"
projection_begin        = "["
projection_end          = "]"
projection_separator    = "|"
displayType             = "text" / "checkbox" / "radio" / "switch" / "inner-switch" / "slider"

//globalProjections = "defaults" ws "{" ws list:singleGlobalProjection* ws "}"
//{
//    console.log("list: " + list + ", " + location().start.line)
//    return { list: list };
//}

singleGlobalProjection = "boolean" ws kind:displayType? ws kw:keywordDecl? ws
{
    return creator.createGlobal({
        "for"           : "boolean",
        "displayType"   : kind,
        "keywords"      : kw,
        "location"      : location()
    });
}
/ "referenceSeparator" ws projection_begin t:textBut projection_end ws
{
    return creator.createGlobal({
        "for"           : "referenceSeparator",
        "separator"     : t,
        "location"      : location()
    });
}
/ "number" ws kind:displayType? ws
{
    return creator.createGlobal({
        "for"           : "number",
        "displayType"   : kind,
        "location"      : location()
    });
}
/ "limited" projection_begin projection_end ws kind:displayType? ws
{
    return creator.createGlobal({
        "for"           : "limitedList",
        "displayType"   : kind,
        "location"      : location()
    });
}
/ "limited" ws kind:displayType? ws
{
    return creator.createGlobal({
        "for"           : "limited",
        "displayType"   : kind,
        "location"      : location()
    });
}
/ "externals" ws "{" ws list:singleExternal* ws "}" ws
  {
    return creator.createGlobal({
        "for"           : "externals",
        "externals"     : creator.makeMapFromArray(list),
        "location"      : location()
    });
  }

singleExternal = boxName:var ws "from" ws "\"" boxPath:text "\""
  {
      return creator.createExternal({
          "boxName"     : boxName,
          "boxPath"     : boxPath,
          "location"    : location()
      })
  }

text = chars:anythingBut+
  {
      return chars.join("");
  }

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

lineWithOptional = items:(templateSpace / textItem / optionalProjection / external_projection / property_projection / superProjection / newline )+
{
    return creator.createLine( {"items": items} );
}

lineWithOutOptional = items:(templateSpace / textItem / external_projection / property_projection / superProjection / newline )+
{
    return creator.createLine( {"items": items} );
}

external_projection = projection_begin "external" equals_separator name:var ws projection_end
{
     return creator.createExternalProjection({
        "boxName"   : name,
        "location"  : location()
     })
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
    / b:button_projection {return b;}

singleProperty = propProjectionStart ws
                         "self."? propName:var projName:(colon_separator v:var {return v;})? ws kind:displayType? ws kw:keywordDecl? ws
                      propProjectionEnd
{
    return creator.createSinglePropertyProjection( {
        "expression"        : creator.createSelfExp(propName),
        "projectionName"    : projName,
        "displayType"       : kind,
        "boolKeywords"      : kw,
        "location"          : location()
    });
}

listProperty = propProjectionStart ws
                         "self."? propName:var projName:(colon_separator v:var {return v;})? ws l:listInfo? ws kind:displayType? ws
                      propProjectionEnd
{
    return creator.createListPropertyProjection( {
        "expression"        : creator.createSelfExp(propName),
        "projectionName"    : projName,
        "listInfo"          : l,
        "displayType"       : kind,
        "location"          : location()
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

button_projection = projection_begin "button" ws text:("text" equals_separator "\"" t:textBut "\"" ws {return t})? "boxRole" equals_separator "\"" role:textBut "\"" ws projection_end
{
    return creator.createButtonDef({
        "text"          : text,
        "boxRole"       : role,
        "location"      : location()
    })
}

keywordDecl = projection_begin text1:textBut text2:(projection_separator t2:textBut {return t2;})? projection_end
{
    return creator.createBoolKeywords({
        "trueKeyword"   : text1,
        "falseKeyword"  : text2,
        "location"      : location()
    });
}

listInfo = t:tableInfo { return t;} / l:listNoTableInfo {return l;}

tableInfo = "table" ws dir:("rows" / "columns")? ws
{
    return creator.createListInfo({
        "isTable"   : true,
        "direction" : creator.createListDirection( {"direction": dir, "location": location() } ),
        "location"  : location()
    });
}
listNoTableInfo =  dir:listDirection? l:(type:listInfoType "[" t:textBut "]" {return { "type": type, "text": t }})? ws
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
