// This file contains the grammar which is input to the AGL parser.

export const grammarStr: string = `
    namespace test
grammar SimpleExample {
ExModel = "model" variable "{"
    (Entity)*
    "model" "wide" "Methods:"
    MethodList2
    "}" ;

Entity = "Entity" variable ("base" EntityPiElemRef )? "{"
    AttributeList3
    MethodList4
    "}" ;

Attribute = variable ":" TypePiElemRef; 

Method = "method" variable "(" ParameterList5 "):" TypePiElemRef "{" 
    ExExpression 
    "}" ;

ExExpression = LiteralExpression 
    | AbsExpression 
    | ParameterRef 
    | LoopVariableRef 
    | SumExpression 
    | MethodCallExpression 
    | IfExpression 
    | BinaryExpression ;

LiteralExpression = StringLiteralExpression 
    | NumberLiteralExpression 
    | BooleanLiteralExpression ;

StringLiteralExpression = "'" stringLiteral "'" ;

AppliedFeature = AttributeRef ;

AttributeRef = AttributePiElemRef ;

NumberLiteralExpression = stringLiteral ;

BooleanLiteralExpression = stringLiteral ;

AbsExpression = "abs(" ExExpression ")" ;

ParameterRef = ParameterPiElemRef "." AppliedFeature ;

LoopVariableRef = LoopVariablePiElemRef ;

SumExpression = "sum" "from" LoopVariable "=" ExExpression "to" ExExpression "of" ExExpression;

LoopVariable = variable;

MethodCallExpression = "CALL" MethodPiElemRef "(" ExExpressionList6 ")" ;

IfExpression = "if" "(" ExExpression ")" "then" 
    ExExpression
    "else" 
    ExExpression
    "endif";

BinaryExpression = MultiplyExpression
    | PlusExpression
    | DivideExpression
    | AndExpression
    | OrExpression 
    | ComparisonExpression;

MultiplyExpression = "(" ExExpression "*" ExExpression ")";
    
PlusExpression = "(" ExExpression "+" ExExpression ")";
    
DivideExpression = "(" ExExpression "|" ExExpression ")";
    
AndExpression = "(" ExExpression "and" ExExpression ")";
    
OrExpression = "(" ExExpression "or" ExExpression ")";
    
ComparisonExpression = LessThenExpression 
    | GreaterThenExpression
    | EqualsExpression;

LessThenExpression = "(" ExExpression "<" ExExpression ")";
    
GreaterThenExpression = "(" ExExpression ">" ExExpression ")";

EqualsExpression = "(" ExExpression "==" ExExpression ")";
    
Parameter = variable  ":"  TypePiElemRef;

EntityPiElemRef = variable;

TypePiElemRef = variable;

AttributePiElemRef = variable;

ParameterPiElemRef = variable;

LoopVariablePiElemRef = variable;

MethodPiElemRef = variable;

MethodList2 = Method*;

AttributeList3 = Attribute*;

MethodList4 = Method*;

ParameterList5 = [Parameter / ',']*; // comma-separated list

ExExpressionList6 = [ExExpression / ',']*; // comma-separated list

varLetter           = "[a-zA-Z]";
identifierChar      = "[a-zA-Z0-9_$]"; 

number              = "[0-9]";

variable            = varLetter identifierChar*;
leaf DOUBLE_QUOTE_STRING = "[\\"][^\\"]*[\\"]" ;
leaf SINGLE_QUOTE_STRING = "['][^']*[']" ;

leaf stringLiteral       = DOUBLE_QUOTE_STRING | SINGLE_QUOTE_STRING;
leaf numberLiteral       = number+;
leaf booleanLiteral      = "false"
                    | "true";

// TODO see whether the stuff under LINE can be replaced by
    skip leaf WHITESPACE = "\s+" ;
	skip leaf MULTI_LINE_COMMENT = "/\*[^*]*\*+(?:[^*/][^*]*\*+)*/" ;
	skip leaf SINGLE_LINE_COMMENT = "//.*?$" ;

}
`;
