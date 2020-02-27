// This is the definition of the type system of the language
language PlayGroundLanguage

@isType PG_Entity 
@isType PG_PrimitiveType 
@isType PG_AnyType

@hasType PG_Expression  // is abstract concept, therefore no inference rule

PG_Variable {
    @constrainType declaredtype of PG_PrimitiveType
}

PG_StringLiteralExpression {
    @inferType = PG_PrimitiveType.String
}

PG_NumberLiteralExpression base PG_LiteralExpression {
    @inferType = PG_PrimitiveType.Integer
}

PG_MultiplyExpression base PG_BinaryExpression {
    @inferType = commonSuperType(this.left.type, this.right.type)
}

@conformsToRule 'anyRule' PG_AnyType <= * // meaning that everything conforms to Any

@conformsToRule 'primRule1' PG_PrimitiveType.String !<=>! PG_PrimitiveType.Integer // meaning that Integer does NOT conform to String and vice versa

@conformsToRule 'primRule3' PG_PrimitiveType.Boolean !<=>! PG_PrimitiveType.Integer // meaning that Boolean and Integer do NOT conform to eachother

@conformsToRule 'entityRule1' e1:PG_Entity !<= e2:PG_Entity { // meaning that Entity e2 conforms to Entity e1 if the following holds
    e2.inheritsFrom(e1) or e2.functions.equals(e1.functions)
}