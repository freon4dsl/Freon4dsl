Packages that need updating:

1. testinglibrary in core-svelte from version 5 to 6 has problems with the config: TypeScript files are not read correctly. 
2. pegjs in meta should be removed completely. This can be done after a change to a different parser. [DONE] upgraded to peggy.
3. nodemon. and all koa related packages can be removed completely when the server package is replaced by the LIonWeb repository.
