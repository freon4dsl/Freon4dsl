import { FreCompositeScoper, FreScoper } from "@freon4dsl/generic-scoper"
import { FreNode } from "../../ast"
import { CoreConfig, FreLanguageEnvironment } from "../../environment"
import { FreonDeclaredNodeProvider, freonScoperLanguage } from "../../scoper"

export function createTestScoper(scoper?: FreScoper<FreNode>): FreCompositeScoper<FreNode> {
    const env = FreLanguageEnvironment.getInstance()

    const mainScoper = new FreCompositeScoper<FreNode>(freonScoperLanguage, new FreonDeclaredNodeProvider())

    if (scoper !== undefined) {
        mainScoper.appendScoper(scoper)
    }

    env.scoper = mainScoper
    CoreConfig.initialize(env, null)

    return mainScoper
}
