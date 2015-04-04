import browserify from "browserify";
import colors from "colors/safe";
import each from "lodash/collection/each";
import express from "express";
import extend from "lodash/object/extend";
import format from "format-json-stream";
import fs from "fs";
import mustache from "mustache-express";
import open from "open";
import path from "path";

const
  ROOT = __dirname,
  MODULES = `${ ROOT }/node_modules`,
  MOCHA = path.dirname(require.resolve('mocha')),

  tester = express();

// Setup tester to use current dir as default static folder
tester.use(
  express.static(ROOT)
);

// Additional config
tester.set("PORT", 3000);

// Vendor files
tester.get('/mocha.js', (_, res) => res.sendFile(`${ MOCHA }/mocha.js`));
tester.get('/mocha.css', (_, res) => res.sendFile(`${ MOCHA }/mocha.css`));

// Mustache template
tester.engine("mustache", mustache());
tester.get('/', function (req, res) {
  let customTestTemplate = tester.get("CUSTOM_HTML_PATH");

  if (customTestTemplate)
    fs.createReadStream(customTestTemplate)
      .pipe(res);

  else
    res.render(`${ ROOT }/src/test.mustache`);
});

// Test file
tester.get('/tests.js', (_, res) => {
  let
    testFile = tester.get("TEST_PATH"),
    bundle;

  if (!testFile)
    throw new Error("No test file configured");

  // Create browserify bundle
  bundle = browserify()
    .add(require.resolve("./client"), {entry: true})
    .require(require.resolve(testFile), {expose: "__client-test__"})
    .bundle();

  // Send bundle
  bundle.pipe(res);
});

// Status report endpoints
tester.post("/pass", (req, res) => {
  // Pipe test stats to stdout
  console.log(colors.green.bold("All tests passed."));

  if (tester.get("DEBUG"))
    req.pipe(format())
      .pipe(process.stdout);

  // Close request and exit
  res.status(200)
    .end();

  setImmediate(process.exit.bind(process, 0));
});

tester.post("/fail", (req, res) => {
  // Pipe test stats to stderr
  console.log(colors.red.bold("One or more tests failing."));

  if (tester.get("DEBUG"))
    req.pipe(format())
      .pipe(process.stderr);

  // Close request and exit
  res.status(200)
    .end();

  setImmediate(process.exit.bind(process, 1));
});

// Export tester object
extend(tester, {
  run: (config={}) => {
    let server;

    // Set config
    each(config, (v, k) => tester.set(k, v));

    // Start server
    server = tester.listen(tester.get("PORT"), () => {
      let { address, port } = server.address();

      // Open test result window
      console.log("Opening test result in new browser window");
      open("http://" + address + ':' + port);
    });
  }
});

export default tester;
