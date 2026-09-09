# Enumerations

Use string value enumerations.
Potentially add helper functions through using namespaces as follows:
```typescript
export enum Theme {
    IHomeTheme = "IHomeTheme",
    ILegalTheme = "ILegalTheme",
    doSomething = "doSomething"
}



export namespace Theme {
    export function extraFunction(mode: Theme) {
        // your code here
    }
}

let enumValue1: Theme = Theme.IHomeTheme
Theme.extraFunction(enumValue1)
```
Questions:
- A Literal value is not an object anymore, so there is no place to put
the property `parseLocation`. However, this might not be needed by Langium.

# MetaLanguage in Freon meta package
The meta language needs to be replaced with the generated LionWeb code.

- The generated code lacks all the methods that the classes in `meta` have.
  One way of solving this is to add these methods using [Module Augmentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation)
