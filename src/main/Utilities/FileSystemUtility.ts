import { emptyDir, rmdir, ensureDir, pathExists, readdir, readFile, writeFile } from "fs-extra";
import { join } from "path";

export class FileSystemUtility {
    public static createFolderIfDoesntExist(folderPath: string): Promise<void> {
        return ensureDir(folderPath);
    }

    public static async deleteFolderRecursively(folderPath: string): Promise<void> {
        await this.cleanFolder(folderPath);
        return rmdir(folderPath);
    }

    public static cleanFolder(folderPath: string): Promise<void> {
        return emptyDir(folderPath);
    }

    public static pathExists(fileOrFolderPath: string): Promise<boolean> {
        return pathExists(fileOrFolderPath);
    }

    public static getFolderItems(folderPath: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            readdir(folderPath, (error, fileNames) => {
                error ? reject(error) : resolve(fileNames.map((fileName): string => join(folderPath, fileName)));
            });
        });
    }

    public static readJsonFile<T>(filePath: string): Promise<T> {
        return new Promise((resolve, reject) => {
            readFile(filePath, (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    try {
                        resolve(JSON.parse(data.toString()));
                    } catch (error) {
                        reject(error);
                    }
                }
            });
        });
    }

    public static writeJsonFile<T>(data: T, filePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            writeFile(filePath, JSON.stringify(data), (error) => {
                error ? reject(error) : resolve();
            });
        });
    }
}