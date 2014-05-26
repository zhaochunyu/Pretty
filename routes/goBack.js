
/*
 * GET home page.
 */
var moment = require('moment');
exports.goBack = function(req, res){
  res.render('goBack', {pheader: '回 滚' });
};
var day='Thu May 08 2014 13:27:58 GMT+0800 (CST)8';
//var	data=moment(day,"YYYY-MM-DD");
//console.info(data);
//var dayWrapper = moment(day);
console.info(moment(day).format('YYYY-MM-DD'));
