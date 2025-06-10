import { DirectoryWalker } from "./DirectoryWalker";
import { ListDirectoriesWorker } from "./ListDirectories";
import { ModelStoreWorker } from "./ModelStoreWorker";

const worker = new ModelStoreWorker()
const walker = new DirectoryWalker(worker)

walker.walk("../server/modelstore")

console.log(JSON.stringify(worker.storeIndex, null, 4))
