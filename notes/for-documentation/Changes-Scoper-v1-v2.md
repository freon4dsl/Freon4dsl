# Important changes from version 1 to version 2 of Freon

## Ast definition: "private" keyword
In .ast you can add the keyword 'private' before a property.

```
interface BaseType {
    private name: identifier;
    private baseInterface_attr: number;
}
```

This indicates to the scoper whether the property and its child nodes are visible outside the namespace 
in which its parent node resides.

## Scope definition

- no name for the scoper, but name of language remains. Example:

```
scoper for language Demo
```

- 'isnamespace' becomes 'isNamespace'
- 'namespace_addition' and 'namespace_replacement' changed

OLD:
```
  namespace_addition = self.imports  + self.forEntity;
  namespace_replacement = typeof( container );
```
NEW
```
  imports { self.imports; self.forEntity; }
  alternatives { owner().type(); }
```

- Keyword 'recursive' added => indicates that the imports of the namespace are also included.
Example: 

```
imports { recursive self.baseEntity; }
```

- The way the expressions are formed is changed. (Currently only in scoper!) What is allowed are:

```
self.prop or prop => the FreNode instance that is the property named 'prop' in the node 'self'
```

```
self.prop1.prop2 or prop1.prop2 => the FreNode instance that is the property named 'prop2' in the node 'prop1' of 'self'
```

```
<SOME_EXPRESSION>.prop or <SOME_EXPRESSION>.prop => the FreNode instance that is the property named 'prop' in the node indicated by <SOME_EXPRESSION>
```

```
<SOME_EXPRESSION>.owner() => the FreNode instance that contains the node indicated by <SOME_EXPRESSION>
==> used to be called 'container'
```

```
<SOME_EXPRESSION>.if(<CLASSIFIER_NAME>) => the FreNode instance that contains the node indicated by <SOME_EXPRESSION>, but only if it is
of the type <CLASSIFIER_NAME>, otherwise undefined.
==> used to be called 'container'
```

```
<SOME_EXPRESSION>.type() => the FreNode instance that is determined by the typer to be the type of the node indicated by <SOME_EXPRESSION>
Used to be typeof(<SOME_EXPRESSION>).
!! May not be followed '.'.
```

What is not allowed in the .scope: `self` without `.<PROP_OR_FUNCTION>`.
