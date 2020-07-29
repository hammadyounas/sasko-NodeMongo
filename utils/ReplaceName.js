
module.exports.replace = (array, collection) => {
    let itemQuery;
    itemQuery = array.map((arrayDetails, index) => {
        return collection.findById({ "_id": arrayDetails['itemId'] }).exec().then(data => {
            if (data != null) {
                arrayDetails['itemName'] = data.name;
            } else {
                arrayDetails['itemName'] = "Item is deleted";
            }
        })
    })

    return Promise.all(itemQuery).then(data => {
        return array;
    })
}
