const { MongoClient } = require("mongodb");

const password = "qwerty999";

module.exports = async function mongoConnectHandler() {
  const uri = `mongodb+srv://shardul:${password}@cluster0.xj62v0q.mongodb.net/?retryWrites=true&w=majority`;
  const client = new MongoClient(uri);
  return client;
};
