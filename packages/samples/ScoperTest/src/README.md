# What should be tested

These tests are supposed to test the approach to scoping in Freon, as explained in ...

The model stays the same in all tests. 
TODO add description of model

TEST A: Using the default scoper:
1. There is one namespace in the namespace graph and that is the model. Every named node is visible everywhere.

TEST B: Using a scoper definition with namespace entries only:
1. The namespace graph is build up correctly. Every namespace holds the names of the AST nodes that it 'contains'.
2. The visible names in every namespace are correct, i.e. based on the namespace hierarchy.

TEST C: Using a scoper definition with namespace entries and namespace-additions:
1. The namespace graph is build up correctly. Every namespace holds the names of the AST nodes that it 'contains'.
2. The visible names in every namespace are based on the namespace hierarchy, as well as the namespace-additions.

TEST D: Using a scoper definition with namespace entries and namespace-replacements:
1. The namespace graph is build up correctly. Every namespace holds the names of the AST nodes that it 'contains'.
2. The visible names in every namespace are based on the namespace hierarchy, as well as the namespace-replacements.

TEST E: Using a scoper definition with namespace entries and namespace-exports:
1. The namespace graph is build up correctly. Every namespace holds the names of the AST nodes that it 'contains'.
2. The visible names in every namespace are based on the namespace hierarchy, as well as the namespace-exports.

TEST F: Combining namespace-additions and namespace-replacements:
1. The namespace graph is build up correctly. Every namespace holds the names of the AST nodes that it 'contains'.
2. The visible names in every namespace are based on the namespace hierarchy, as well as the namespace-replacements,
3. as well as the name-space-replacements.

TEST H: Combining namespace-additions and namespace-exports:

TEST G: Combining namespace-replacements and namespace-exports:

TEST G: Combining all of namespace-additions, namespace-replacements, and namespace-exports:

TODO add descriptions of expected results
