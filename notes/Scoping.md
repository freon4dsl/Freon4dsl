# Scoping

- The generated Walker goes through all children explicitly, this does become rather long (874 lines for Example). 

  - Giving each PiElement a function `getChildren()` would make this much shorter.
  - Each function in the walker becomes smaller.
  - Might rewrite walker (or have a second one) to execute the same function for every node would make it even really small.

- ExampleWalker.walk

  - Use switch instead of list of if statement is more readable, faster and safer (considering subclasses)

  - Possibly consider using an array for this

    ```
    const walkFunctions {
    	"DivideExpression": this.walkDivideExpression,
    	"GroupedExpression": this.walkGroupedExpression,
    	etc...
    }
    walfFunctions[modelelement](modelelement, incudeChildren)
    ```

  - Isnamespace also use switch insgtead of list of ifs?

- Scoper should also work when multiple complete untis are in memory
  - Right now other units _must_ have the interface loaded.
  - Solutions:
    - Take into account that a full unit might be searched for names
    - Always keep an interface (used by the scope), even if the full unit is in memory as well.

In the generated code an expression cannot also be a PiNamedElement
- change this
hasName only checks for property named “name”, not for its tyoe.
PiNamedElement has a property of type ‘string’ in typescript
Property type identifier in meta info is string.
