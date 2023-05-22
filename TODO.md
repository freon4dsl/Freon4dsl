# MdeNet Presentation

- [ ] subclasses of a namespace in scoper definition are not namespaces, but they should  be.
     Fixed for concepts, but need to be done for subinterfaces as well.
- [ ] Custom scoper is never used => need to implement custom scoper
- [ ] Use of self.property.property in scoper is accepted, but generated code does not compile
- [ ] Cursor sometimes goes to start of text field instaed of clicked position.
- [ ] Need to document styling properties
- [ ] Add more styling options in Svelte components.
- [ ] Use of inherited projections in .edit file is not described in the documentation.
- [ ] Reference shortcut fixed.
- [ ] \<br/> in layoutcomponent does not work as intended.
- [ ] Expression editing is broken: Typing + or / at end of number literel
  - shows menu instead of directly adding the operator
  - Adds operator to the left instead of the right: At GOTO_NEXT next leaf is binary post, which is incorrect and console says: it is NOT an action box.
- [ ] Cursor is incorrectly placed after adding/creaating a binary expression. It is on the whole, it should be on one of the placeholders (left or right).
  - 24/12/2022 selectElement(in PiEditor) chnaged signature, create bin expr command not changeed accordingly)!


# Expressions

### Binary expressions:

- [ ] switch to show brackets
- [ ] switch to show tree

### Expression edit magic:

- [ ] Add brackets
- [ ] Add unary expressions
- [ ] Move to core
  - Does parser already use priorities? If not, it should be solved by this. 

### Interpreter:

- [x] Create Interpreter generator
- [x] Add interpreter
- [ ] Add interpreter values in expression tree view
- [ ] Separate interpreter runtime from core.
  - Separate package 

### Tests

- [ ] Implement all TODO's in Svelte tests

## Scoper

- [ ] scope rule for specific reference in scope language
- [ ] add custom scoper option.
  - [ ] Scoper composable
  - [ ] Scoper override per concept / reference

## Others Isssues

- [ ] StarLasu pipeline tool for TypeScript: tylasu github
- [ ] Monticore for base expression languages
  - language extension & aggregation
- [ ] when two concepts with the same name are referrable, a duplicate key error occurrs.
- [ ] check css varibles and selectors for correctness
- [x] Get  Unit names from FreLanguage, remove from generator
- [ ] Refactor search and copy etc into actions that can be bound to keys.
- [ ] Collections as tabbed box (so the elements are stacked upon each other)
- [ ] Non-textual Box/Component e.g. bodypart picture with click to point to pain areas.

## IDE for FreLanguage Development

- [ ] IDE for definition languages
  - Investigate Langium: Grammar + TypeScript + Web + FreLanguage Server.
    see langium.org/docs/ast-types
  - Having TS makes it processable by our code.
  - LSP makes it supported by various IDE's.
  - Investigate editor options with david's grammar tool

## PoC FreLanguage Ideas

- [ ] Create dot-model as in KernelF and build specific editor support for this (as with binary expressions).
- [ ] PoC for Gorilla
- [ ] EU Corona app: JSONLogic / CertLogic (github)

## FreLanguage Composition

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

ProjectitConfiguration => "Langauge"Configuration

Make Scoper composite

<FreLanguage>Environment should not create the editor, nor the composite projection.

gen/EditorDef.ts ==> "FreLanguage"EditorDef.ts

All imports should be language dependent

AllConceptsType should be removed (should be anyway)

Composte Workers !!! Is this possible? Probably a special worker for the overall Project??

- seems to work out of the box :-), workers are generic using FreLanguage

Design how to compose composite things, or make composites over all used languages

Naming: different names for overall language and used languages. E.g.:

| whole              | part          |
| ------------------ | ------------- |
| overall language   | sublanguage   |
| composite language | language part |
| DSL                | language      |
| FreLanguage.          | .             |

## Freon Name Change

Goal: 1-1-2023

Todo:

- [ ] Get URL 
- [ ] Name change in **all** code and documentation
  - "Pi" ==> "Fr" | "Fre" | "Freon" | F_ 
  - Do we still want this prefix? 
- [ ] Stop projectit.org Q3 2023
- [ ] New github organization and projects
- [ ] Publish code + documenatation under Freon name

### Renames

| Before    | after     | after(2)  | after(3)     | after(4) |
| --------- | --------- | --------- | ------------ | -------- |
| PiElement | FrAstNode | F_AstNode | FreonAstNode | AstNode  |
| PiModel   | FrModel.  | F_Model   | FreonModel   | Model.   |
