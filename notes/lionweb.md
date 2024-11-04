### LionWeb

- how to integrate built-ins
    - [x] as a std library in Freon?

- Freon CLI tool
- [x] Needs other import syntax for AGL because it is commonjs ?!?!
- [ ] See Cli in lionweb-freon for a LionWeb Language => Freon converter.
- [ ] Create Freon language to LionWeb converter

- Import metamodel 
    - [x] Use M3 language deserializer, unparse in memory and generate .ast files
    - [x] write projection to enable editing and nice syntax for metamodels.

- [ ] Errors coming from server should be checked and shown to the user.

#### Incompatibilities

- [ ] Freon alows multi-valued primitive properties, LionWeb does not
  - [ ] Option 1: remove them from Freon
  - [ ] Option 2: map to some Freon defined LionWeb structure (and map back)
- [ ] LonWeb has introduced DataType in the M3, Freon does not have it yet
    - [ ] Option 1: Add DataType to Freon
    - [ ] Option 2: map to Freon copncept and (harder) map it back
- [ ] LionWeb has annotations, Freon does not yet
- [ ] LionWeb has node id's, Freon only secondary
  - [ ] M2: Look at `id.json` and see how it can be improved.
  - [ ] M1: $id vs id
    - [ ] $id should be optionally visible and editable in the editor
    - [ ] editable mainly for meta models.
    - [ ] as part of the .edit?
    - [ ] or generically ... but how?
