# Inner Melbourne Football League

In visual studio, hitting run will invoke node to process the allyears.csv file into the yeardata folder, using the splitfiles.js tool.

Otherwise, webpack will process src/index.js, into the dist folder

The dist folder also requires a copy of index.html and the yeardata folder

## TODO

- [x] South Melbourne and Fitzroy
- [x] Ladder
- [x] in the finals, in the round-template, replace "Round" with "Finals week"
- [x] if it's <=1996, fitzroy should always be included, and no option to take them out
- [x] add css to webpack
- [ ] add npm task for preparation, or find ways to pass through needed files to dist folder
- [ ] possibly save results files as json and load them directly into the vue App
