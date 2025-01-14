var nodePath = require("path");

exports.check = function (marko, markoCompiler, expect, snapshot, done) {
  var template = marko.load(nodePath.join(__dirname, "template.marko"));
  template.renderToString(
    {
      name: "John",
    },
    function (err, html) {
      if (err) {
        return done(err);
      }

      snapshot(html);
      done();
    }
  );
};
