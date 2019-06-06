#!/usr/bin/env node

var program = require("commander");
var inquirer = require("inquirer");
var preboot = require("../lib/cli/preboot");
var libData = require("../lib/cli/index");
// console.log("dawnship", dawnship);
console.log("\n");
inquirer
  .prompt([
    {
      type: "list",
      name: "task",
      message: "What do you want to do?",
      choices: ["Build Model Schema", "Generate all files", "Exit"],
      filter: function(val) {
        return val.toLowerCase();
      }
    }
  ])
  .then(answers => {
    // console.log(answers);
    switch (answers.task) {
      case "build model schema":
        (async () => {
          await preboot.config;
          await libData.buildModelSchemasOnly();
          console.log("built models...");
        })();

        break;
      case "generate all files":
        (async () => {
          await preboot.config;
          await libData.ensureFilestructure();
          console.log("rebuilt all files needed...");
        })();
        break;
      default:
        console.log("exit");
    }
  });
