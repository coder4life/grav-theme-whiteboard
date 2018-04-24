#!/usr/bin/env node

/*!
 * Basic build runtime to reference when working in CLI. Note that functions should be atomic in nature, meaning
 * function should do one specific task (e.g. compile, package, ect.). Use NPM scripts to chain different command types
 * to avoid transition logic in this file for clarity.
 */

"use strict";

// Require configs
const config = require("config");

// Require module libraries
const fs = require("fs");
const path = require("path");
const glob = require("glob");
const crypto = require("crypto");
const isGlob = require("is-glob");
const shell = require("shelljs");

const buildDir = "build/tmp";

/**
 * CSS Compile
 */
function runCSSCompile() {
  let packages = getPackages("css", ["compile"]);
  packages.forEach((css, index) => {
    console.log("Run runCSSCompile: " + css.name + " [" + (index + 1) + "/" + packages.length + "]");
    if (Array.isArray(css.source)) { // array of source items
      css.source.forEach((source_item) => {
        if(isGlob(source_item.path)) { // glob array of files per source item
          globFiles(path.normalize(source_item.path)).forEach((file) => {
            let sourcePath = path.normalize(file);
            let namespacePath = getDirNamespace(source_item.path, css.name, css.flatten);
            let targetPath = path.format({
              root: "/",
              dir: path.join(css.target, namespacePath),
              name: path.parse(sourcePath).name,
              ext: ".css" });
            shell.exec(cmdNodeSass(sourcePath, targetPath));
          });
        } else {
          if (source_item.name) { // array of files per source item
            let sourcePath = path.normalize(source_item.path);
            let namespacePath = getDirNamespace(source_item.path, css.name, css.flatten);
            let targetPath = path.format({
              root: "/",
              dir: path.join(css.target, namespacePath),
              name: source_item.name,
              ext: ".css" });
            shell.exec(cmdNodeSass(sourcePath, targetPath));
          } else {
            let sourcePath = path.normalize(source_item.path);
            let namespacePath = getDirNamespace(source_item.path, css.name, css.flatten);
            let targetPath = path.format({
              root: "/",
              dir: path.join(css.target, namespacePath),
              name: path.parse(sourcePath).name,
              ext: ".css" });
            shell.exec(cmdNodeSass(sourcePath, targetPath));
          }
        }
      });
    } else { // source item
      if(isGlob(css.source)) { // glob of files
        globFiles(path.normalize(css.source)).forEach((file) => {
          let sourcePath = path.normalize(file);
          let namespacePath = getDirNamespace(css.source, css.name, css.flatten);
          let targetPath = path.format({
            root: "/",
            dir: path.join(css.target, namespacePath),
            name: path.parse(file).name,
            ext: ".css" });
          shell.exec(cmdNodeSass(sourcePath, targetPath));
        });
      } else { // direct file
        let sourcePath = path.normalize(css.source);
        let namespacePath = getDirNamespace(css.source, css.name, css.flatten);
        let targetPath = path.format({
          root: "/",
          dir: path.join(css.target, namespacePath),
          name: css.name,
          ext: ".css" });
        shell.exec(cmdNodeSass(sourcePath, targetPath));
      }
    }
    console.log("Finish runCSSCompile: " + css.name + " [" + (index + 1) + "/" + packages.length + "]\n");
  });
}

function cmdNodeSass(source, target) {
  console.log("cmdNodeSass - source: " + source + "; target: " + target);
  return "node-sass --output-style expanded --source-map true --source-map-contents true --precision 6 " + source +
    " " + target;
}

function runCSSPrefix() {
  let packages = getPackages("css", ["prefix"]);
  packages.forEach((css, index) => {
    console.log("Run runCSSPrefix: " + css.name + " [" + (index + 1) + "/" + packages.length + "]");
    if (Array.isArray(css.source)) { // array of source items
      css.source.forEach((source_item) => {
        if(isGlob(source_item.path)) { // glob array of files per source item
          globFiles(path.normalize(source_item.path)).forEach((file) => {
            let namespacePath = getDirNamespace(source_item.path, css.name, css.flatten);
            let sourcePath = path.format({
              root: "/",
              dir: path.join(css.target, namespacePath),
              name: path.parse(file).name,
              ext: ".css" });
            shell.exec(cmdCSSPrefix(sourcePath));
          });
        } else {
          if (source_item.name) { // array of files per source item
            let namespacePath = getDirNamespace(source_item.path, css.name, css.flatten);
            let sourcePath = path.format({
              root: "/",
              dir: path.join(css.target, namespacePath),
              name: source_item.name,
              ext: ".css" });
            shell.exec(cmdCSSPrefix(sourcePath));
          } else {
            let namespacePath = getDirNamespace(source_item.path, css.name, css.flatten);
            let sourcePath = path.format({
              root: "/",
              dir: path.join(css.target, namespacePath),
              name: path.parse(source_item.path).name,
              ext: ".css" });
            shell.exec(cmdCSSPrefix(sourcePath));
          }
        }
      });
    } else { // source item
      if(isGlob(css.source)) { // glob of files
        globFiles(path.normalize(css.source)).forEach((file) => {
          let sourcePath = path.format({
            root: "/",
            dir: path.join(css.target, getDirNamespace(css.source, css.name, css.flatten)),
            name: path.parse(file).name,
            ext: ".css" });
          shell.exec(cmdCSSPrefix(sourcePath));
        });
      } else { // direct file
        let sourcePath = path.format({
          root: "/",
          dir: path.join(css.target, getDirNamespace(css.source, css.name, css.flatten)),
          name: css.name,
          ext: ".css" });
        shell.exec(cmdCSSPrefix(sourcePath));
      }
    }
    console.log("Finish runCSSPrefix: " + css.name + " [" + (index + 1) + "/" + packages.length + "]\n");
  });
}

function cmdCSSPrefix(source) {
  console.log("cmdCSSPrefix - source: " + source);
  return "postcss --config build/postcss.config.js --replace " + source;
}

/**
 * CSS Package
 */
function runCSSPackage() {
  let packages = getPackages("css", ["!compile"]);
  packages.forEach((css, index) => {
    console.log("Run runCSSPackage: " + css.name + " [" + (index + 1) + "/" + packages.length + "]\n");
    createPackage(css.name, css);
    console.log("Finish runCSSPackage: " + css.name + " [" + (index + 1) + "/" + packages.length + "]\n");
  });
}

/**
 * CSS Clean / Minify
 */
function runCSSMinify() {
  let packages = getPackages("css", ["compile"]);
  packages.forEach((css, index) => {
    console.log("Run runCSSMinify: " + css.name + " [" + (index + 1) + "/" + packages.length + "]");
    if (Array.isArray(css.source)) { // array of source items
      css.source.forEach((source_item) => {
        if(isGlob(source_item.path)) { // glob array of files per source item
          globFiles(path.normalize(source_item.path)).forEach((file) => {
            let namespacePath = getDirNamespace(source_item.path, css.name, css.flatten);
            let sourcePath = path.format({
              root: "/",
              dir: path.join(css.target, namespacePath),
              name: path.parse(file).name,
              ext: ".css" });
            let targetPath = path.format({
              root: "/",
              dir: path.join(css.target, namespacePath),
              name: path.parse(file).name,
              ext: ".min.css" });
            shell.exec(cmdCleanCSS(sourcePath, targetPath));
          });
        } else {
          if (source_item.name) { // array of files per source item
            let namespacePath = getDirNamespace(source_item.path, css.name, css.flatten);
            let sourcePath = path.format({
              root: "/",
              dir: path.join(css.target, namespacePath),
              name: source_item.name,
              ext: ".css" });
            let targetPath = path.format({
              root: "/",
              dir: path.join(css.target, namespacePath),
              name: source_item.name,
              ext: ".min.css" });
            shell.exec(cmdCleanCSS(sourcePath, targetPath));
          } else {
            let namespacePath = getDirNamespace(source_item.path, css.name, css.flatten);
            let sourcePath = path.format({
              root: "/",
              dir: path.join(css.target, namespacePath),
              name: path.parse(source_item.path).name,
              ext: ".css" });
            let targetPath = path.format({
              root: "/",
              dir: path.join(css.target, namespacePath),
              name: path.parse(source_item.path).name,
              ext: ".min.css" });
            shell.exec(cmdCleanCSS(sourcePath, targetPath));
          }
        }
      });
    } else { // source item
      if(isGlob(css.source)) { // glob of files
        globFiles(path.normalize(css.source)).forEach((file) => {
          let namespacePath = getDirNamespace(css.source, css.name, css.flatten);
          let sourcePath = path.format({
            root: "/",
            dir: path.join(css.target, namespacePath),
            name: path.parse(file).name,
            ext: ".css" });
          let targetPath = path.format({
            root: "/",
            dir: path.join(css.target, namespacePath),
            name: path.parse(file).name,
            ext: ".min.css" });
          shell.exec(cmdCleanCSS(sourcePath, targetPath));
        });
      } else { // direct file
        let namespacePath = getDirNamespace(css.source, css.name, css.flatten);
        let sourcePath = path.format({
          root: "/",
          dir: path.join(css.target, namespacePath),
          name: css.name,
          ext: ".css" });
        let targetPath = path.format({
          root: "/",
          dir: path.join(css.target, namespacePath),
          name: css.name,
          ext: ".min.css" });
        shell.exec(cmdCleanCSS(sourcePath, targetPath));
      }
    }
    console.log("Finish runCSSMinify: " + css.name + " [" + (index + 1) + "/" + packages.length + "]\n");
  });
}

function cmdCleanCSS(source, target) {
  console.log("cmdCleanCSS - source: " + source + "; target: " + target);
  return "cleancss --level 1 --source-map --source-map-inline-sources --output " + target + " " + source;
}

/**
 * Font Package
 */
function runFontPackage() {
  let packages = getPackages("font");
  packages.forEach((font, index) => {
    console.log("Run runFontPackage: " + font.name + " [" + (index + 1) + "/" + packages.length + "]");
    createPackage(font.name, font);
    console.log("Finish runFontPackage: " + font.name + " [" + (index + 1) + "/" + packages.length + "]\n");
  });
}

function runJSPackage() {
  let packages = getPackages("js", ["!minify"]);
  packages.forEach((js, index) => {
    console.log("Run runJSPackage: " + js.name + " [" + (index + 1) + "/" + packages.length + "]");
    createPackage(js.name, js);
    console.log("Finish runJSPackage: " + js.name + " [" + (index + 1) + "/" + packages.length + "]\n");
  });
}

function runJSMinify() {
  let packages = getPackages("js", ["minify"]);
  packages.forEach((js, index) => {
    console.log("Run runJSMinify: " + js.name + " [" + (index + 1) + "/" + packages.length + "]");
    if (Array.isArray(js.source)) { // array of source items
      js.source.forEach((source_item) => {
        if(isGlob(source_item.path)) { // glob array of files per source item
          globFiles(path.normalize(source_item.path)).forEach((file) => {
            let sourcePath = path.normalize(file);
            let namespacePath = getDirNamespace(source_item.path, js.name, js.flatten);
            let targetPathDir = path.format({
              root: "/",
              dir: path.join(js.target, namespacePath),
            });
            let targetOrigPath = path.format({
              root: "/",
              dir: path.join(js.target, namespacePath),
              name: cleanName(path.parse(sourcePath).name, '.js'),
              ext: ".js" });
            let targetPath = path.format({
              root: "/",
              dir: path.join(js.target, namespacePath),
              name: cleanName(path.parse(sourcePath).name, '.js'),
              ext: ".min.js" });
            let sourceMapPath = path.format({
              root: "/",
              dir: path.join(js.target, namespacePath),
              name: cleanName(path.parse(sourcePath).name, '.js'),
              ext: ".js.map" });
            shell.mkdir("-p", targetPathDir);
            shell.cp(sourcePath, targetOrigPath);
            shell.exec(cmdMinifyJS(sourcePath, targetPath, sourceMapPath, cleanName(path.parse(sourcePath).name, '.js')));
          });
        } else {
          if (source_item.name) { // array of files per source item
            let sourcePath = path.normalize(source_item.path);
            let namespacePath = getDirNamespace(source_item.path, js.name, js.flatten);
            let targetPathDir = path.format({
              root: "/",
              dir: path.join(js.target, namespacePath),
            });
            let targetOrigPath = path.format({
              root: "/",
              dir: path.join(js.target, namespacePath),
              name: cleanName(source_item.name, '.js'),
              ext: ".js" });
            let targetPath = path.format({
              root: "/",
              dir: path.join(js.target, namespacePath),
              name: cleanName(source_item.name, '.js'),
              ext: ".min.js" });
            let sourceMapPath = path.format({
              root: "/",
              dir: path.join(js.target, namespacePath),
              name: cleanName(source_item.name, '.js'),
              ext: ".js.map" });
            shell.mkdir("-p", targetPathDir);
            shell.cp(sourcePath, targetOrigPath);
            shell.exec(cmdMinifyJS(sourcePath, targetPath, sourceMapPath, cleanName(source_item.name, '.js')));
          } else {
            let sourcePath = path.normalize(source_item.path);
            let namespacePath = getDirNamespace(source_item.path, js.name, js.flatten);
            let targetPathDir = path.format({
              root: "/",
              dir: path.join(js.target, namespacePath),
            });
            let targetOrigPath = path.format({
              root: "/",
              dir: path.join(js.target, namespacePath),
              name: cleanName(path.parse(sourcePath).name, '.js'),
              ext: ".js" });
            let targetPath = path.format({
              root: "/",
              dir: path.join(js.target, namespacePath),
              name: cleanName(path.parse(sourcePath).name, '.js'),
              ext: ".min.js" });
            let sourceMapPath = path.format({
              root: "/",
              dir: path.join(js.target, namespacePath),
              name: cleanName(path.parse(sourcePath).name, '.js'),
              ext: ".js.map" });
            shell.mkdir("-p", targetPathDir);
            shell.cp(sourcePath, targetOrigPath);
            shell.exec(cmdMinifyJS(sourcePath, targetPath, sourceMapPath, cleanName(path.parse(sourcePath).name, '.js')));
          }
        }
      });
    } else { // source item
      if(isGlob(js.source)) { // glob of files
        globFiles(path.normalize(js.source)).forEach((file) => {
          let sourcePath = path.normalize(file);
          let namespacePath = getDirNamespace(js.source, js.name, js.flatten);
          let targetPathDir = path.format({
            root: "/",
            dir: path.join(js.target, namespacePath),
          });
          let targetOrigPath = path.format({
            root: "/",
            dir: path.join(js.target, namespacePath),
            name: cleanName(path.parse(file).name, '.js'),
            ext: "js" });
          let targetPath = path.format({
            root: "/",
            dir: path.join(js.target, namespacePath),
            name: cleanName(path.parse(file).name, '.js'),
            ext: ".min.js" });
          let sourceMapPath = path.format({
            root: "/",
            dir: path.join(js.target, namespacePath),
            name: cleanName(path.parse(file).name, '.js'),
            ext: ".js.map" });
          shell.mkdir("-p", targetPathDir);
          shell.cp(sourcePath, targetOrigPath);
          shell.exec(cmdMinifyJS(sourcePath, targetPath, sourceMapPath, cleanName(path.parse(file).name, '.js')));
        });
      } else { // direct file
        let sourcePath = path.normalize(js.source);
        let namespacePath = getDirNamespace(js.source, js.name, js.flatten);
        let targetPathDir = path.format({
          root: "/",
          dir: path.join(js.target, namespacePath),
        });
        let targetPath = path.format({
          root: "/",
          dir: path.join(js.target, namespacePath),
          name: cleanName(js.name, '.js'),
          ext: ".min.js" });
        let targetOrigPath = path.format({
          root: "/",
          dir: path.join(js.target, namespacePath),
          name: cleanName(js.name, '.js'),
          ext: ".js" });
        let sourceMapPath = path.format({
          root: "/",
          dir: path.join(js.target, namespacePath),
          name: cleanName(js.name, '.js'),
          ext: ".js.map" });
        shell.mkdir("-p", targetPathDir);
        shell.cp(sourcePath, targetOrigPath);
        if(fs.existsSync(sourceMapPath)) {
          shell.exec(cmdMinifyJS(sourcePath, targetPath, sourceMapPath, cleanName(js.name, '.js')));
        } else {
          shell.exec(cmdMinifyJS(sourcePath, targetPath, false, cleanName(js.name, '.js')));
        }

      }
    }
    console.log("Finish runJSMinify: " + js.name + " [" + (index + 1) + "/" + packages.length + "]\n");
  });
}

function cmdMinifyJS(source, target, sourceMap, name) {
  console.log("cmdMinifyJS - source: " + source + "; target: " + target + "; sourceMap: " + sourceMap + "; sourceMapName: " + name);
  let sourceMapCmd = sourceMap ? "content='" + sourceMap + "' ": '';
  return "uglifyjs --compress typeofs=false --mangle --comments \"/^!/\" --source-map \"" + sourceMapCmd +
    "includeSources, url=" + name + ".min.js.map\" --output " + target +  " " + source;
}

/**
 * Helper functions
 */

// glob array of files per source item
/*function arrayOfGlobFiles() {

}*/

function cleanName(text, remove_text) {
  return text.replace(remove_text, '');
}

function createPackage(name, pkg) {
  if (Array.isArray(pkg.source)) {
    pkg.source.forEach((source_item) => {
      if(isGlob(source_item.path)) { // glob array of files per source item
        globFiles(path.normalize(source_item.path)).forEach((file) => {
          copyPackageItem(name, pkg, file);
        });
      } else {
        copyPackageItem(name, pkg, source_item.path);
      }
    });
  } else {
    if (isGlob(pkg.source)) {
      globFiles(path.normalize(pkg.source)).forEach((file) => {
        copyPackageItem(name, pkg, file);
      });
    } else {
      copyPackageItem(name, pkg);
    }
  }
}

function copyPackageItem(name, pkg, item = false) {
  let sourcePath = path.normalize(item ? item : pkg.source);
  let namespacePath = getDirNamespace(pkg.source, name, pkg.flatten);
  let targetPathDir = path.format({
    root: "/",
    dir: path.join(pkg.target, namespacePath)
  });
  let targetPath = path.format({
    root: "/",
    dir: path.join(pkg.target, namespacePath),
    name: path.parse(sourcePath).name,
    ext: path.parse(sourcePath).ext
  });
  shell.mkdir("-p", targetPathDir);
  shell.cp(sourcePath, targetPath);
}

function getPackages(type, filter) {
  filter = filter ? filter : [];
  if(type === "css" ) {
    return config.get("packages.css").filter(item => {
      if(item.compile && filter.includes("compile")) {
        return item;
      } else if(!item.compile && filter.includes("!compile")) {
        return item;
      }
      if(item.prefix && filter.includes("prefix")) {
        return item;
      } else if(!item.prefix && filter.includes("!prefix")) {
        return item;
      }
    })
  }
  else if (type === "font") {
    return config.get("packages.font");
  } else if (type === "js") {
    return config.get("packages.js").filter(item => {
      if(item.minify && filter.includes("minify")) {
        return item;
      } else if(!item.minify && filter.includes("!minify")) {
        return item;
      }
    })
  } else {
    throw "Not a package type";
  }
}

function getDir(dirpath) {
  return getPath(dirpath).dir;
}

function getDirNamespace(dirPath, keyword, flatten, split = "/", ) {
  let resultDirList;
  let dirList = getDir(dirPath).split(split);
  let index = dirList.indexOf(keyword);
  if(index === -1 || flatten) {
    resultDirList = [keyword];
  } else {
    resultDirList = dirList.splice(index, dirList.length - 1);
  }
  return resultDirList.join("/");
}

function getFile(filepath, extension = true) {
  if (extension === true) {
    return getPath(filepath).base;
  } else {
    return getPath(filepath).name;
  }
}

function globFiles(source) {
  let sourceList = [];
  let files = glob.sync(source);
  if(source.flatten && source.name) {
    files.forEach((file) => {
      source = path.normalize(writeTmp(file, source.name));
    });
    return sourceList.push(source);
  } else {
    files.forEach((file) => {
      sourceList.push(path.normalize(file));
    });
    return sourceList;
  }
}

function getPath(itemPath) {
  return path.parse(path.normalize(itemPath));
}

function writeTmp(file, name) {
  let namespace;
  let content = fs.readFileSync(file, "utf8", function (error) {
    if (error) {
      throw "Something went wrong when reading the file: " + file;
    }
  });
  let hashname = crypto.createHash("md5").update(content).digest("hex");
  if (typeof name === "undefined" || name === null) {
    namespace = getFile(file, false);
  } else {
    namespace = name + "_" + getFile(file, false);
  }
  let sourceDir = path.format({
    root: "/",
    dir: path.join(process.cwd(), buildDir, hashname),
    name: namespace,
    ext: ".scss"
  });
  let filepath = path.format({
    root: "/",
    dir: path.join(buildDir, hashname),
    name: namespace,
    ext: ".scss"
  });
  shell.mkdir("-p", "build/tmp" + hashname);
  fs.writeFile(filepath, content, (error) => {
    if (error) {
      throw "Something went wrong when writing the file: " + filepath;
    }
  });
  return filepath;
}

/**
 * Primary functions
 */

function init() {
  shell.mkdir("-p", buildDir);
}

function cleanup() {
  shell.rm("-rf", buildDir);
}

function main(args) {
  if (args.length >= 1) {
    init();
    if (args[0] === "css-compile") {
      runCSSCompile();
    } else if (args[0] === "css-minify") {
      runCSSMinify();
    } else if (args[0] === "css-package") {
      runCSSPackage();
    } else if (args[0] === "css-prefix") {
      runCSSPrefix();
    } else if (args[0] === "font-package") {
      runFontPackage();
    } else if (args[0] === "js-minify") {
      runJSMinify();
    } else if (args[0] === "js-package") {
      runJSPackage();
    } else {
      console.log("Wrong arguments!");
      console.log("Usage: build.js <command>");
      process.exit(1)
    }
    cleanup();
  }
}

main(process.argv.slice(2));