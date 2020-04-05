// This is a partial grammar file
// Needs to be concatenated with the Basic and Expression grammars
// The neccesary require statements for all grammars should be defined here
{
    let create = require("./PiTyperCreators");
    let expCreate = require("../../languagedef/parser/LanguageExpressionCreators");
}

Typer_Definition
  = ws "typer" ws name:var ws "for" ws "language" ws languageName:var ws tr:(typerRule)*
    {
       return create.createTyperDef({
           "name": name,
           "languageName": languageName,
           "typerRules": tr,
       });
    } 

isTypeKey     = "istype" ws
inferenceKey  = "infertype" ws
conformsKey   = "conformsto" ws
equalsKey     = "equalsto" ws
anyKey        = "anytype" ws { return true; }
superTypeKey  = "commonSuperType" ws
abstractKey   = "abstract" ws { return true; }

typerRule = itr:isTypeRule   { return itr; }
          / any:anyTypeRule  { return any; }
          / other:otherRule  { return other; }

isTypeRule = isTypeKey curly_begin types:(
      head:conceptRef
      tail:(comma_separator v:conceptRef { return v; })*
      { return [head].concat(tail); }
    ) curly_end 
{
  return create.createIsType({
    "types":types
  })
}

anyTypeRule = anyKey curly_begin statements:statement* curly_end 
{
  return create.createAnyTypeRule( {
    "statements":statements
  })
}

otherRule = conceptRef:conceptRef curly_begin statements:statement* curly_end
{
  return create.createConceptRule( {
    "conceptRef": conceptRef,
    "statements": statements
  })
}

statement = conformsKey:conformsKey exp:langRefExpression
{
  return create.createStatement({
    "statementtype": "conformsto",
    "exp": exp,
    "isAbstract": false
  })
}            
            / equalsKey:equalsKey exp:langRefExpression
{
  return create.createStatement({
    "statementtype":"equalsto",
    "exp": exp,
    "isAbstract": false
  })
}            
            / abs:abstractKey? inferenceKey:inferenceKey exp:langRefExpression?
{
  return create.createStatement({
    "statementtype":"infertype",
    "exp": exp,
    "isAbstract": (!!abs)
  })
}            

