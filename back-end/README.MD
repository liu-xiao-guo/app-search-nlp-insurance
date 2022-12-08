# Set Up Back End

## Configuration
### Get Cloud ID
This can be found from the Elastic Cloud Console. Update it in config/default.json.

### Generate API Key
This is optional if you are using basic authentication in [client.js](./server/elasticsearch/client.js) but recommended as you move to a production setup. Create the key and update configuration in config/default.json. You'll also have to uncomment the apiKey line in [client.js](./server/elasticsearch/client.js) afterwards.

```
node server/create-api-key.js
```

See Elastic dev blog for more details: https://dev.to/lisahjung/part-4-securely-connect-nodejs-server-to-elastic-cloud-4f22

### Get App Search API Key
After creating an App Search engine in the main guide, you'll enter the search API key for App Search in config/default.json.

### Get Enterprise Search Endpoint
This can be found from the Elastic Cloud Console. Update it in config/default.json.

## Install Dependencies
```
npm install
```

## Start Server
```
npm start
```