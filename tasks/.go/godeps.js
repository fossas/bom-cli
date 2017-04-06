var fs = require('fs')
var path = require('path')
var readline = require('readline')

function read (cb) {
  var lines = []
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  })
  rl.on('line', function (line) {
    lines.push(line.trim())
  })
  rl.on('close', function () {
    cb(null, lines)
  })
  rl.on('error', cb)
}

function output (lines) {
  console.log(lines.join('\n'))
}

function filter (importPath, lines) {
  if (!importPath) return lines

  var importPathLocator = 'go+' + importPath.replace(/\/+$/, '')
  var line = null
  var substring = null
  var newLines = []
  for (var i = 0; i < lines.length; ++i) {
    line = lines[i]
    substring = line.substring(importPathLocator.length)
    if (line.indexOf(importPathLocator) !== 0 || (substring && substring.indexOf('/') !== 0 && substring.indexOf('$') !== 0)) {
      newLines.push(line)
    }
  }
  return newLines
}

function operate (lookup, lines) {
  var line = null
  var revision = null
  var newLines = []
  for (var i = 0; i < lines.length; ++i) {
    line = lines[i]

    revision = lookup[line.substring(3)]
    if (revision) {
      newLines.push(line + '$' + revision)
    } else {
      newLines.push(line)
    }
  }
  return newLines
}

function main (args) {
  var goPath = args[0]
  var importPath = args[1]

  read(function (err, lines) {
    if (err) {
      console.error(err)
      return output(lines)
    }

    var godepsFile = path.join(goPath, importPath, 'Godeps', 'Godeps.json')

    try {
      fs.lstatSync(godepsFile)
    } catch (err) {
    // Pass because it means that the godeps file does not exist
      return output(lines)
    }

    try {
      var godepsObject = JSON.parse(fs.readFileSync(godepsFile, 'utf8'))
    } catch (err) {
    // Pass because it means the Godeps file is malformed.
      return output(lines)
    }

    var lookup = {}

    for (var i = 0; i < godepsObject.Deps.length; ++i) {
      lookup[godepsObject.Deps[i].ImportPath.trim()] = godepsObject.Deps[i].Rev.trim()
    }

    output(operate(lookup, filter(importPath || godepsObject.ImportPath, lines)))
  })
}

main(process.argv.slice(2))
