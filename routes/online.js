
/*
 * GET home page.
 */

function onLine(name, title, post) {
  this.name = name;
  this.title = title;
  this.post = post;
}
module.exports = onLine;
onLine.prototype.save = function() {
}