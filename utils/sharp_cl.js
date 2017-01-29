#!/usr/bin/env node
// experimental, uses "sharp" library a dependency that seems to fail on Windows machines, so not including this in package.json
// if you want to try it, use `npm install sharp` before trying to run this script
var argv = require('yargs')
    .usage('*** COMMAND LINE OPTIONS ARE IGNORED, I CANNOT GET YARGS TO WORK RIGHT, so edit this js file directly\nCreate a resized and optimized JPEGs from high resolution source images.\nUsage: $0 <command> [options]')
    .option('outputpath', {
      alias: 'o',
      describe: 'output path to place finished files',
      type: 'string',
      default: './'
    })
    .option('inputpath', {
      alias: 'i',
      describe: 'path of files to scan',
      type: 'string',
      default: '../assets/preview'
    })
    .option('inputprefix', {
      default: '',
      describe: 'process only files with this prefix',
      type: 'string',
      alias: 'ip'
    })
    .option('outputprefix', {
      default: '',
      describe: 'prefix prepended on output files',
      alias: 'op'
    })
    .option('ext', {
      default: '.png',
      describe: 'accepted extension for input files',
      alias: 'e'
    })
    .option('height', {
      default: 256,
      describe: 'output height',
      alias: 'h'
    })
    .option('width', {
      default: 256,
      describe: 'output width',
      alias: 'h'
    })
    .option('format', {
      default: '.jpg',
      describe: 'output image file format',
      alis: 'f'
    })
    .example('$0 -i ../assets/preview/ -o ../assets/preview/ -p preview\n')
    .help()
    .argv

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

var inputPath = "../assets/preview/";
// var inputpath = argv.inputpath[0];
console.log("inputPath: " + inputPath);

var inputPrefix = "bld";
// var inputprefix = argv.inputprefix[0];
console.log("inputPrefix: " + inputPrefix);

var ext = ".png";
// var ext = argv.ext;
console.log("ext: " + ext);

// var outputWidth = argv.width;
var outputWidth = 256;
console.log("outputWidth: " + outputWidth);

// var outputHeight = argv.height;
var outputHeight = 256;
console.log("outputHeight: " + outputHeight);

var outputPath = "./";
// var outputPath = argv.outputpath;
console.log("outputPath: " + outputPath);

var outputFormat = ".jpg";
// var outputFormat = argv.format;
console.log("outputFormat: " + outputFormat);

var files = fs.readdirSync(inputPath);

files.forEach(file => {
  if (file.match("^" + inputPrefix) && file.match(ext + "$")) {
    var filename = path.parse(file).name;
    console.log('input: ' + inputPath + file);

    sharp(inputPath + file)
//      .extract({ left: outputWidth / 2, top: outputHeight / 2, width: outputWidth, height: outputHeight })
      .resize(outputWidth, outputHeight)
//      .crop()
      .jpeg({quality: 91})
      .toFile(outputPath + path.parse(file).name + outputFormat, function(err, info) {
        if (err) {
          return console.log(err);
        }
        console.log('output: ' + outputPath + path.parse(file).name + outputFormat);
      });

  }
});
