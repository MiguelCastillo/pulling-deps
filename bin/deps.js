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
  process.stdout.write(JSON.stringify(entries));
}
