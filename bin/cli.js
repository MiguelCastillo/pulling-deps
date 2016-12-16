#!/usr/bin/env node

var fs = require("fs");
var pulldeps = require("../src/index");
var args = process.argv.slice(2);

if (args[0] === '-f') {
  args.shift();

  var dependencies = args
    .map(function(fileName) {
      var text = fs.readFileSync(fileName, "utf8");
      return pulldeps(text).dependencies;
    });

  write(dependencies);
}
else {
  var text = "";
  process.stdin.setEncoding("utf8");

  process.stdin.on("readable", function() {
    var chunk;
    while (chunk = process.stdin.read()) {
      text += chunk;
    }
  });

  process.stdin.on("end", function () {
    write(pulldeps(text).dependencies);
  });
}

function write(dependencies) {
  var deps = flatten(dependencies)
    .filter(function(dependency) {
      return /^[\.\/]+/.test(dependency) === false;
    })
    .map(function(dependency) {
        return dependency.split("/").shift();
    })
    .reduce(function(result, item) {
      result[item] = true;
      return result;
    }, {});

  process.stdout.write(Object.keys(deps).join(" "));
}

function flatten(input) {
  return input.reduce(function(result, item) {
    return result.concat(item instanceof Array ? flatten(item) : item)
  }, []);
}
