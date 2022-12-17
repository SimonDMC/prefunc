import fs from "fs";
import chalk from "chalk";
import { getAllNestedFiles, wipeDirectory, copyFile } from "./fileUtils.js";
import { parseGlobals, parseFile } from "./parser.js";
import { Timer } from "./timer.js";

const config = {
    rootDir: "./data",
    fileExtensions: ["mcfunction", "prefunc"],
};

// start timer
const timer = new Timer();

// get all folders in the root directory
const directories = fs.readdirSync(config.rootDir);
directories.forEach((dir) => {
    // if not a folder, skip it
    if (!fs.statSync(config.rootDir + "/" + dir).isDirectory()) {
        return;
    }

    // only allow working directories
    if (dir[0] != "~") {
        return;
    }

    const buildName = dir.replace("~", "");
    const files = getAllNestedFiles(config.rootDir + "/" + dir, []);

    // wipe build directory
    const buildDir = config.rootDir + "/" + buildName;
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

// finish timer
console.log(chalk.green("Build finished in " + timer.end + "ms"));
