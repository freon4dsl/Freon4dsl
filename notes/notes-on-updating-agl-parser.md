It seems that updating to version 4.0.1 of the agl-parser introduces problems.

1. tsc also checks node_modules/net.akehurst.language-agl-processor. Most likely because there are deep imports. 
See the answer in https://stackoverflow.com/questions/64616790/getting-ts-errors-for-files-inside-the-node-modules-folder.

In my case, both exclude and skipLibCheck were set, but it still tried to compile files in node_modules

In the end, I found a deep import of some module that had its sources packaged into the distributable, like so:

import {Something} from "some-module/src/something.ts"

2. When running playground 'agl' is unknown. This is also probably caused by incorrect imports.

3. I found that in the package.json of net.akehurst.language-agl-processor main is set to a file
that is not in the distribution: "main": "net.akehurst.language-agl-processor.js". Therefore the 
parser is not available at runtime.

