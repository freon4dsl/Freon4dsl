# The ProjectIt Editor

## On start

The editor as defined in this folder is not used stand-alone, instead it is started from 
the WebApp (in ~/playground), or another surrounding webbased environment. 

The Webapp has two entries into ~/core and ~/core-svelte. It triggers the rendering of a 
ProjectItComponent (from ~/core-svelte) that takes a PiEditor instance (from ~/core) as parameter.
Next, the WebApp sets the rootElement of the PiEditor, this is the model element that will 
be projected. The PiEditor knows the projection to be used (it is a 
parameter to its constructor) and from the projection the box that corresponds with 
the rootElement is found, called the rootBox. The ProjectItComponent then uses the RenderComponent 
to render this rootBox. Note that each autoRun renews this rootBox using the rootBox() function 
in PiEditor.

The PiEditor constructor is indirectly called by the WebApp, through the use of the PiEnvironment 
that is being generated for the language. Its parameters are:
1. projection: holds a list of boxes and table definitions that represent how to project a certain
   type of model element,
2. actions: two lists of actions that are coupled to certain boxes, one for binary expressions,
   and one for all other actions,
3. environment: the coupling of the generic editor with the generated language. In the environment,
the editor can find the scoper and other elements that it might need.

## Actions

In the editor two kinds of actions are used: PiCreateBinaryExpressionAction(s) and PiCustomAction(s). 
Both lists are parts of the interface PiCombinedActions.

With every PiAction there is a trigger type. Currently, only the type 'string' is being used 
(TODO is this correct?).



