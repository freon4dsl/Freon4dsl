### LionWeb

- how to integrate built-ins
    - [x] as a std library in Freon?

### Freon CLI tool
- [x] See Cli in lionweb-freon for a LionWeb Language => Freon converter.
- [x] Create Freon language => LionWeb converter
      Done in branch 'lionweb-integration'

- Import metamodel 
  - [x] Use M3 language deserializer, unparse in memory and generate .ast files
  - [x] write projection to enable editing and nice syntax for metamodels.

### Incompatibilities

### ModelUnits

- [ ] In Freon a modeluin cannit imple,ent interfaces or have a base concept, in LionWeb a partition can have those.
  - [ ] Solution is to allow these in Freon, seems straightforward, as modelunits are almost the same as concepts anyway (**chosen**)

### Names
- [ ] Names in Freon should be identifiers, LionWeb allows almost anything as name.
  - [ ] Should allow wider name syntax, using e.g. quotes 'this is a name' as delimiters in the parser.
- [ ] Freon requires a `name: identifier` property to allow a reference to a concept. LionWeb does not.
  - [ ] Make Freon name/id or both supported for references.

#### Primitive Types
- [ ] Freon allows multi-valued primitive properties, LionWeb does not
  - [ ] Option 1: remove them from Freon (**Chosen**)
  - [ ] Option 2: map to some Freon defined LionWeb structure (and map back)
- [ ] Primitive properties can be optional in LionWeb, not in Freon
- [ ] LionWeb has introduced _Structured DataType_ in the M3, 
      Freon does not have it
    - Option 1: Add Structured DataType to Freon (**Chosen**)
    - Option 2: map to Freon concept and (harder) map it back
      - Need to avoid reference to DataTypes
        - Maybe forbid "name: identifier" property
        - Check for (in)direct loops 
      - Problem 2-way: LionWeb.dataType => Freon.Concept => LionWeb.Concept
- [ ] LionWeb has PrimitiveType, Freon does not (explicitly),
      so in LionWeb you can define new PrimitiveTypes in a language
    - [ ] Add this to Freon
    - [ ] Define some kind of mapping
- LionWeb allows new PrimitiveTypes to be defined in a language, Freon does not
    - Such a new primitive type can be used as the type of a property in the same language,
      there is no obvious way to do this in Freon (should be allowed in the .ast file)
    - Potentially define a CustomPrimitiveType limited concept and map a LionWeb PrimitiveType
      to a member of CustomPrimitiveType

#### Annotations
- [ ] LionWeb has annotations, Freon does not yet 
    - [ ] Add them to Freon, needed for e.g. diagrams (**chosen**)

#### Node Id's
- [ ] LionWeb has node id's, Freon only secondary (cleanup)
  - [x] M2: Look at `id.json` and see how it can be improved.
  - [ ] M1: $id vs id
    - [ ] $id should be optionally visible and editable in the editor?
    - [ ] editable mainly for meta models. See e.g. lioncore-freon
    - [ ] as part of the .edit?
    - [ ] or generically ... but how?

#### Languages
- [ ] Multiple languages
    - [ ] Hacky partial support in Freon, needs redesign
- [ ] Most LionWeb tools can work without language definition,
      should Freon also allow this? **Answer: no**.
- [ ] Language in LionWeb has a 'version', in Freon it has not.

#### Standard Libraries
Freon has an explicit notion of standard library, where e.g. limited values are kept.
LionWeb has no such thing defined, although it can be done in LionWeb by providing a model with the predefined elements.
- Current;ly needs to generate a "stdlib" M1 model with each metamodel.

#### Enumerations vs Limiteds
Enumerations in LionWeb are DataTypes, in Freon Limiteds are concepts.

- [ ] Option 1
   - Map limited to Concept in LionWeb
   - Map Enumeration to Limited in LionWeb
   - Problem 2-way: LionWeb.Enumeration => Freon.Limited => LionWeb.Concept
     Can be solved by smart (de)serializer from/to LionWeb
     (** Probably best solution**)

- [ ] Option 2
   - Simplify Limited to Enumeration in Freon (**Alternative Solution**)

### Other?
