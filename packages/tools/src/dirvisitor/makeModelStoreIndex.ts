import { DirectoryWalker } from "./DirectoryWalker.js"
import { ModelStoreWorker } from "./ModelStoreWorker.js"


const refDir = "../../../create-freon-languages/languages/"
for (const lang of [
    "CourseSchedule",
    "Education",
    // "Expressions",
    // "StarterLanguage",
    // "CustomizationsProject",
    "EducationInterpreter",
    "Insurance",
    // "TyperExample",
]) {
    const worker = new ModelStoreWorker()
    const walker = new DirectoryWalker(worker)
    walker.walk(`${refDir}${lang}/modelstore`)
    console.log(`${refDir}${lang}/modelstore`)
    console.log(JSON.stringify(worker.storeIndex, null, 4))
}
// walker.walk("../server/modelstore")

// console.log(JSON.stringify(worker.storeIndex, null, 4))
