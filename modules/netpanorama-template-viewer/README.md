# NetPanorama Template Viewer

The [Ivy templating language](https://github.com/mcnuttandrew/ivy-language) provides a convenient way to define *templates* into which *parameters* cna be substituted to obtain a concrete specification.

This library accepts a template, and an object containing parameter values; it substitutes the parameter and renders the resulting NetPanorama specification.

## Development

Running `npm run build` will create the file `dist/bundle.js`.

## Usage

You will need to load the `dist/bundle.js` file to use the library.

The files in [`demo/`](demo) provide usage examples. 