var mongo = require('../db/mongoClient.js');

function addUser (data, success, error) {
	mongo.insert('user', data, function(err, doc) {
		if (err) {
			if (typeof error === 'function') {
				error(err);
			} else {
				console.warn(err);
			}
		} else {
			if (typeof success === 'function') {
				success(doc);
			} else {
				console.dir(doc);
			}
		}	
	});
}

exports.addUser = addUser;