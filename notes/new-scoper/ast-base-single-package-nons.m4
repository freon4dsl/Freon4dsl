changequote(++,++)

digraph G   {
ifdef('SHOW_NAMESPACES', ++
//    Mod1, ClassA , ClassB, A1 [peripheries=2]
//    Mod1, ClassA , ClassB, A1 [style=bold]
    Mod1, ClassA , ClassB, A1, B1 [style=filled, color=lightgrey]
++)

ifdef('SHOW_IMPORTS', ++
    ClassA -> ClassB [color=magenta, style=dashed, label="extends", fontcolor=magenta]
    B1, B2  [fontcolor=magenta]
++)
ifdef('NO_IMPORTS', ++
    ClassA -> ClassB [style=dashed, label=extends]
++)
ifdef('SHOW_DECLARED', ++
    A1, A2 [fontcolor=blue]
++)
ifdef('SHOW_PARENT', ++
    ClassA, ClassB [fontcolor=cornflowerblue]
++)
    Mod1 -> ClassA
    Mod1 -> ClassB 

    ClassA -> A1;
    ClassA -> A2;
    A1 -> A1_1;
    A1 -> A1_2;
    ClassB -> B1;
    B1 -> B1_1;  
    B1 -> B1_2;
    ClassB -> B2;

    {rank=same; ClassA; ClassB}
    
ifdef('SHOW_CLASS_C', ++
include(C.m4)
++)
}
