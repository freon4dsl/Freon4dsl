PrimitivesTest someName {
prim 
    Prim {
        primIdentifier EenNaam
        primNumber 19
        primString "TEKST"
        primBoolean true
        primListIdentifier EenNaam, NogEenNaam, EnNogEen
        primListNumber 10 , 20
        primListString "TEKST" , "TEKST"
        primListBoolean true, false, true, false
        }
primExtra
    bef"ore EenNaam after
    be[fore 45 after
    bef/ore "TEKST" after
    bef${ore false  after
    bef(ore EenNaam , NogEenNaam, EnNogEen after
    bef]ore 67 , 98  after
    before "TEKST", "TEXT"  after
    before false, true, false  after
primOpt PrimOptional {
    // primIdentifier not present
	// primNumber not present
	// primString not present
	// primBoolean not present
    // primListIdentifier not present
	// primListNumber not present
	// primListString not present
	// primListBoolean not present
	}
primExtraOpt PrimExtraOptional // not present
primOptPresent PrimOptional {
    // primIdentifier not present
	// primNumber not present
	// primString not present
	// primBoolean not present
    // primListIdentifier not present
	// primListNumber not present
	// primListString not present
	// primListBoolean not present
	}
primExtraOptPresent PrimExtraOptional
    before EenNaam after
    before 45 after
    before "TEKST" after
    before false  after
    before EenNaam , NogEenNaam, EnNogEen after
    before 67 , 98  after
    before "TEKST", "TEXT"  after
    before false, true, false  after
separator PrimOptionalSeparator 
    before EenNaam , NogEenNaam, EnNogEen after
	before 56, 67, 78 after
	before "iets", "wat" after
	before true, false after
terminator PrimOptionalTerminator
    before EenNaam ! NogEEN ! EnNogEeen ! after
	before 30 ! 40 ! 50 ! 60 ! after
	before "iets" ! "wat" !  after
	before true! false! true! false!	 after
}
