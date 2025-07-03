# Scoping

Scopeing in Freon is done using namespaces. A Namespace is a node in the AST, which is marked in the language as a namespace. Any node can be a namepace.

Example in text:

```java
package P1
 class A base B
   properties A1, A2
 class B base C
   properties B1, B2
 class C 
   properties C1, C2
```

![](/Users/jos/projects/freon/fix-scoper-bug/notes/on-scoping/ast-base-multiple-package.svg)

| Namespace | Nodes set | nodes values                                   |
| --------- | --------- | ---------------------------------------------- |
| ClassA    | declared  | A1, A2                                         |
|           | parents   | ClassA, ClassB, ClassC                         |
|           | imported* | B1, B2, C1, C2                                 |
|           | visible   | A1, A2, ClassA, ClassB, ClassC, B1, B2, C1, C2 |
| ClassB    | declared  | B1, B2, B1-1                                   |
|           | parent    | ClassA, ClassB, ClassC                         |
|           | imported  | B1, B2, C1, C2                                 |
|           | visible   | B1, B2, B1-1, ClassA, ClassB, ClassC, C1, C2   |
| P1        | declared  | ClassA, ClassB, ClassC                         |
|           | parent    | P1, P2                                         |
|           | imported  | none                                           |
|           | visible   | ClassA, ClassB, ClassC                         |
| P2        | declared  | IntfaceD                                       |
|           | parent    | P1, P2                                         |
|           | imported  | -                                              |
|           | visible   | IntfaceD                                       |

We now want to make *classA* implement *IntfceD*. As we can see from the table, *IntfaceD* is not visible from *ClassA*, so we cannot create a reference to *IntfaceD*.  We first need to find a way to make it visible in *ClassA*.

To do this, we import P2 into P1, then *IntfaceD* is in the *imported* nodes of *P1*, therefore also in the *visible* nodes of *P1*, and therefore also in the  *visible* nodes of *Class A*.

![](/Users/jos/projects/freon/fix-scoper-bug/notes/on-scoping/ast-base-multiple-package-p1-import-p2.svg)

First Term

<dl>
  <dt><strong>declared nodes</strong></dt>
  <dd>all the child nodes od the namespace node (recursively) until a child is a namespace itself.</dd>
  <dt><strong>parent nodes</strong></dt>
  <dd>all the visible nodes and parent nodes from </dd>
  <dt><strong>visible nodes</strong></dt>
  <dd>all the _declarednodes_ plus all the _parent nodes_</dd>
</dl>

**declared**
