#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const glob = require('glob');
const program = require('commander')
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
  write(processFiles(files));
}
else {
  processStream((dependencies) => {
    var result = {}; result[path.join(process.cwd(), '/')] = { deps: dependencies };
    write(result);
  });
}

function processFiles (files) {
  return files.reduce(function (accumulator, file) {
    accumulator[file] = { deps: pulldeps.fromSource(fs.readFileSync(file, 'utf8')).dependencies };
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

function write (entries) {
  const result = Object
    .keys(entries)
    .reduce((acc, entry) => {
      acc[entry] = { deps: filterVendor(entries[entry].deps) };
      return acc;
    }, {});

  process.stdout.write(JSON.stringify(result));
}

function filterVendor (dependencies) {
  return dependencies.filter((dependency) => /^[./]+/.test(dependency.name) === false);
}
