#!/usr/bin/env node

const program = require('commander')
const processStdin = require('./processStdin');
const processFiles = require('./processFiles');
const resolveGlob = require('./resolveGlob');
const makeBoolean = require('./makeBoolean');

program
  .option('-f, --files <items>', 'String glob of files to process', resolveGlob, [])
  .option('-s, --source [value]', 'Boolean flag for including the source string in the tree', makeBoolean, false)
  .parse(process.argv);

const files = program.files.concat(resolveGlob(program.args, []));

if (files.length) {
  write(processFiles(files, program.source));
}
else {
  processStdin(write, program.source);
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
