#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const debug = require('debug')('puml-compiler')
const {encode} = require('plantuml-encoder')
const request = require('request-promise')
const {argv} = require('yargs')

const {file} = argv
debug(`file: ${file}`)

if (argv.help || argv.h || typeof file === 'boolean' || !file || !(argv.png || argv.svg || argv.ascii)) {
	const thisFile = path.basename(process.argv[1])
	console.error(`Usage: ${thisFile} [options]`)
	console.error('Options:')
	console.error('	--file=...		filename to compile')
	console.error('	-h, --help		show this dialog')
	console.error('	--png			save as png')
	console.error('	--svg			save as svg')
	console.error(' --ascii 		print the diagram as ASCII art')
	process.exit(1)
}

// get outfile name
const fileArr = file.split('.')
fileArr.pop()
const outfile = fileArr.join('.')

// read file
debug('reading file')
const contents = fs.readFileSync(file).toString()

// compile
debug('compiling...')
const encoded = encode(contents)

// request image
debug('generating image url')
const svgUrl = `http://www.plantuml.com/plantuml/svg/${encoded}`
const pngUrl = `http://www.plantuml.com/plantuml/img/${encoded}`
const asciiUrl = `http://www.plantuml.com/plantuml/txt/${encoded}`
debug({svgUrl, pngUrl})

// fetch image and save to disk
debug('fetching images')

if (argv.png) request.get(pngUrl, {encoding: null}).then((png) => fs.writeFileSync(`${outfile}.png`, png))

if (argv.svg) request.get(svgUrl).then((svg) => fs.writeFileSync(`${outfile}.svg`, svg))

if (argv.ascii) request.get(asciiUrl).then(console.log)

debug('files written')
