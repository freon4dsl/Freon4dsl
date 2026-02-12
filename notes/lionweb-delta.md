# LionWeb Delta Protocol in Freon

Implementing the LionWeb delta protocol gives several issues:

## References with only ID

In LionWeb a reference has two fields:
```ts
resolveInfo: string;   // name in Freon
reference: string;     // id of referred node, does not exist (is derived) in Freon
```
In Freon only the `resoilveInfo` is used as references are basically name-based.

In LionWeb either of the two fields can be empty.
- If the `reference` is empty, it maps directly to Freon.
- If both the `reference` and the `resolveInfo` are **not** empty,
  then Freon ignores the `reference` and uses its scoper to find the referred node.
- If `resolveInfo` is empty then there is the `referred` only, si=o there is no mapping possible.

For the third case we have two options.
If there is a node with `id === reference` Freon can find the node, and copy its name in the `resolveInfo` property.
If there is no node with `id === reference`, we have a dangling reference.
For this case, Freon needs to store the ID in `reference` (needs to be added)
and each time the reference is resolved, try to find the node with the referred ID.

## Freon Limited verus LionWeb Enumeration

In the Fre to LionWeb conversions and vice versa the following is doen:
- At the language level: a Freon limited is converted to a LionWeb Enumeration. 
- At the model level, a reference to a limited in Freon is converted to a primitive property of the type of 
  the corresponding LionWeb enumeration.

However, in Freon, we can have an interface that is implemented both by a Concept and by an Enumeration.
A property of this interface type in Freon is always a reference property.
In LionWeb such a property can either be a primitive (with en enunmeration value), or a reference (to the implementing concept).
It is not possible toi map such a situation from Freon to LionWeb.
