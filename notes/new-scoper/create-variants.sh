#!/bin/bash
echo Create $1 variants

BASENAME=`basename $1 .m4`
echo $BASENAME
m4 ./m4arguments/SHOW_AST.m4 $1 >  $1.AST.dot 
m4 ./m4arguments/SHOW_NAMESPACES.m4 $1 >  $1.NAMESPACES.dot 
m4 ./m4arguments/SHOW_IMPORTS.m4 $1 > $1.IMPORTS.dot 
m4 ./m4arguments/SHOW_IMPORTS_RECURSIVE.m4 $1 > $1.SHOW_IMPORTS_RECURSIVE.dot 
