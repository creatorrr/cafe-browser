import extend from "lodash/object/extend";
import request from "request";

import clientTest from "__client-test__";

let
  mochaRun = mocha.run,
  mochaMock = extend(mocha, {
    run: (...args) => {
      let
        runner = mochaRun(...args);

      // Attach end listener
      runner.on("end", () => request.post({
        url: `${ window.location.origin }/${ !runner.failures ? "pass" : "fail" }`,
        testInstance: runner,
        json: true
      }));

      return runner;
    }
  });

// Run tests
clientTest.call(this, mochaMock);
