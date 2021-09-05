###analyse van .edit voor parser generation

1. parser per unit => 
   a. vind alle classifiers die in unit horen, dus ook alle concepts en interfaces die 
   alleen als type van props voorkomen
   b. vind voor al deze classifiers de bijbehorende edit def
   c. vind alle limited concepts waarnaar gerefereerd kan worden. Deze hoeven niet 
   geparsed te worden, maar refs naar instances wel.

Ga dan de edit defs af en kijk naar hun concept:
2. model && limited concepts kunnen niet geparser worden => 
   do nothing
    Note: refs naar limited instances moeten wel geparsed worden
3. alle binary expressions op een hoop gooien (Note: er hoeft geen 
   superklasse te zijn voor alle bin exps!!!)
   => zowel aparte grammar, als syntax anal, wel andere sem anal
   => neem aanroep van deze regel op bij elk voorkomen van bin exp, zowel
   als subklasse, als ook type van prop (in syn anal is typecast nodig???)
   => als er geen base bin exp is, dan is waarschijnlijk een extra 
   TS type def nodig: anyBinExp.
4. voor alle abstracte klassen een choice rule maken
5. alle klassen met subklassen krijgen keuze uit subklassen 
   of concrete edit def (extra laag in syn anal nodig)

Concrete edit def => per item:
6. PiEditProjectionText => als keyword opnemen
7. PiEditPropertyProjection => aanroep van grammar rule, in syn anal prop zetten
8. PiEditSubProjection
9. PiEditInstanceProjection => als keyword opnemen, maar wel in syn anal de juiste prop zetten

Subprojecties =>
6.  
