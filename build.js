#!/usr/bin/env node

import fs from "fs";
import chalk from "chalk";
import { getAllNestedFiles, wipeDirectory, copyFile } from "./fileUtils.js";
import { parseGlobals, parseFile } from "./parser.js";
import { Timer } from "./timer.js";

const config = {
    rootDir: "data",
    fileExtensions: ["mcfunction", "prefunc"],
};

// start timer
const timer = new Timer();

// find base path
const basePath = process.cwd() + "/" + config.rootDir;

// check if base path exists
if (!fs.existsSync(basePath)) {
    console.log(
        chalk.red(`Data folder couldn't be found in ${process.cwd()}.`)
    );
} else {
    // get all folders in the base path
    const directories = fs.readdirSync(basePath);
    let workDirFound = false;

    directories.forEach((dir) => {
        // if not a folder, skip it
        if (!fs.statSync(basePath + "/" + dir).isDirectory()) {
            return;
        }

        // only allow working directories
        if (dir[0] != "~") {
            return;
        }

        workDirFound = true;
        const buildName = dir.replace("~", "");
        const files = getAllNestedFiles(basePath + "/" + dir, []);

        // wipe build directory
        const buildDir = basePath + "/" + buildName;
        wipeDirectory(buildDir);

        /* REGISTER GLOBAL VARIABLES */

        let globals = {};
        files.forEach((file) => {
            if (!config.fileExtensions.includes(file.split(".").pop())) return;
            const fileContents = fs.readFileSync(file, "utf8");
            const lines = fileContents.split("\n");

            globals = { ...globals, ...parseGlobals(lines, file) };
        });

        files.forEach((file) => {
            // if file doesn't have a whitelisted extension, copy it over to the build directory and skip it
            if (!config.fileExtensions.includes(file.split(".").pop())) {
                const destination = file.replace("~", "");
                copyFile(file, destination);
                return;
            }

            // if it's a working file, parse it
            parseFile(file, globals);
        });
    });

    // warn no work was done
    if (!workDirFound) {
        console.warn(
            chalk.yellow(
                "No working directories were found in the data folder. Please create a directory starting with a ~ to use the preprocessor."
            )
        );
    }

    // finish timer
    console.log(chalk.green(`Build finished in ${timer.end} ms.`));
}
