#!/usr/bin/env node

let shell = require('shelljs');
let colors = require('colors');
const inquirer = require("inquirer");
let fs = require('fs');
let templates = require('./templates/templates.js')

// Name that user will provide for his directory
let appName = process.argv[2];
// Path that user will provide, this is where we need to have the create-react-app install
let appDirectory = `${process.cwd()}/${appName}`;

// Ask questions to know the users' requirements
const askQuestions = () => {
  const questions = [
    {
      name: "useRedux",
      type: "input",
      message: "Do you want to configure redux? (y/n)"
    }, {
      name: "useThunk",
      type: "input",
      message: "Do you want to configure redux-thunk? (y/n)"
    }, {
      name: "useTypescript",
      type: "input",
      message: "Do you want to configure Typescrip? (y/n)"
    }, {
      name: "useReactRouter",
      type: "input",
      message: "Do you want to configure React Router? (y/n)"
    }
  ];
  return inquirer.prompt(questions);
};


// This function returns a promise which first checks if an app name is provided,
// and then executes the create-react-app command, passing in appName as the first parameter
const createReactApp = () => {
  return new Promise(resolve => {
    if (appName) {
      shell.exec(`create-react-app ${appName}`, () => {
        console.log("Created react app")
        resolve(true)
      })
    } else {
      console.log("\nNo app name was provided.".red)
      console.log("\nProvide an app name in the following format: ")
      console.log("\ncreate-react-redux-router-app ", "app-name\n".cyan)
      resolve(false)
    }
  })
}

// cd into the new directory and return a promise
const cdIntoNewApp = () => {
  return new Promise(resolve => {
    shell.exec(`cd ${appName}`, () => { resolve() })
  })
}

// Executes yarn add and then resolves
const installPackages = ({ useRedux, useThunk, useTypescript, useReactRouter }) => {
  return new Promise(resolve => {
    // console.log("\nInstalling redux, react-router, react-router-dom, react-redux, and redux-thunk\n".cyan)
    if (useRedux) {
      console.log("\nInstalling Redux\n".cyan)
      shell.exec(`sudo npm install --save redux redux-thunk`, () => {
        console.log("\nFinished installing Redux\n".green)
        if (useThunk) {
          console.log("\nInstalling Redux-Thunk\n".cyan)
          shell.exec(`sudo npm install --save redux-thunk`, () => {
            console.log("\nFinished installing Redux-Thunk\n".green)
            if (useReactRouter) {
              console.log("\nInstalling React-Router\n".cyan)
              shell.exec(`sudo npm install --save react-router react-router-dom`, () => {
                console.log("\nFinished installing React-Router\n".green)
                resolve()
              })
            } else {
              resolve()
            }
          })
        } else {
          resolve()
        }
      })
    }
  })
}

const updateTemplates = () => {
  return new Promise(resolve=>{
    let promises = []
    Object.keys(templates).forEach((fileName, i)=>{
      promises[i] = new Promise(res=>{
        fs.writeFile(`${appDirectory}/src/${fileName}`, templates[fileName], function(err) {
            if(err) { return console.log(err) }
            res()
        })
      })
    })
    Promise.all(promises).then(()=>{resolve()})
  })
}


// Run create-react-app, then, if it was successful, we cd into the new directory,
// install our extra packages, update some of the files with our own templates.
const run = async () => {
  let success = await createReactApp()
  if (!success) {
    console.log('Something went wrong while trying to create a new React app using create-react-app'.red)
    return false;
  }

  const answers = await askQuestions();
  await cdIntoNewApp()
  await installPackages(answers)
  await updateTemplates()
  console.log("All done")
}
run()