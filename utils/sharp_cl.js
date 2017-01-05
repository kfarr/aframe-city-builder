#!/usr/bin/env node
// experimental, uses "sharp" library a dependency that seems to fail on Windows machines, so not including this in package.json
// if you want to try it, use `npm install sharp` before trying to run this script
var argv = require('yargs')
    .usage('Create a resized and optimized JPEGs from high resolution source images.\nUsage: $0 <command> [options]')
    .option('outputpath', {
      alias: 'o',
      describe: 'output path to place finished files',
      default: './'
    })
    .option('inputpath', {
      alias: 'i',
      describe: 'path of files to scan',
      default: './'
    })
    .option('inputprefix', {
      default: '',
      describe: 'process only files with this prefix',
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

var files = fs.readdirSync(argv.inputpath);

files.forEach(file => {
  if (file.match("^" + argv.inputprefix) && file.match(argv.ext + "$")) {
    var filename = path.parse(file).name;

    sharp(file)
      .resize(argv.width, argv.height)
      .crop()
      .toFile(path.parse(file).name + argv.format, function(err, info) {
        if (err) {
          return console.log(err);
        }
        console.log('input: ' + file + '; output: ' + path.parse(file).name + argv.format);
      });

  }
});
