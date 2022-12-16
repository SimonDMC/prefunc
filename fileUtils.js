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
 * @returns {void}
 */
export function wipeDirectory(dirPath) {
    try {
        fs.rmSync(dirPath, { recursive: true });
        console.log(chalk.green("Wiped directory: " + dirPath));
    } catch (e) {
        console.log(chalk.yellow("Skipping directory wipe: " + dirPath));
    }
}

/**
 * Copies a file
 * @param {string} source Path to the source file
 * @param {string} target Path to the target file
 * @returns {void}
 */
export function copyFile(source, target) {
    try {
        fs.mkdirSync(target.split("/").slice(0, -1).join("/"));
    } catch (e) {
        console.log(e);
    }

    try {
        fs.copyFileSync(source, target);
    } catch (e) {
        console.log(
            chalk.red("Error copying file: " + source + " to " + target)
        );
    }
}
