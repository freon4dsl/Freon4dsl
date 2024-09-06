export const OctopusModelGrammarStr: string = `
// rules for "OclPart"
OclPart = ws "package" ws identifier
	 OclContext*
	ws "endpackage" ws ;

// rules for "UmlPart"
UmlPart = UmlPackage ;

UmlPackage = ws "<package>" ws identifier
	 ImportedElement*
	 IClassifier*
	ws "<associations>" ws
	 ( __fre_super_Association ";" ws )*
	ws "<endpackage>" ws ;

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
	 (ws "<attributes>"  ws Attribute|.., ";"| )?
	 (ws "<operations>"  ws Operation|.., ";"| )?
	 (ws "<invariants>"  ws OclExpression|.., ";"| )?
	ws "<endinterface>" ws ;

UmlClass = VisibilityKind? ws "<abstract>"? ws "<class>" ws identifier
	 (ws "<specializes>" ws __fre_reference|.., ","| )?
	 (ws "<implements>"  ws __fre_reference|.., ","| )?
	 (ws "<attributes>"  ws Attribute|.., ";"| )?
	 (ws "<operations>"  ws Operation|.., ";"| )?
	 (ws "<states>"      ws State|.., ";"| )?
	 (ws "<invariants>"  ws OclExpression|.., ";"| )?
	ws "<endclass>" ws ;

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
	 ("derive" ws OclStatement )? ;

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

__fre_reference = identifier|1..,"::"| ; 

identifier     "identifier" = ws [a-zA-Z_][a-zA-Z0-9_]* ws ;
numberLiteral  "number"     = ws [0-9]+ ws;
booleanLiteral "boolean"    = ws "false" ws / ws "true" ws;
stringLiteral  "string"     = ws quotation_mark chars:char* quotation_mark ws { return chars.join(""); }

char
  = unescaped
  / escape
    sequence:(
        '"'
      /"\\\\"
      /"/"
      /"b" { return"\b"; }
      /"f" { return"\f"; }
      /"n" { return"\n"; }
      /"r" { return"\r"; }
      /"t" { return"\t"; }
      /"u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG) {
          return String.fromCharCode(parseInt(digits, 16));
        }
    )
    { return sequence; }

escape
  ="\\\\"

quotation_mark
  = '"'

unescaped
  = [^\\0-\\x1F\\x22\\x5C]


// ----- Core ABNF Rules -----

// See RFC 4234, Appendix B (http://tools.ietf.org/html/rfc4234).
DIGIT  = [0-9]
HEXDIG = [0-9a-f]i

ws  "whitespace"            = ([ \\t\\n\\r] / SingleLineComment / MultiLineComment )*
rws "required whitespace"   = ([ \\t\\n\\r] / SingleLineComment / MultiLineComment )+

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
