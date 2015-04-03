import assert from "assert";
import extend from "lodash/object/extend";
import each from "lodash/collection/each";

module.exports = mocha => {
  // Setup mocha
  mocha.setup("qunit");

  // Require tests
  let
    tests = {
      fail: assert.bind(assert, false),
      pass: assert.bind(assert, true)
    },

    noop = () => {},

    run = (testFn, name) => {
      test(name, () => {
        testFn(extend({
          expect: noop,
          done: noop
        }, assert));
      });
    },

    runAll = tests => {
      suite("logdriver");
      each( tests, run );
      mocha.checkLeaks();
      mocha.run();
    };

  // Run tests
  runAll(tests);
};

