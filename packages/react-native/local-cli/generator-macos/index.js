// @ts-check

'use strict';

const {
  copyAndReplaceAll,
  createDir,
} = require('../generator-common');
const chalk = require('chalk');
const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const macOSDir = 'macos';
const oldProjectName = 'HelloWorld';

/**
 * @param {string} srcRootPath
 * @param {string} destPath
 * @param {string} newProjectName
 * @param {{ overwrite?: boolean }} options
 */
function copyProjectTemplateAndReplace(
  srcRootPath,
  destPath,
  newProjectName,
  options = {}
) {
  if (!srcRootPath) {
    throw new Error('Need a path to copy from');
  }

  if (!destPath) {
    throw new Error('Need a path to copy to');
  }

  if (!newProjectName) {
    throw new Error('Need a project name');
  }

  createDir(path.join(destPath, macOSDir));
  createDir(path.join(destPath, srcDirPath(newProjectName, 'macOS')));
  createDir(path.join(destPath, xcodeprojPath(newProjectName)));
  createDir(path.join(destPath, schemesPath(newProjectName)));

  const templateVars = {
    [oldProjectName]: newProjectName,
  };

  [
    { from: path.join(srcRootPath, macOSDir, 'Podfile'), to: path.join(macOSDir, 'Podfile') },
    { from: path.join(srcRootPath, macOSDir, '_gitignore'), to: path.join(macOSDir, '.gitignore') },
    { from: path.join(srcRootPath, srcDirPath(oldProjectName, 'macOS')), to: srcDirPath(newProjectName, 'macOS') },
    { from: path.join(srcRootPath, pbxprojPath(oldProjectName)), to: pbxprojPath(newProjectName) },
    { from: path.join(srcRootPath, schemePath(oldProjectName, 'macOS')), to: schemePath(newProjectName, 'macOS') },
  ].forEach((mapping) => copyAndReplaceAll(mapping.from, destPath, mapping.to, templateVars, options.overwrite));
}

/**
 * @param {string} basename
 * @param {"iOS" | "macOS"} platform
 */
function projectName(basename, platform) {
  return basename + '-' + platform;
}

/**
 * @param {string} basename
 * @param {"iOS" | "macOS"} platform
 */
function srcDirPath(basename, platform) {
  return path.join(macOSDir, projectName(basename, platform));
}

/**
 * @param {string} basename
 */
function xcodeprojPath(basename) {
  return path.join(macOSDir, basename + '.xcodeproj');
}

/**
 * @param {string} basename
 */
function pbxprojPath(basename) {
  return path.join(xcodeprojPath(basename), 'project.pbxproj');
}

/**
 * @param {string} basename
 */
function schemesPath(basename) {
  return path.join(xcodeprojPath(basename), 'xcshareddata', 'xcschemes');
}

/**
 * @param {string} basename
 * @param {"iOS" | "macOS"} platform
 */
function schemePath(basename, platform) {
  return path.join(schemesPath(basename), projectName(basename, platform) + '.xcscheme');
}

/**
 * @param {{ verbose?: boolean }=} options
 */
function installDependencies(options) {
  const cwd = process.cwd();

  // Install dependencies using correct package manager
  const isYarn = fs.existsSync(path.join(cwd, 'yarn.lock'));

  /** @type {{ stdio?: 'inherit' }} */
  const execOptions = options && options.verbose ? { stdio: 'inherit' } : {};
  childProcess.execSync(isYarn ? 'yarn' : 'npm i', execOptions);
}

/**
 * @param {string} newProjectName
 */
function printFinishMessage(newProjectName) {
  console.log(`
  ${chalk.blue(`Run instructions for ${chalk.bold('macOS')}`)}:
    • pod install --project-directory=macos
    • npx react-native run-macos
    • yarn start:macos
`);
}

module.exports = {
  copyProjectTemplateAndReplace,
  installDependencies,
  printFinishMessage,
};
