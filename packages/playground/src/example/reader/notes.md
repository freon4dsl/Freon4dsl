How to change everything that is recognised as LoopVarRef into the correct object

Make walker over the model, similar to reference checker
If check returns false then 

    make boolean value for 'true'and 'false' or 
    make possible PiElemRefs with the right type

    find where these PiElemRefs, or boolean values could fit
        - concepts that have reference props with type of found PiElemRef
        - should be a single prop in the concept

    - boolean values:  all concepts that have a single prop of type boolean;

    create and store these objects mapped to faulty object

    after finishing walking replace the faulty modelelement with one of the stored objects
