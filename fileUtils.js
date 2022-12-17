import fs from "fs";
import chalk from "chalk";

/**
 * Gets all nested files in a directory
 * @param {string} dirPath Path to the directory
 * @param {string[]} arrayOfFiles Array of files (for recursion)
 * @returns {string[]} Array of files
 */
export function getAllNestedFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach((file) => {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllNestedFiles(
                dirPath + "/" + file,
                arrayOfFiles
            );
        } else {
            arrayOfFiles.push(dirPath + "/" + file);
        }
    });

    return arrayOfFiles;
}

/**
 * Wipes a directory
 * @param {string} dirPath Path to the directory
 */
export function wipeDirectory(dirPath) {
    try {
        fs.rmSync(dirPath, { recursive: true });
    } catch (e) {
        console.log(chalk.yellow("Skipping directory wipe: " + dirPath));
    }
}

/**
 * Ensures that the parent directory of a file exists
 * @param {string} path Path to the file
 */
function ensureParent(path) {
    try {
        fs.mkdirSync(path.split("/").slice(0, -1).join("/"), {
            recursive: true,
        });
    } catch (e) {
        console.log(e);
    }
}

/**
 * Copies a file
 * @param {string} source Path to the source file
 * @param {string} target Path to the target file
 */
export function copyFile(source, target) {
    ensureParent(target);
    try {
        fs.copyFileSync(source, target);
    } catch (e) {
        console.log(
            chalk.red("Error copying file: " + source + " to " + target)
        );
    }
}

/**
 * Creates a file
 * @param {string} path Path to the file
 * @param {string} content Content of the file
 */
export function createFile(path, content) {
    ensureParent(path);
    try {
        fs.writeFileSync(path, content);
    } catch (e) {
        console.error(chalk.red("Error creating file: " + path));
        console.log(e);
    }
}
