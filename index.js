const fs = require('fs')
const path = require('path')
const debug = require('debug')('puml-compiler')
const {encode} = require('plantuml-encoder')
const request = require('request-promise')

const file = process.argv[2]
debug(`file: ${file}`)
const thisFile = path.basename(process.argv[1])

if (!file) {
	console.error(`Usage: ${thisFile} [/path/to/input.puml]`)
	process.exit(1)
}

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


debug({
	svgUrl,
	pngUrl
})

// fetch image and save to disk
debug('fetching images')

const pngProm = request.get(pngUrl, {encoding: null})
const svgProm = request.get(svgUrl)

debug('resolving promises')

Promise.all([pngProm, svgProm]).then(([png, svg]) => {
	debug('writing files')
	fs.writeFileSync('out.png', png)
	fs.writeFileSync('out.svg', svg)
	debug('files written')
})
