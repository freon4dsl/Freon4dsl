export const old_grammar = `
namespace OctopusLanguage
grammar OldOne {

// white space and comments
skip WHITE_SPACE = "\\s+" ;
skip SINGLE_LINE_COMMENT = "//[^\\r\\n]*" ;
skip MULTI_LINE_COMMENT = "/\\*[^*]*\\*+(?:[^*/][^*]*\\*+)*/" ;
        
/*********************************************************************
 *
 *      Start of Model grammar.
 *
 *********************************************************************/
Package =
    '<package>' identifier  ( '<import>' PathName  ';' )*
    Classifier*
    Associations
    '<endpackage>' ;

Association = ( '/'? (identifier ':')? AssociationEnd ( '<->' | '->' | '<-' | '-' ) AssociationEnd ) | Associationclass ;

// Any name may be prefixed by "<name> ::" many times.
PathName = [ identifier / '::' ]* ;

VisibilityKind =
    '+' | 
    '-' | 
    '#' ;

Classifier =
        VisibilityKind?     
        ('<abstract>')?     
        ('<<' Stereotype '>>')?    
    ( Class     
      | Datatype    
      | Interface    
      | Associationclass    
      | Enumtype     
    );

Stereotype = identifier ;

Class =
    '<class>' identifier ( '(' identifier ')' )?
        ('<specializes>' [ PathName / ',' ]*)?        
        ('<implements>'  [ PathName / ',' ]*)?     
        ('<attributes>'  Attribute*)?    
        ('<operations>'  Operation*)?    
        ('<states>'      State*    )?       
        ('<invariants>'  Invariant*)?   
    '<endclass>' ;

Datatype =
    '<datatype>' identifier
        ('<specializes>' [ PathName / ',' ]*)?        
        ('<implements>'  [ PathName / ',' ]*)?            
        ('<attributes>'  Attribute*)?    
        ('<operations>'  Operation*)?    
        ('<invariants>'  Invariant*)?   
    '<enddatatype>' ;

Interface =
    '<interface>' identifier ( '(' identifier ')' )?    
        ('<specializes>' [ PathName / ',' ]*)?        
        ('<implements>'  [ PathName / ',' ]*)?             
        ('<attributes>'  Attribute*)?    
        ('<operations>'  Operation*)?    
        ('<invariants>'  Invariant*)?   
    '<endinterface>' ;

Associationclass =
   '<associationclass>' identifier 
    AssociationEnd
      ( '<->' | '->' | '<-' | '-' )
    AssociationEnd 
        ('<attributes>'  Attribute*)?    
        ('<operations>'  Operation*)?    
        ('<states>'      State*    )?       
        ('<invariants>'  Invariant*)?          
    '<endassociationclass>' ;

Enumtype =
    '<enumeration>' identifier
      '<values>' ( identifier ';' )*
    '<endenumeration>' ;

Attribute =
    VisibilityKind?    
    '$'? // has class scope     
    '/'? // derivation    
    identifier Multiplicity? ':' TypeName  ';'
    ('init' identifier ':' OCL)?
    ('derive' identifier ':'OCL)? ;

Operation =
    VisibilityKind?    
    '$'? // has class scope      
    '<abstract>'? // is abstract    
    ( identifier | 'infix' ( ModelOperator | identifier ) )
    '(' [ Parameter / ',' ]*  ')' (':' TypeName)? ';'
    ( 'pre'  identifier ':' OCL )*
    ( 'post' identifier ':' OCL )* ;

Parameter = Direction identifier ':' TypeName ;

ModelOperator =
    '-' | '+' | '/' | '<' | '>' | '<=' | '>=' | '=' | '<>' | '*' ;

Direction =
    '<in>' | '<out>' | '<inout>' ;

Associations =
    '<associations>'
    ( '/'? (identifier ':')? AssociationEnd ( '<->' | '->' | '<-' | '-' ) AssociationEnd ';' )* ;

AssociationEnd =
    VisibilityKind?
    '$'? // { hasClassScope = true; }    
    PathName '.' identifier? // optional rolename
    Multiplicity?
    '<ordered>'?    
    '<notUnique>'?    
    ( '<composite>' | '<aggregate>' )? ;

Multiplicity =
    '[' numberLiteral '..' ( numberLiteral | '*' ) ']' ;

State = PathName ';' ;

Invariant = OCL ; 

ClassifierReference  = TypeName ;

TypeName = PathName 
     ( '(' TypeName ')' )? ; // a type parameter 


/** Parse the text of an OCL expression without checking it.
 *  This allows for incorrect OCL expressions to be read and written.
 */
//OCL = '<ocl>' AnyText '</ocl>' ;
OCL = '<ocl>' stringLiteral '</ocl>' ;

// the predefined basic types   
leaf identifier          = "[a-zA-Z_][a-zA-Z0-9_]*" ;
/* see https://stackoverflow.com/questions/37032620/regex-for-matching-a-string-literal-in-java */
leaf stringLiteral       = '"' "[^\\"\\\\]*(\\\\.[^\\"\\\\]*)*" '"' ;
leaf numberLiteral       = "[0-9]+";
leaf booleanLiteral      = 'false' | 'true';
}`;
