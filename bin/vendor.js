#!/usr/bin/env node

const program = require('commander')
const processStdin = require('./processStdin');
const trimPath = require('../src/trimPath');
const processFiles = require('../src/processFiles');
const resolveGlob = require('../src/resolveGlob');
const makeBoolean = require('../src/makeBoolean');
const loadPlugin = require('../src/loadPlugin');

program
  .option('-f, --files <items>', 'String glob of files to process', resolveGlob, [])
  .option('-s, --source [value]', 'Boolean flag for including the source string in the tree', makeBoolean, false)
  .option('-t, --transform <transform>', 'List of transforms to apply to each file before processing dependencies', loadPlugin, [])
  .parse(process.argv);

const files = program.files.concat(resolveGlob(program.args, []));

if (files.length) {
  write(processFiles(files.map(trimPath), program.transform));
}
else {
  processStdin(write, program.transform);
}

function write (entries) {
  const result = Object
    .keys(entries)
    .reduce((acc, entry) => {
      acc[entry] = Object.assign({}, entries[entry], { deps: filterVendor(entries[entry].deps) });
      return acc;
    }, {});

  process.stdout.write(JSON.stringify(result));
}

function filterVendor (dependencies) {
  return dependencies.filter((dependency) => /^[./]+/.test(dependency.name) === false);
}
