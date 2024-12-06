### LionWeb

- how to integrate built-ins
    - [x] as a std library in Freon?

### Freon CLI tool
- [x] Needs other import syntax for AGL because it is commonjs ?!?!
- [x] See Cli in lionweb-freon for a LionWeb Language => Freon converter.
- [ ] Create Freon language => LionWeb converter

- Import metamodel 
  - [x] Use M3 language deserializer, unparse in memory and generate .ast files
  - [x] write projection to enable editing and nice syntax for metamodels.

- [ ] Errors coming from server should be checked and shown to the user.

#### Incompatibilities

- [ ] Freon alows multi-valued primitive properties, LionWeb does not
  - [ ] Option 1: remove them from Freon (Chosen)
  - [ ] Option 2: map to some Freon defined LionWeb structure (and map back)
- Primitive properties can be optional in LionWeb, not in Freon
- [ ] LionWeb has introduced DataType in the M3, Freon does not have it yet
    - [ ] Option 1: Add DataType to Freon (Chosen)
    - [ ] Option 2: map to Freon copncept and (harder) map it back
- [ ] LionWeb has annotations, Freon does not yet (Add them, needed for e.g. diagrams)
- [ ] LionWeb has node id's, Freon only secondary (cleanup)
  - [ ] M2: Look at `id.json` and see how it can be improved.
  - [ ] M1: $id vs id
    - [ ] $id should be optionally visible and editable in the editor
    - [ ] editable mainly for meta models.
    - [ ] as part of the .edit?
    - [ ] or generically ... but how?
- [ ] Multiple languages
  - [ ] Hacky support in Freon, needs redesign
- [ ] Most LionWeb tools can work without language definition, should Freon also allow this? Answer: no.
