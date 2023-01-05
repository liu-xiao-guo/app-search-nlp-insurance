const { Client } = require('@elastic/elasticsearch');
const fs = require('fs')
const config = require('config');

const elasticConfig = config.get('elastic');

const client = new Client ( {
  node: elasticConfig.elasticEndpoint,
  auth: { 
    username: elasticConfig.username,
    password: elasticConfig.password
   }, 
   tls: {
    ca: fs.readFileSync(elasticConfig.certificate),
    rejectUnauthorized: true
   }
});

client.ping()
  .then(response => console.log("You are connected to Elasticsearch!"))
  .catch(error => console.error("Elasticsearch is not connected."))

module.exports = client;  