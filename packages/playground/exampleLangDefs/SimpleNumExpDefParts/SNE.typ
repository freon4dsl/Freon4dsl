// This file specifies the validation of the SimpleNumericExpressions language
// This language only knows five types of expression:
// * plus ("25+86")
// * minus ("68-72")
// * multiply ("5*86")
// * divide ("4/2")
// * negate ("-45")

// The user of this library should provide SNE_LiteralExpression subtypes for the library to function.
// If these subthese are not numeric, the user should override the behavior of this library.

language SimpleNumericExpressions

if (ROOTMODULE.Expression.hasType) [
    REQUIRE SNE_LiteralExpression.hasType

    SNE_MultiplyExpression {
        @inferType = commonSuperType(this.left.type, this.right.type)
    }

    SNE_PlusExpression {
        @inferType = commonSuperType(this.left.type, this.right.type)
    }

    SNE_MinusExpression {
        @inferType = commonSuperType(this.left.type, this.right.type)
    }

    SNE_DivideExpression {
        @inferType = commonSuperType(this.left.type, this.right.type)
    }

    SNE_NegateExpression {
        @inferType = this.inner.type
    }

]
