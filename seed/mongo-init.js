const fs = require('fs');

function transformObjectId(data) {
  return data.map((item) => {
    if (item._id && item._id.$oid) {
      item._id = new ObjectId(item._id.$oid);
    }
    return item;
  });
}

const usersData = JSON.parse(
  fs.readFileSync('/docker-entrypoint-initdb.d/ya-pomogau-db.users.json', 'utf-8')
);
const contactsData = JSON.parse(
  fs.readFileSync('/docker-entrypoint-initdb.d/ya-pomogau-db.contacts.json', 'utf-8')
);
const categoriesData = JSON.parse(
  fs.readFileSync('/docker-entrypoint-initdb.d/ya-pomogau-db.categories.json', 'utf-8')
);

const users = transformObjectId(usersData);
const contacts = transformObjectId(contactsData);
const categories = transformObjectId(categoriesData);

db = db.getSiblingDB('ya-pomogau-db');
db.users.insertMany(users);
db.contacts.insertMany(contacts);
db.categories.insertMany(categories);
