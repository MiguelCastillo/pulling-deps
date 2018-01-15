#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const glob = require('glob');
const program = require('commander')
const resolve = require('resolve');
const pulldeps = require('../src/index');

function resolveGlob (value, items) {
  return items.concat([]
    .concat(value)
    .reduce((acc, val) => acc.concat(glob.sync(val, { cwd: process.cwd(), realpath: true })), [])
  );
}

program
  .option('-f, --files <items>', 'String glob of files to process', resolveGlob, [])
  .parse(process.argv);

const files = program.files.concat(resolveGlob(program.args, []));

if (files.length) {
  write(buildTree(processFiles(files)));
}
else {
  processStream((dependencies) => {
    const result = {}; result[path.join(process.cwd(), '/')] = { deps: dependencies };
    write(buildTree(result));
  });
}

function buildTree (nodes) {
  var visited = {};
  var result = Object.assign({}, nodes);
  var paths = Object.keys(nodes);
  var index = 0;

  for (; index < paths.length; index++) {
    var fullPath = paths[index];

    if (visited[fullPath]) {
      continue;
    }

    visited[fullPath] = true;

    var resolvedNodes = result[fullPath].deps = resolveNodes(result[fullPath].deps, fullPath);
    var newNodes = processFiles(resolvedNodes.map(node => node.path));
    paths = paths.concat(Object.keys(newNodes));
    Object.assign(result, newNodes);
  }

  // Make sure we tag the root modules.
  Object.keys(nodes).forEach(item => (result[item].entry = true));
  return result;
}

function resolveNodes (nodes, referrer) {
  return nodes.map((node) => Object.assign({ path: resolve.sync(node.name, { basedir: getDirectory(referrer) }) }, node));
}

function processFiles (files) {
  return files.reduce(function (accumulator, file) {
    accumulator[file] = {
      deps: pulldeps.fromSource(fs.readFileSync(file, 'utf8')).dependencies
    };
    return accumulator;
  }, {});
}

function processStream (cb) {
  var text = '';
  process.stdin.setEncoding('utf8');

  process.stdin.on('readable', function () {
    var chunk;
    while ((chunk = process.stdin.read())) {
      text += chunk;
    }
  });

  process.stdin.on('end', function () {
    cb(pulldeps.fromSource(text).dependencies);
  });
}

function getDirectory (path) {
  return path && path.replace(/([^/]+)$/gm, '');
}

function write (entries) {
  process.stdout.write(JSON.stringify(entries));
}
