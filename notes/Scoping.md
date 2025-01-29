### Scoping

- [ ] Use of self.property.property in scoper is accepted, but generated code does not compile
- [ ] subclasses of a namespace in scoper definition are not namespaces, but they should  be.
  - [x] Fixed for concepts
  - [ ] but need to be done for subinterfaces as well. (A)

- [ ] The generated Walker goes through all children explicitly, this does become rather long (874 lines for Example). 

### Ideas

  - Giving each FreNode a function `getChildren()` would make this much shorter.
  - Each function in the walker becomes smaller.
  - Might rewrite walker to execute the same function for every node would make it even really small.
    - But that would mean that the language engineer needs to write `if (type of Node)` statements. This is ok if there are ponly a few nodes for which this is needed, but cumbersome if many are needed. See the long `if` statement in the currently generated code.

  - The walker is raher inefficent, because it will execute half of the `if` conditions (on average) to find the correct function. Using a map, like in the interpreter would speed up things considerably.

- ExampleWalker.walk

  - Use switch instead of list of if statement is more readable, faster and safer (considering subclasses)

  - Possibly consider using an array or Map for this

    ```
    const walkFunctions {
    	"DivideExpression": this.walkDivideExpression,
    	"GroupedExpression": this.walkGroupedExpression,
    	etc...
    }
    walfFunctions[modelelement](modelelement, incudeChildren)
    ```

  - Isnamespace also use switch insgtead of list of ifs?

- [ ] Scoper should also work when multiple complete units are in memory
  - Right now other units _must_ have the interface loaded.
  - Solutions:
    - Take into account that a full unit might be searched for names
    - Always keep an interface (used by the scope), even if the full unit is in memory as well.

In the generated code an expression cannot also be a FreNamedNode
- change this
hasName only checks for property named “name”, not for its type.
FreNamedNode has a property of type ‘string’ in typescript
Property type identifier in meta info is string.

#### Scoper

- [ ] scope rule for specific reference in scope language

- [ ] add custom scoper option.
  - [ ] Scoper composable
  - [ ] Scoper override per concept / reference
