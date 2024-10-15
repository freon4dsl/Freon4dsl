### Language definition
- [ ] Check toevoegen: iets dat van expression overerft moet ook expression zijn. Idem voor binary exp.
- [ ] Een veelvoorkomend patroon is dat je een lijst heb van dingen die je wel gemixed wilt kunnen projecteren/parsen, maar die je apart van elkaar wilt opslaan. Een voorbeeld is in pi-languages de concepten en interfaces. Het is wel zo dat beide overerven van classifier, maar je wilt 2 aparte lijsten hebben, 1 met concepten en 1 met interfaces. En misschien willen we zelfs wel meerdere lijsten hebben: expression concepts, bin exp concepts, etc. Hoe gaan we hiermee om?
- [ ] Oplossing voor voorgande?: Willen we ook “derived” properties? B.v. in Octopus heb je het concept CollectionType, de props ‘isSet’ etc. geven info over het metatype.
         concept CollectionType base DataType implements IType {
         elementType: IType;
         metatype: CollectionMetaType;
         //    isSet: boolean;
         //    isOrderedSet: boolean;
         //    isBag: boolean;
         //    isSequence: boolean;
         }

- [ ] what about default values for non-primitives? E.g. in octopus the default for multiplicity is [1..1]. We cannot express that at the moment. Or, a default for visibility, when it is defined as:
  interface IPackagableElement base IModelElement {
  visibility: VisibilityKind;
  }

### FreLanguage Composition

- [ ] Separate compilation of languages
    - Hard, because much is generated as 1 blob for full language.
- [ ] Separate languages in separate folders (does not work yet)
    - One language per folder?
    - One overall Model per project?
        - specifies languages to use (i.e. pointing to folder)
        - specifies modelunits used in the language
        - specifies the concept (not) used in the project
        - generates the project Environment/Configuration
    - Languages may reside in folders further away? (reuse)
        - Need generated and custom code for reuse, hard to setup in JS/TS environment.
            - Especially if certain concepts are not used. Should the custom code for these also be removed?
        - Need to package reused language as npm package?
- [ ] Make Scoper composite
- [ ] FreLanguageEnvironment should not create the editor, nor the composite projection.
- [ ] Rename gen/EditorDef.ts ==> "FreLanguage"EditorDef.ts
- [ ] All imports should be language dependen
- [ ] AllConceptsType should be removed (should be anyway)
- [ ] Composite Workers !!! Is this possible? Probably a special worker for the overall Project??
- [ ] seems to work out of the box :-), workers are generic using FreLanguage
- [ ] Design how to compose composite things, or make composites over all used languages
- [ ] Naming: different names for overall language and used languages. E.g.:
        
    | whole              | part          |
    | ------------------ | ------------- |
    | overall language   | sublanguage   |
    | composite language | language part |
    | DSL                | language      |
    | FreLanguage.       | .             |
