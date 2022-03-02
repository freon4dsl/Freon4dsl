Date: 2 March 2022

Content: Conclusions after first try-out with bootstrapping typer language.

1. Bootstrapping works!!
2. AST of typer language can be improved: see TODOs in typer.ast.
3. The power of expression of the validator must be much larger.
4. We need a cookbook to show how you can best define some common patterns such as generic types.
5. To get typer working properly, we need to bootstrap the structure def (completely!) as well.
6. It is difficult to get the grammar such that no unnecessary parse errors will occur.
7. Three-level architecture works: currently most error messages are implemented in CustomValidator.
8. We need to be able to structure the def folder. It is easy to lose track.
9. The current generation produces a different structure than currently in the meta package. Might 
   need a lot of changes in meta.
10. The scoper still has problems with namespace-additions: MobX cycle errors!   
11. The default scoper should not have model units as namespaces!
12. ?? Do all expressions concepts need to have a type ??? In other words, are they all included 
    in the hastype{} statement?
13. If there is no top of inheritance tree of types, do we generate one??? What implications does 
    this have for language composition?
14. Maybe we should extend limited concepts to include non-primitive props? Maybe references only?
