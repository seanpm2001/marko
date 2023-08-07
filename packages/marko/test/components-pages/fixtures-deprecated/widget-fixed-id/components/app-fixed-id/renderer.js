var template = require("marko").load(require.resolve("./template.marko"));

exports.render = function (input, out) {
  var label = input.label || "app-fixed-id";
  template.render(
    {
      label: label,
      widgetConfig: {
        label: label,
      },
    },
    out
  );
};
