### LionWeb

- how to integrate built-ins
    - [x] as a std library in Freon?

- Freon CLI tool
- [x] Needs other import syntax for AGL because it is commonjs ?!?!
- [ ] See Cli in lionweb-gfreon for a LionWeb Language => Freon converter.
- [ ] Create Fren lanmgauge to LionWeb converter

- Import metamodel 
    - [x] Use M3 language deserializer, unparse in memory and generate .ast files
    - [x] write projection to enable editing and nice syntax for metamodels.

#### Incompatibilities

- [ ] Freon alows multi-valued primitive properties, LionWeb does not
  - [ ] Option 1: remove them from Freon
  - [ ] Option 2: map to some Freon defined LionWeb structure (and map back)
- [ ] LonWeb has introduced DataType in the M3, Freon does not have it
    - [ ] Option 1: Add DataType to Freon
    - [ ] Option 2: map to Freon copncept and (harder) map it back
- 
- [ ] LionWeb has node id's, Freon only secondary
  - [ ] M2: Look at `id.json` and see how it can be improved.
  - [ ] M1: $id vs id
    - [ ] $id should be optionally visible and editable in the editor
    - [ ] editable mainly for meta models.
    - [ ] as part of the .edit?
    - [ ] or generically ... but how?
