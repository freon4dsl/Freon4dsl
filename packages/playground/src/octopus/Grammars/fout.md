--------------------------- grammar
OclStatement = 'OclStatement' identifier  
| OclPreStatement
| OclPostStatement
'expr' OclExpression  
| OclPreStatement
| OclPostStatement  ;

------------------------- .ast
concept OclStatement {
    name: string;
    expr: OclExpression;
}

// TODO remove the following two concepts when we can cater for a prefix to lists
concept OclPreStatement base OclStatement {
}

concept OclPostStatement base OclStatement {
}
concept OclExpression {
    expr: string;
}

----------------- .edit
OclPostStatement {
@projection normal
    [post [?${self.name} :] ${self.expr}]
}
OclPreStatement {
@projection normal
    [pre [?${self.name} :] ${self.expr}]
}
OclExpression {
@projection normal
    [${self.expr}]
}
