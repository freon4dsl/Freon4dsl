PrimitivesTest someName
prim 
    Prim  
        primNumber 19
        primString "stringLiteral"  
        primBoolean true  
        primListNumber 10 , 20  
        primListString "stringLiteral" , "stringLiteral"  
        primListBoolean true, false, true, false
primExtra 
    before 45 after
    before "stringLiteral" after
    before false  after
    before 67 , 98  after
    before "stringLiteral", "/ , ]*"  after
    before false, true, false  after
primOpt PrimOptional 
	primNumber // not present
	primString // not present
	primBoolean // not present
	primListNumber // not present
	primListString // not present
	primListBoolean // not present
primExtraOpt PrimExtraOptional // not present
primOptPresent PrimOptional
	primNumber // not present
	primString // not present
	primBoolean // not present
	primListNumber // not present
	primListString // not present
	primListBoolean // not present
primExtraOptPresent PrimExtraOptional
    before 45 after
    before "stringLiteral" after
    before false after
    before 67 , 98 after
    before "stringLiteral", "/ , ]*" after
    before false, true, false after
