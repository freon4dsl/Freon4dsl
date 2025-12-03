import { DirectoryWalker } from "./DirectoryWalker.js";
import { ListDirectoriesWorker } from "./ListDirectories.js";

const worker = new ListDirectoriesWorker()
const walker = new DirectoryWalker(worker)

walker.walk("./src")
