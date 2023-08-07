module.exports = function (helpers) {
  var FLAGS = 1;

  return helpers.vdom
    .createElement(
      "div",
      { class: "foo", onclick: "doSomething()" },
      1 /* childCount */
    )
    .e(
      "svg",
      {
        width: "100",
        height: "100",
        xmlns: "http://www.w3.org/2000/svg",
      },
      1
    )
    .e(
      "circle",
      {
        cx: "50",
        cy: "50",
        r: "40",
        stroke: "green",
        "stroke-width": "4",
        fill: "yellow",
        "xlink:href": "http://ebay.com/",
      },
      0,
      FLAGS
    );
};
