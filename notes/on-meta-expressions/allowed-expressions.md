# New expressions over the metamodel

enclosing concept = concept for which the expression is defined

## self

Error 1 only at start of expression
Error 2 should be followed by dot-expression

Result: `this`

## variable

Error 3 no previous, var should be known in enclosing concept or as classifier
Error 3 with previous, var should be known in type(previous) or as classifier

Result: 
if refers to classifier: `var`
or
if refers to property: 
    `this.var` 
    or 
    `toTS(previous).var` (!previous.isList)
    or 
    `toTS(previous).flatten().var` (previous.isList)

## type()

Error 4 should NOT be followed by dot-expression
Error 5 previous should not be a list

no previous ==> `typer.inferType( this )`
with previous ==> `typer.inferType( toTS(previous) )` (!previous.isList)
or
`toTS(previous).map(prev => typer.inferType(prev))` (previous.isList)

## if(X)

Error 6 X should be a subtype of type(previous) or enclosing concept
Error 7 When previous is `owner()`, X may be any in the set of possible owners (what about their subtypes?)

no previous ==> `(this as X)`
with previous ==> 
    `(toTS(previous) as X)` (!previous.isList)
or
    `toTS(previous).filter(x => x instanceof X) ` (previous.isList)

## owner()

no previous ==> `this.freOwner()`
with previous ==> `toTS(previous).freOwner()` (!previous.isList)
or
`toTS(previous).map(prev => prev.freOwner())` (previous.isList)
