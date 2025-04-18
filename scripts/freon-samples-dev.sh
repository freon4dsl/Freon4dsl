#!/bin/sh
# Use next line when profiling the generator
#node --prof "../../meta/dist/bin/freon-generator.js" -v "$@"
node "../../meta/dist/bin/freon-generator.js" -v "$@"
