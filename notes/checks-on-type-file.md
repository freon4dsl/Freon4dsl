
0. All references must be ok: types must be classifiers from the .ast, instances must be instances of limited concepts, etc.
1. No two classifier-rules for the same classifier with the same kind: infertype, equals, conforms.
3. No inference rule for concepts that are types.
   3.1. No conformance rules for concept that are not types.
4. An inference rule should result in a type.
5. No equals or conforms rules for non-types.
7. The only functions that may be used are: typeof(1 param), commonSuperType(2 params (or list?)),
   ancestor(1 param).
8. The arguments to typeof and commonSuperType should have an infertype rule?  
