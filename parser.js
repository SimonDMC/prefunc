import chalk from "chalk";
import fs from "fs";
import { createFile } from "./fileUtils.js";

/**
 * Lists all global variables in a file
 * @param {string[]} lines File contents split into lines
 * @param {string} file File path
 * @returns {object} Object containing all global variables
 */
export function parseGlobals(lines, file) {
    const globals = {};

    lines.forEach((line, index) => {
        if (!line.trim().startsWith("#!")) {
            return;
        }
        // variable declaration
        if (/^#!\s*def\s+\*/.test(line)) {
            try {
                const variableName = line.split("*")[1].split("=")[0].trim();
                const response = parseVariable(variableName, line);
                for (let i = 0; i < response[0].length; i++) {
                    globals[response[0][i]] = response[1][i];
                }
                return;
            } catch (e) {
                console.error(
                    chalk.red(
                        "Error parsing variable declaration on line " +
                            (index + 1) +
                            " in file " +
                            file
                    )
                );
            }
        }
    });

    return globals;
}

/**
 * Parses a file and does all the necessary replacements
 * @param {string} file File path
 * @param {object} globals Object containing all global variables
 */
export function parseFile(file, globals) {
    // read the file and split into lines
    const fileContents = fs.readFileSync(file, "utf8");
    const lines = fileContents.split("\n");

    const variables = {};
    const newLines = JSON.parse(JSON.stringify(lines));

    let extraIndex = 0;

    lines.forEach((line, index) => {
        if (!line.trim().startsWith("#!")) {
            return;
        }
        // variable declaration
        if (line.trim().replace(/ /g, "").startsWith("#!def")) {
            // ignore global variables
            if (line.includes("*")) return;

            try {
                const variableName = line.split("def ")[1].split("=")[0].trim();

                const response = parseVariable(variableName, line);
                for (let i = 0; i < response[0].length; i++) {
                    variables[response[0][i]] = response[1][i];
                }
            } catch (e) {
                console.error(
                    chalk.red(
                        "Error parsing variable declaration on line " +
                            (index + 1) +
                            " in file " +
                            file
                    )
                );
            }
            return;
        }

        // embedded command
        if (!/<.+>/g.test(line)) {
            console.error(
                chalk.red(
                    "Embedded command has no variables on line " +
                        (index + 1) +
                        " in file " +
                        file
                )
            );
            return;
        }
        const firstVariable = line.split("<")[1].split(">")[0];
        const size =
            variables[firstVariable]?.length ?? globals[firstVariable].length;
        for (let i = 0; i < size; i++) {
            let newLine = line;
            const variablesToReplace = line.match(/<.+?>/g);
            for (const variable of variablesToReplace) {
                const variableName = variable.replace(/[<>]/g, "");
                const value =
                    variables[variableName]?.[i] ??
                    globals[variableName]?.[i] ??
                    variableName;
                newLine = newLine
                    .replace(variable, value)
                    .replace(/#!/g, "")
                    .trim();
            }
            // insert the new line
            extraIndex++;
            newLines.splice(index + extraIndex, 0, newLine);
        }
    });

    // remove all prefunc lines
    const filteredLines = newLines.filter(
        (line) => !line.trim().startsWith("#!")
    );

    // write the new file to build dir
    createFile(file.replace("~", ""), filteredLines.join("\n"));
}

/**
 * Parses a variable declaration
 * @param {string} variableName Name of the variable
 * @param {string} line Line containing the variable declaration
 * @returns {string[][]} Array containing the variable names and their values
 */
export function parseVariable(variableName, line) {
    const mapFields = variableName.split(":");
    const mapValues = line
        .split("=")[1]
        .trim()
        .split(",")
        .map((v) =>
            v
                .trim()
                .split(":")
                .map((v) => v.trim())
        );

    const mapChunks = [mapFields, []];
    for (let i = 0; i < mapFields.length; i++) {
        mapChunks[1].push([]);
        for (const element of mapValues) {
            mapChunks[1][i].push(element[i]);
        }
    }

    return mapChunks;
}
