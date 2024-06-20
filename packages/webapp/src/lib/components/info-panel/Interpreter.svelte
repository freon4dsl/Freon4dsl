<script>
    import { interpreterTrace } from "../stores/InfoPanelStore";
    const tree = [
        {
            name: "This is a root node",
            children: [
                {
                    name: "And it has"
                },
                {
                    name: "two children"
                }
            ]
        },
        {
            name: "This is another root node",
            children: [
                {
                    name: "This one is alone"
                },
                {
                    name: "But this one has nested children",
                    children: [
                        {
                            name: "Like this"
                        },
                        {
                            name: "and this"
                        }
                    ]
                }
            ]
        }
    ];
/* <Tree tree={tree}/>> */
</script>

<pre>
    {$interpreterTrace}
</pre>
