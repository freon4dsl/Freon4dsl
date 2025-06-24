# Streamlining the Expressions over the Metamodel

## Current types of expressions

Examples:
```
    notEmpty self.entities;
    in self.entities isunique name;
    validIdentifier; // default is 'name'
    typecheck conformsTo (self.body, self.declaredType);
    typecheck self.body conformsTo self.declaredType;
    typecheck self.body.conformsTo(self.declaredType);
    typecheck equalsType( self.right, #PrimitiveType:Integer )
	typeof( container )
    self.baseEntity
    infertype self.parameter.declaredType;
```

- keyword 'container' to denote parent namespace, (or parent AST node?)
  - may we have "container.prop1.prop2" ?
- self.SOMETHING
- #LimitedType:LimitedInstance
- door-dotten: self.SOMETHING.SOMETHING_ELSE.SOMETHING_DIFFERENT
- "typeof( container )" could be "container.typeof()"
- "conformsTo (self.body, self.declaredType)" could be "self.body conformsTo self.declaredType" (i.e. a binary expression)

## Examples
owner().if(QualifiedName).part ;
self.owner().if(UnitType2).type().if(...)
owner().if(UnitType2);
owner().type().if(UnitType2).import
self.vervoersmiddel.if(Fiets).trapper
#PrimitiveType:Number.value. > (self.vervoersmiddel.if(Fiets).trapper.size)
vervoersmiddel.if(Fiets) . trapper
vervoersmiddel . if( Boot ) . paddel
self.body.conformsTo(self.declaredType);

## Possible FunctionNames

owner() if() type() conformsTo() equalsto() ....

## Translation to typescript

| Freon                   | TypeScript                                                                                                  |
|-------------------------|-------------------------------------------------------------------------------------------------------------|
| self                    | this                                                                                                        |
| owner()                 | this.freOwner()                                                                                             |
| node.owner()            | node.freOwner()                                                                                             |
| node.if(NAME)           | if (FreLanguage.getInstance().metaConformsToType(node, "NAME")) { return node; } else { return undefined; } |
| node.type()             | FreLanguageEnvironment.getInstance().typer.inferType(node)                                                  |
| node1.conformsTo(node2) | FreLanguageEnvironment.getInstance().typer.conformsTo(node1, node2)                                         |
| node1.equalsTo(node2)   | FreLanguageEnvironment.getInstance().typer.equalsTo(node1, node2)                                           |


## New Grammar

```
dottedExpr: name ('(' expression? ')')? dottedApplied?
dottedApplied: '.' dottedExpr
expression: dottedExpr
      | '#' limitedInstance
      | Number
```


## STRUCTURE
Expression {
}

DottedExpression extends Expression {
  start: PropRef | Function | 'self' | ClassifierRef
  appliedDotted: PropRef | Function
}

LimitedRef extends Expression

Simple   extends Expression

ClassifierRef extends Expression

PropertyRef

Function {
name
par: Expression
}





