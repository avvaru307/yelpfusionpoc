'use strict';
const express = require('express');
const app = express();
const request = require("request");
const apiKey = 'Y8s6dW3uAs-TZ34YRekghk7llJxJuj3JjNAcLtADi-OZ02Dl66_soagZHv-eTyQFHC8fGWfxblXrZxyW3msB1GARItcv2KG0qhzgowweVi4qxdw3fijzXeIyKKd2XXYx';
var errHandler = function(err) {  console.log(err); };
let reviewsURL = "https://api.yelp.com/v3/businesses/{id}/reviews";
app.get('/businesses/search', function (req, res) {
    let paramstr = req.url.split('?');
	if(paramstr[1] === undefined) paramstr[1] = 'location=Alpharetta&categories=ice%20cream';
    let params = new URLSearchParams(paramstr[1]?paramstr[1]:'');
    const searchRequest = { 'term': params.get("categories"), 'location': params.get("location"), 'limit':50};	
	let businessesURL = "https://api.yelp.com/v3/businesses/search?"+(paramstr[1]?paramstr[1]:'')+'&sort-by=review&limit=5';	
    let businessesPromise = getData(businessesURL,apiKey);
	let businesses = [];
    businessesPromise.then(JSON.parse, errHandler)
               .then(function(result) {
					let _count=result.businesses.length;
					for(let i=0;i<result.businesses.length;i++){
						var finalbusinessid = result.businesses[result.businesses.length-1].id;
						let business = result.businesses[i],business_output = {"business_id":business.id, 'business_name':business.name,'business_address':business.location.display_address.join(',')};; 
						businesses.push(business_output);
						reviewsURL = reviewsURL.replace('{id}',business.id);						
						var anotherPromise = getData(reviewsURL,apiKey,business.id).then(JSON.parse).then(function(data) {
								business.reviews = data;
								businesses.map(bitem => {									
									if(bitem.business_id == business.id) bitem.reviews = data.reviews.map(obj => {return  {'excert_review':obj.text, 'user_name':obj.user.name}});
								});
								_count--;
								if(_count == 0) res.send(businesses);	
							}, errHandler);
					}
                }, errHandler);
});
function getData(url,apiKey) {
    var options = { url: url,  headers: { 'User-Agent': 'request',  'Authorization': 'Bearer '+apiKey }};
    return new Promise(function(resolve, reject) {
        request.get(options, function(err, resp, body) { if (err) reject(err); else resolve(body); })
    })
}
app.listen(3000);