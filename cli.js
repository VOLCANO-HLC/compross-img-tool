#!/usr/bin/env node

import traverseAndCompress from "./index.js";
import path from "path";
import inquirer from "inquirer";

const args = process.argv.slice(2);
const currentDirectory = process.cwd();
const quality = args[0] ? parseInt(args[0], 10) : 80;

async function confirmBackupAndCompress() {
  const answer = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmBackup",
      message: "压缩后会直接替换原图，请确认是否已备份原图?",
      default: false,
    },
  ]);

  if (answer.confirmBackup) {
    traverseAndCompress(currentDirectory, quality);
  } else {
    console.log("Please back up your images before proceeding.");
  }
}

confirmBackupAndCompress();
