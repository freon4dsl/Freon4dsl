import * as creator from "../../dist/reader2/Creators.js"
export const simpleGrammarStr: string = `

// rules for "OclPart"
OclPart = ws "package" ws name:identifier
	 OclContext*
	ws "endpackage" ws 
{ 
    return creator.createOclPart({
        name: name,
        parseLocation: location()
    })
}	

// rules for "UmlPart"
UmlPart = UmlPackage ;

UmlPackage = ws "<package>" ws name:identifier
	 ImportedElement*
	 IClassifier*
	ws "<associations>" ws
	 ( __fre_super_Association ";" ws )*
	ws "<endpackage>" ws 
{ 
    return creator.createUmlPackage({
        name: name,
        parseLocation: location()
    })
}	

Association = AssociationEnd ws "<->" ws AssociationEnd ;

AssociationClass = VisibilityKind? ws "<associationclass>" ws identifier
	 AssociationEnd ws "<->" ws AssociationEnd
	 (ws "<attributes>" ws ( Attribute ws ";" ws )* )?
	 (ws "<operations>" ws ( Operation ws ";" ws )* )?
	 (ws "<states>" ws State|.., ";" | )?
	 (ws "<invariants>" ws ( OclExpression ws ";" ws )* )?
	ws "<endassociationclass>" ws ;

AssociationEnd = VisibilityKind? __fre_reference ws "." ws identifier MultiplicityKind? ;

State = ws "State" identifier "\{" 
	ws "subStates" ws
	 State*
	 (ws "visibility" ws VisibilityKind )?
	ws "}" ws ;

DataType = VisibilityKind? ws "<datatype>" ws identifier
	 (ws "<specializes>" ws __fre_reference|.., ","| )?
	 (ws "<implements>" ws __fre_reference|.., ","| )?
	 (ws "<attributes>" ws ( Attribute ws ";" ws )* )?
	 (ws "<operations>" ws ( Operation ws ";" ws )* )?
	 (ws "<states>" ws State|.., ","| )?
	 (ws "<invariants>" ws ( OclExpression ws ";" ws )* )?
	ws "<enddatatype>" ws ;

EnumerationType = VisibilityKind? ws "<enumeration>" ws identifier
	ws "<values>" ws ( EnumLiteral ws ";" ws )*
	ws "<endenumeration>" ws ;

EnumLiteral = identifier ;

PrimitiveType = ws "PrimitiveType" identifier "\{" 
	ws "isAbstract" ws booleanLiteral
	ws "attributes" ws
	 Attribute*
	ws "operations" ws
	 Operation*
	ws "navigations" ws
	 AssociationEnd*
	ws "states" ws
	 State*
	ws "classAttributes" ws
	 Attribute*
	ws "classOperations" ws
	 Operation*
	ws "invariants" ws
   	 OclExpression*
	ws "generalizations" ws
	 __fre_reference*
	ws "subClasses" ws
	 __fre_reference*
	ws "interfaces" ws
	 __fre_reference*
	 (ws "visibility" ws VisibilityKind )?
	ws "}" ws ;

UmlInterface = VisibilityKind? ws "<interface>" ws identifier
	 (ws "<specializes>" ws __fre_reference|.., ","| )?
	 (ws "<attributes>"  ws (Attribute ws ";" ws)* )?
	 (ws "<operations>"  ws (Operation ws ";" ws)* )?
	 (ws "<invariants>"  ws OclExpression|.., ";"| )?
	ws "<endinterface>" ws ;
   
UmlClass = VisibilityKind? ws "<abstract>"? ws "<class>" ws identifier
	 (ws "<specializes>" ws __fre_reference|.., ","| ","? )?
	 (ws "<implements>"  ws __fre_reference|.., ","| ","?)?
	 (ws "<attributes>"  ws attributeList:Attribute|.., ";"| ";"? )?
	 (ws "<operations>"  ws Operation|.., ";"| ";"?)?
	 (ws "<states>"      ws State|.., ";"| ";"?)?
	 (ws "<invariants>"  ws OclExpression|.., ";"| ";"? )?
	ws "<endclass>" ws 
{ console.log("AttributeList: "+ attributeList) }	

ImportedElement = ws "ImportedElement" identifier "\{" 
	ws "element" ws IModelElement
	ws "}" ws ;

StructuralFeature = ws "StructuralFeature" identifier "\{" ws
	 (ws "multiplicity" ws MultiplicityKind )?
	ws "type" ws __fre_reference
	 (ws "visibility" ws VisibilityKind )?
	ws "}" ws ;

IClassifier = AssociationClass 
    / UmlClass 
    / __fre_super_Association 
    / __fre_super_DataType 
    / UmlInterface  ;

IModelElement = EnumLiteral 
    / ImportedElement 
    / UmlPackage 
    / Parameter 
    / Operation 
    / State 
    / __fre_super_StructuralFeature 
    / OclContext 
    / VariableDeclaration  ;

__fre_super_Association = Association 
    / AssociationClass  ;

__fre_super_DataType = DataType 
    / EnumerationType 
    / PrimitiveType  ;

__fre_super_StructuralFeature = StructuralFeature 
    / AssociationEnd 
    / Attribute  ;

// common rules
OclContext = ws "context" ws ModelElementReference
	 OclUsageType ws ":" ws ( Operation ws "=" ws )?
	 ( Attribute ws "=" ws )?
	 OclExpression ;

ModelElementReference = __fre_reference (ws "::" ws __fre_reference )? ;

Operation = VisibilityKind? identifier ws "(" ws Parameter|.., ","| ")" ws (ws ":" ws __fre_reference )?
	 OclPreStatement*
	 OclPostStatement* ;

Parameter = ParameterDirectionKind? identifier ws ":" ws __fre_reference ;

OclPreStatement = ws "pre" ws ( identifier ws ":" ws )?
	 OclExpression ;

IterateExp = ws "IterateExp" ws "\{" 
	ws "isMarkedPre" ws booleanLiteral
	ws "isImplicit" ws booleanLiteral
	ws "result" ws VariableDeclaration
	ws "body" ws OclExpression
	ws "iterators" ws
	 VariableDeclaration*
	ws "source" ws OclExpression
	 (ws "appliedProperty" ws PropertyCallExp )?
	ws "type" ws __fre_reference
	ws "}" ws ;

VariableDeclaration = identifier ws ":" ws __fre_reference (ws "=" ws OclExpression )? ;

IteratorExp = ws "IteratorExp" ws "\{" 
	ws "isMarkedPre" ws booleanLiteral
	ws "isImplicit" ws booleanLiteral
	ws "body" ws OclExpression
	ws "iterators" ws
	 VariableDeclaration*
	ws "source" ws OclExpression
	 (ws "appliedProperty" ws PropertyCallExp )?
	ws "referredIterator" ws __fre_reference
	ws "type" ws __fre_reference
	ws "}" ws ;

ModelPropertyCallExp = ws "ModelPropertyCallExp" ws "\{" 
	ws "isMarkedPre" ws booleanLiteral
	ws "isImplicit" ws booleanLiteral
	ws "source" ws OclExpression
	 (ws "appliedProperty" ws PropertyCallExp )?
	ws "type" ws __fre_reference
	ws "}" ws ;

AttributeCallExp = __fre_reference ;

NavigationCallExp = __fre_reference ;

AssociationClassCallExp = __fre_reference ;

AssociationEndCallExp = __fre_reference ;

OperationCallExp = __fre_reference ws "(" ws OclExpression|.., ","| ws ")" ws ;

IfExp = ws "if" ws OclExpression ws "then" ws OclExpression (ws "else" ws OclExpression )?
	ws "endif" ws ;

LetExp = ws "let" ws VariableDeclaration|.., ","|
	ws "in" ws OclExpression ;

LiteralExp = ws "LiteralExp" ws "\{" 
	ws "isImplicit" ws booleanLiteral
	 (ws "appliedProperty" ws PropertyCallExp )?
	ws "type" ws __fre_reference
	ws "}" ws ;

CollectionLiteralExp = ws "Collection" ws __fre_super_CollectionLiteralPart|.., ","| ;

CollectionLiteralPart = ws "CollectionLiteralPart" ws "\{" ws "}" ws ;

CollectionItem = OclExpression ;

CollectionRange = OclExpression ws ".." ws OclExpression ;

EnumLiteralExp = __fre_reference ;

IntegerLiteralExp = numberLiteral ;

OclStateLiteralExp = __fre_reference ;

OclTypeLiteralExp = __fre_reference ;

PrimitiveLiteralExp = ws "PrimitiveLiteralExp" ws "\{" 
	ws "isImplicit" ws booleanLiteral
	 (ws "appliedProperty" ws PropertyCallExp )?
	ws "type" ws __fre_reference
	ws "}" ws ;

BooleanLiteralExp = booleanLiteral ;

NumericLiteralExp = ws "NumericLiteralExp" ws "\{" 
	ws "isImplicit" ws booleanLiteral ws
	 ("appliedProperty" ws PropertyCallExp )?
	ws "type" ws __fre_reference
	ws "}" ws ;

OclUndefinedLiteralExp = stringLiteral ;

RealLiteralExp = numberLiteral ;

StringLiteralExp = stringLiteral ;

TupleLiteralExp = ws "Tuple" ws VariableDeclaration* ;

OclMessageExp = ws "<" ws OclExpression ws ">^^" ws __fre_reference ws "(" ws OclExpression|.., ","| ws ")" ws ;

UnspecifiedValueExp = ws "UnspecifiedValueExp" ws "\{" ws
	"isImplicit" ws booleanLiteral ws
	 ("appliedProperty" ws PropertyCallExp )?
	ws "type" ws __fre_reference
	ws "}" ws ;

VariableExp = __fre_reference (ws "." ws PropertyCallExp )? ;

OclPostStatement = ws "post" ws ( identifier ws ":" ws )?
	 OclExpression ;

Attribute = VisibilityKind? identifier MultiplicityKind? ws ":" ws __fre_reference ws
	 ("init" ws OclStatement )?
	 ("derive" ws OclStatement )? 
{ console.log( "TRUE" ) }	 

OclStatement = ( identifier ws ":" ws )?
	 OclExpression ;

MultiplicityKind = ws "[" ws numberLiteral (ws ".." ws UpperBound )? ws "]" ws ;

NumberUpperBound = numberLiteral ;

StarUpperBound = ws "*" ws ;

OclExpression = SingleOclExpression 
    / __fre_binary_OclExpression ;

SingleOclExpression = IfExp 
    / LetExp 
    / __fre_super_LiteralExp 
    / OclMessageExp 
    / UnspecifiedValueExp 
    / VariableExp 
    / PropertyCallExp ;
    
PropertyCallExp = LoopExp 
    / __fre_super_ModelPropertyCallExp  ;

LoopExp = IterateExp 
    / IteratorExp  ;

UpperBound = NumberUpperBound 
    / StarUpperBound  ;

__fre_super_ModelPropertyCallExp = ModelPropertyCallExp 
    / AttributeCallExp 
    / __fre_super_NavigationCallExp 
    / OperationCallExp  ;

__fre_super_NavigationCallExp = NavigationCallExp 
    / AssociationClassCallExp 
    / AssociationEndCallExp  ;

__fre_super_LiteralExp = LiteralExp 
    / CollectionLiteralExp 
    / EnumLiteralExp 
    / OclStateLiteralExp 
    / OclTypeLiteralExp 
    / __fre_super_PrimitiveLiteralExp 
    / TupleLiteralExp 
    / IntegerLiteralExp 
    / RealLiteralExp 
    / StringLiteralExp  ;

__fre_super_CollectionLiteralPart = CollectionLiteralPart 
    / CollectionItem 
    / CollectionRange  ;

__fre_super_PrimitiveLiteralExp = PrimitiveLiteralExp 
    / NumericLiteralExp 
    / BooleanLiteralExp 
    / OclUndefinedLiteralExp  ;

__fre_binary_OclExpression = SingleOclExpression __fre_binary_operator OclExpression ;
__fre_binary_operator = ws "and" ws /ws "or" ws /ws "==" ws /ws "*" ws /ws "+" ws /ws "-" ws /ws "/" ws /ws "<" ws /ws ">" ws ;

ParameterDirectionKind = ws "<in>" ws
	/ws "<out>" ws
	/ws "<inout>" ws ;

VisibilityKind = ws "+" ws
	/ws "-" ws
	/ws "#" ws ;

OclUsageType = ws "inv" ws
	/ws "pre" ws
	/ws "post" ws
	/ws "init" ws
	/ws "derive" ws
	/ws "body" ws
	/ws "def" ws ;
	
//
// Rule for references 
//

__fre_reference = ref:identifier|1..,"::"| { console.log(ref.join("")); }; 

//
// Rules for primitive values
//

identifier     "identifier" 
    = ws first:[a-zA-Z_] rest:[a-zA-Z0-9_]* ws { return first + rest.join(""); }
numberLiteral  "number"     
    = ws all:[0-9]+ ws { return all.join(""); }
booleanLiteral "boolean"    
    = ws "false" ws { return false }
    / ws "true" ws { return true }
stringLiteral  "string"     
    = ws quotation_mark chars:char* quotation_mark ws { return chars.join(""); }

//
// Basic rules for text, escaped and unescaped
//

char
  = unescaped
  / escape
    sequence:(
        '"'
      / "\\\\"
      / "/"
      / "b" { return "\\b"; }
      / "f" { return "\\f"; }
      / "n" { return "\\n"; }
      / "r" { return "\\r"; }
      / "t" { return "\\t"; }
      / "u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG) {
          return String.fromCharCode(parseInt(digits, 16));
        }
    )
    { return sequence; }

escape
  = "\\\\"

quotation_mark
  = '"'

unescaped
  = [^\\0-\\x1F\\x22\\x5C]

DIGIT  = [0-9]
HEXDIG = [0-9a-f]i
  
//
// Basic rules for whitespace and comments
//	 

ws  "whitespace"            
  = ([ \\t\\n\\r] 
  / SingleLineComment 
  / MultiLineComment )*
  
Comment "comment"
  = MultiLineComment
  / SingleLineComment

MultiLineComment
  = "/*" (!"*/" SourceCharacter)* "*/"

SingleLineComment
  = "//" (!LineTerminator SourceCharacter)*

SourceCharacter
  = .  

LineTerminator "end of line"
  = [\\n\\r\\u2028\\u2029]
` ;
