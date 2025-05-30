# Proposed Changes to the Scoper
Date: 22 May 2025

## Scoper Interface
- Remove `isInScope, getFromVisibleElements, getVisibleNames` methods. The interface
is exposed to language engineers. The only methods that are useful to change are the remaining ones:
  - `resolvePathName`
  - `getVisibleElements`
  - `additionalNamespaces`
  - `replacementNamespace`.

- Make this the signature of additionalNamespaces:
`additionalNamespaces(node: FreNode): FreNamespace[];`.
- Change the signature of `resolvePathName` to 
`resolvePathName(node: FreNode, doNotSearch: FreNodeReference<FreNamedNode>, pathname: string[], filter?: ScoperFilter): FreNamedNode;`.
Where `ScoperFilter` can be the metatype as it is now, but also other filters - to be defined.
- Also change the signature of `getVisibleElements` to include this `ScoperFilter`.

## FreNamespace class
- Add a method that returns the declared nodes in a namespace. Make this MobX aware, so we can 'cache' the result.
- Change the getVisibleNodes method into a more flexible one (or maybe have a number of methods), that is able to 
add (or not) declared nodes from parent namespaces, and/or from additional namespaces.
- Add an explicit link to parent and additional namespaces, or place the method 'getNearestNamespace' here.
- Algorithm for getVisibleNodes, the default:
  1. add self.declaredNodes
  2. if (addNS[]) then add all addNS[].declaredNodes
  3. if (!replacementNS) then add parent.visibleNodes (i.e. recursive and including addNs-es)
  4. else add replacementNS.declaredNodes

## No Shadowing
Nodes with the same name should be forbidden in the set of declared nodes of each namespace. (N.B. how do we enforce this?)
However, nodes with the same name may occur in the set of visible nodes of a namespace. In that case the names is shown as its fqn in the editor,
and also stored as fqn by the serializer and the unparser. The parser needs to be adapted as well.

## Example
There are various possibilities in whether imports of parents, parents of imports, and imports of imports are included in the visible nodes. 
An attempt to make this more clear.

Let's assume there is a namespace graph as in figure 1. The declared nodes are indicated by lowercase names within the circles. 
So the declared nodes are, using their fqns: 
1. Declared(A) = [A.x, A.y, A.z, A.B, A.D, A.F]
2. Declared(B) = [A.B.a, A.B.x, A.B.y, A.B.C]
3. Declared(C) = [A.B.C.b, A.B.C.c, A.B.C.x, A.B.C.z]
4. Declared(D) = [A.D.d, A.D.e, A.D.f, A.D.E]
5. Declared(E) = [A.D.E.k, A.D.E.l, A.D.E.m, A.D.E.x]
6. Declared(F) = [A.F.a, A.F.b, A.F.c]

### Case 1: C imports D, D imports F, and F imports B

When namespace C imports D, D imports F, and F imports B, the following options for the visible nodes of C are feasible.

(1) The parents of C are visible, but C itself is removed. (This is the normal lexical/hierarchical scope, which is there in all cases.) 
The declared nodes of D are added.
```
Visible(C) = Declared(C) + Declared(B) + Declared(A) - [A.B.C] + [Imported: Declared(D)]
Result = [A.B.C.b, A.B.C.c, A.B.C.x, A.B.C.z, A.B.a, A.B.x, A.B.y, A.x, A.y, A.z, A.B, A.D, A.F, A.D.d, A.D.e, A.D.f, A.D.E]
Simplyfied: [b, c, A.B.C.x, A.B.C.z, a, A.B.x, A.B.y, A.x, A.y, A.z, B, D, F, d, e, f, E]
Sorted: [a, b, c, d, e, f, B, D, F, E, A.x, A.B.x, A.B.C.x, A.y, A.B.y, A.z, A.B.C.z]
```

(2) The declared nodes of D, as well as the **declared** nodes of D's parents are added (note the duplicates!):
```
Visible(C) = Declared(C) + Declared(B) + Declared(A) - [A.B.C] + [Imported: Declared(D) + Declared(A)]
``` 

(3) The declared nodes of D, as well as the **visible** nodes of D's parents are added:
```
Visible(A) = Declared(A)
Visible(C) = Declared(C) + Declared(B) + Declared(A) - [A.B.C] + [Imported: Declared(D) + Visible(A)]
```

(4) The declared nodes of D and the declared nodes of import F are added, but not the parents of the imports:
```
Visible(A) = Declared(A)
Visible(D) = Declared(D) + Declared(A) + [Imported: Declared(F)]
Visible(C) = Declared(C) + Declared(B) + Declared(A) - [A.B.C] + [Imported: Declared(E) + Visible(D) + Visible(A)]
```

(5) The declared nodes of D, and the declared nodes of import F, and the declared nodes of B are added, but 
none of the parents of the imports. In other words, B is re-exported.
```
Visible(A) = Declared(A)
Visible(D) = Declared(D) + Declared(A) + [Imported: Declared(F) + Declared(B)]
Visible(C) = Declared(C) + Declared(B) + Declared(A) - [A.B.C] + [Imported: Declared(E) + Visible(D) + Visible(A)]
```

## Second example
Taken the above model, suppose we add an import from E to C. This possible when C is in the visible nodes of E. It can be,
if we use re-export of F->B because then E's parent imports F, which imports B. Thus C is visible for E. 

We can determine the visible nodes of E before the import.
```
Visible(A) = Declared(A)
Visible(D) = Declared(D) + Declared(A) + [Imported: Declared(F) + Declared(B)]
Visible(E) = Declared(E) + Visible(D) + Visible(A) - [A.D.E]
Result = [A.D.E.k, A.D.E.l, A.D.E.m, A.D.E.x, A.D.d, A.D.e, A.D.f, A.D.E, A.x, A.y, A.z, A.B, A.D, A.F, A.F.a, A.F.b, A.F.c, A.B.a, A.B.x, A.B.y, A.B.C]
Simplyfied: [k, l, m, A.D.E.x, d, e, f, E, A.x, A.y, z, B, D, F, A.F.a, b, c, A.B.a, A.B.x, A.B.y, C]
Sorted: [b, c, d, e, f, k, l, m, z, B, C, D, E, F, A.B.a, A.F.a, A.x, A.B.x, A.D.E.x, A.y, A.B.y]
```

The visible nodes after the import are:
```
Visible(E) = Declared(E) + Visible(D) + Visible(A) - [A.D.E] + Declared(C)
Result = [A.D.E.k, A.D.E.l, A.D.E.m, A.D.E.x, A.D.d, A.D.e, A.D.f, A.D.E, A.x, A.y, A.z, A.B, A.D, A.F, A.F.a, A.F.b, A.F.c, A.B.a, A.B.x, A.B.y, A.B.C, A.B.C.b, A.B.C.c, A.B.C.x, A.B.C.z]
Simplyfied: [k, l, m, A.D.E.x, d, e, f, E, A.x, A.y, A.z, B, D, F, A.F.a, A.F.b, A.F.c, A.B.a, A.B.x, A.B.y, C, A.B.C.b, A.B.C.c, A.B.C.x, A.B.C.z]
Sorted: [A.F.b, A.F.c, d, e, f, k, l, m, A.z, B, C, D, E, F, A.B.a, A.F.a, A.x, A.B.x, A.D.E.x, A.y, A.B.y, A.B.C.b, A.B.C.c, A.B.C.x, A.B.C.z]
```
In sort: everything is visible! Without the re-export this would not be the case.

## The .scope file
- Decide on the exact limits of the expression language that can be used to indicate additional and replacement namespaces.
 
!!! Currently, we can only import a namespace iff it is visible. There is no manner to express this. The following is not correct.
  Maybe it should be?
```
C {
  namespace-addition = container.container.D.E;
}
```
However, iff the visible nodes include the declared nodes of all parents, then in C node A.D is visible. If concept C is declared as:
```
concept C {
  ...
  reference imported: D;
  ...
}
```
, the following scope file would be possible:

```
C {
  namespace-addition = self.imported;
}
```

====

# Ideas on Recursive additional or replacement namespaces

The notation for this could be `namespace_addition =* self.imports;`. The meaning would be that instead of the declared nodes, the set of 
publicly visible nodes of the additional namespace is added.

// !!!!!!!!!!!!!!!!!! name of model may not be in fqn. This name is not visible in the model itself!!!!!!!!!!!!!!!!!!
