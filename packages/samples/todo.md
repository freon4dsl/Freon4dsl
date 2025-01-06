LionWeb errors:

```asciidoc
> @freon4dsl/samples-docuproject@1.0.0-beta2 generate
> bash ../../../scripts/freon-samples-dev.sh -v all -d src/defs -o src/

 Starting generation of all parts of your language as defined in src/defs  
 Generating language structure  
 No id.json found  
 Generating LionWeb  
LionWeb language error: DuplicateNodeId: Node has duplicate id "-id-InsurancePart" at $.nodes[105] 
LionWeb language error: ParentMissingInChild: Node with id "-id-InsuranceModel" has child with id "-id-InsurancePart" but child has parent -id-InsurancePartType. at $.node[0] 
LionWeb language error: ChildMissingInParent: Node with id "-id-InsurancePart-name" has parent with id "-id-InsurancePart" but parent does not contains it as a child. at $.node[70] 
LionWeb language error: ChildMissingInParent: Node with id "-id-InsurancePart-isApproved" has parent with id "-id-InsurancePart" but parent does not contains it as a child. at $.node[71] 
LionWeb language error: ChildMissingInParent: Node with id "-id-InsurancePart-statisticalRisk" has parent with id "-id-InsurancePart" but parent does not contains it as a child. at $.node[72] 
LionWeb language error: ChildMissingInParent: Node with id "-id-InsurancePart-maximumPayOut" has parent with id "-id-InsurancePart" but parent does not contains it as a child. at $.node[73] 
 Generating editor, reader and writer  
 Warning: Native component is replaced by external one, list settings are ignored [file: editor-specials.edit:8:9].  
 Generating validator  
 Generating scoper  
 Generating typer  
 Generating interpreter  
 Generating language diagrams  

```
and
```asciidoc
> @freon4dsl/samples-pi-language@1.0.0-beta2 generate
> bash ../../../scripts/freon-samples-dev.sh -v all -d src/defs -o src/

 Starting generation of all parts of your language as defined in src/defs  
 WARNING: unrecognized file: src/defs/MetaTyper.rules  
 WARNING: unrecognized file: src/defs/checks-on-type-file.md  
 Generating language structure  
 No id.json found  
 Generating LionWeb  
LionWeb language error: DuplicateNodeId: Node has duplicate id "-id-NONE" at $.nodes[220] 
LionWeb language error: ParentMissingInChild: Node with id "-id-PiEditProjectionDirection" has child with id "-id-NONE" but child has parent -id-ListJoinType. at $.node[215] 
 Generating editor, reader and writer  
 Generating validator  
 Generating scoper  
 Generating typer  
 Generating interpreter  
 Generating language diagrams  

```
