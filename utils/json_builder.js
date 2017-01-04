#!/usr/bin/env node
var argv = require('yargs')
    .usage('Create a JSON file for use by City Builder from a directory of 3D model files.\nUsage: $0 <command> [options]')
    .option('output', {
      alias: 'o',
      describe: 'JSON output filename'
    })
    .option('inputpath', {
      alias: 'i',
      describe: 'path of objects to scan'
    })
    .default('inputpath', './')
    .default('prefix', '')
    .alias('prefix', 'p')
    .default('ext', '.obj')
    .default('scale', '0.005 0.005 0.005')
    .demandOption('output')
    .example('$0 -i ../assets/obj/ -o ../assets/mmmm_alien.json -p alien\n')
    .example('$0 -i ../assets/obj/ -o ../assets/mmmm_scene.json -p scene --scale "0.004 0.004 0.004"')
    .help()
    .argv
const fs = require('fs');
const path = require('path');

var outputJSON = [];

var files = fs.readdirSync(argv.inputpath);

files.forEach(file => {
  if (file.match("^" + argv.prefix) && file.match(argv.ext + "$")) {
    var fileEntry = {
        file: path.parse(file).name,
        scale: argv.scale
    };
    outputJSON.push(fileEntry);
//    console.log(fileEntry);
  }
});

var jsonData = JSON.stringify(outputJSON, null, 2);

fs.writeFile(argv.output, jsonData, function (err, data) {
  if (err) {
    return console.log(err);
  }
//  console.log(data);
  console.log("Success! Wrote to " + argv.output);
});
