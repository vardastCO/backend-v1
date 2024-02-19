import * as glob from "glob";
import * as path from "path";

// export const importFiles = async (filePaths: string[]) => {
//   await Promise.all(filePaths.map((filePath) => import(filePath)))
// }

export const loadFiles = (filePattern: string[]): string[] => {
  return filePattern.map(pattern => glob.sync(path.resolve(process.cwd(), pattern))).reduce((acc, filePath) => acc.concat(filePath), []);
};

export const importSeed = async (filePath: string): Promise<any> => {
  const seedFileObject: { [key: string]: any } = await import(filePath);
  const keys = Object.keys(seedFileObject);
  return seedFileObject[keys[0]];
};
