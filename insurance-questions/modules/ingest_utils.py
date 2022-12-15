import os
import json
from elasticsearch import Elasticsearch, helpers

def writeToElasticsearch(doc_list, index_name):
    '''
    Writes list to Elasticsearch. Need to set CLOUD_ID and CLOUD_API_KEY environment variables (e.g. export set CLOUD_ID=<your_cloud_id>)
    '''
    es = Elasticsearch(cloud_id=os.environ['CLOUD_ID'],api_key=os.environ['CLOUD_API_KEY'])
    
    result = es.ping()
    print(result)
    if result:
        print("Connected to Elasticsearch")
        try:
            resp = helpers.bulk(es, doc_list, index=index_name)
            print ("helpers.bulk() RESPONSE:", resp)
            print ("helpers.bulk() RESPONSE:", json.dumps(resp, indent=4))
        except helpers.BulkIndexError as bulkIndexError:
            print("Indexing error: {0}".format(bulkIndexError))
    else:
        print("Not connected")