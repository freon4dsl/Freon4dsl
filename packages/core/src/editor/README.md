# The Freon Editor

## On start

The editor as defined in this folder is not used stand-alone, instead it is started from 
the WebApp (in ~/playground), or another surrounding webbased environment. 

The Webapp has two entries into ~/core and ~/core-svelte. It triggers the rendering of a 
FreonComponent (from ~/core-svelte) that takes a FreEditor instance (from ~/core) as parameter.
Next, the WebApp sets the rootElement of the FreEditor, this is the model node that will 
be projected. The FreEditor knows the projection to be used (it is a 
parameter to its constructor) and from the projection the box that corresponds with 
the rootElement is found, called the rootBox. The FreonComponent then uses the RenderComponent 
to render this rootBox. Note that each autoRun renews this rootBox using the rootBox() function 
in FreEditor.

The FreEditor constructor is indirectly called by the WebApp, through the use of the FreEnvironment 
that is being generated for the language. Its parameters are:
1. projection: holds a list of boxes and table definitions that represent how to project a certain
   type of model node,
2. actions: two lists of actions that are coupled to certain boxes, one for binary expressions,
   and one for all other actions,
3. environment: the coupling of the generic editor with the generated language. In the environment,
the editor can find the scoper and other elements that it might need.

## Actions

In the editor two kinds of actions are used: FreCreateBinaryExpressionAction(s) and FreCustomAction(s). 
Both lists are parts of the interface FreCombinedActions.

With every FreAction there is a trigger type. Currently, only the type 'string' is being used 
(TODO is this correct?).



