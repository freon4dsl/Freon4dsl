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
	primNumber
	primString
	primBoolean
	primListNumber
	primListString
	primListBoolean
primExtraOpt PrimExtraOptional
primOptPresent PrimOptional
	primNumber
	primString
	primBoolean
	primListNumber
	primListString
	primListBoolean
primExtraOptPresent PrimExtraOptional
    before 45 after
    before "stringLiteral" after
    before false after
    before 67 , 98 after
    before "stringLiteral", "/ , ]*" after
    before false, true, false after
