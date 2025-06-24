import { DirectoryWalker } from "./DirectoryWalker";
import { ListDirectoriesWorker } from "./ListDirectories";

const worker = new ListDirectoriesWorker()
const walker = new DirectoryWalker(worker)

walker.walk("./src")
