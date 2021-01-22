// This is the definition of the type system of the language
language PlayGroundLanguage

@isType PG_Entity // do we need something like this "@typename : name", or do we demand that a type has an attribute 'name' ??? 
@isType PG_PrimitiveType 
@isType PG_AnyType

@hasType PG_Expression  // is abstract concept, therefore no inference rule

PG_StringLiteralExpression {
    @inferType = PG_PrimitiveType.String
}

PG_NumberLiteralExpression base PG_LiteralExpression {
    @inferType = PG_PrimitiveType.Integer
}

PG_MultiplyExpression base PG_BinaryExpression {
    @inferType = commonSuperType(this.left.type, this.right.type)
}

PG_Variable {
    @constrainType declaredtype of PG_PrimitiveType
}

@conformanceRule 'anyRule' PG_AnyType <= * // meaning that everything conforms to Any

// no need for the following two rules if we test on identity of the type instances
@conformanceRule 'primRule1' PG_PrimitiveType.String !<=>! PG_PrimitiveType.Integer // meaning that Integer does NOT conform to String and vice versa

@conformanceRule 'primRule3' PG_PrimitiveType.Boolean !<=>! PG_PrimitiveType.Integer // meaning that Boolean and Integer do NOT conform to eachother

@conformanceRule 'entityRule1' e1:PG_Entity <= e2:PG_Entity { // meaning that Entity e2 conforms to Entity e1 if the following holds
    e2.inheritsFrom(e1) // needs inheritance relationship between PG_Entities in .lang, this is currently not defined
    or 
    e2.functions.equals(e1.functions) // effectively, only this condition will be tested
}
