import opts from "nomnom";
import tester from "./";

// Setup options
opts
  .script("cafe")
  .option("path", {
    position: 0,
    help: "Test file to run. Please prepend './' for relative paths",
    metavar: "PATH",
    type: "string",
    required: true,
    callback (path) {
      // Make sure file exists
      try {
        require.resolve(path);
      } catch ({message}) {
        // Print error message and exit
        return `Invalid test file path. Error: ${ message }`;
      }

      tester.set("TEST_PATH", path);
    }
  })
  .option("port", {
    abbr: 'p',
    default: 3000,
    metavar: "PORT",
    help: "Change the port that the test server will use",
    callback (port) {
      if (port !== Math.round(port))
        return "PORT needs to be an integral value";

      else
        tester.set("PORT", +port);
    }
  })
  .option("debug", {
    abbr: 'd',
    flag: true,
    default: false,
    help: "Output test stats after completion",
    callback (arg) {
      tester.set("DEBUG", !!arg);
    }
  });

// Run
if (opts.parse())
  tester.run();
