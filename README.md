# Harnessing Search to Advance Equity in Healthcare
Accompanying blog: https://docs.google.com/document/d/1xGa81dVTaaferR5rq8OWDNNTP7Cf0BiSWovELflziho/edit#heading=h.kjxrjani732v

## Create Elastic Deployment
Navigate to https://www.elastic.co/industries/public-sector/fedramp and create a 30-day free trial. Adjust the ML instance to 4GB RAM.

Make sure to save the deployment credentials.
- username: elastic
- password: <elastic_password>

From the Cloud Console, copy the Elasticsearch endpoint and Enterprise Search endpoint addresses.  These will be added to the configuration file for the back-end server.
- Elasticsearch endpoint: _____________
- Enterprise Search endpoint: ____________

## Create an API Key for the Elastic Deployment


## Import Machine Learning Model
For the semantic search portion, we'll need to import a trained model. These steps will get the job done but see the blogs below for more details on how it works. You'll need to have Docker installed.

Build the eland docker client (this is a Python Elasticsearch client for working with ML models). Make sure not to forget the "." in the last command.
```
git clone git@github.com:elastic/eland.git
cd eland
docker build -t elastic/eland .
```
Then run the client to install the NLP model
```
docker run -it --rm elastic/eland \
  eland_import_hub_model \
  --url https://elastic:<password>@<elasticsearch_endpoint>:9243/ \
  --hub-model-id sentence-transformers/distiluse-base-multilingual-cased-v1 \
  --task-type text_embedding \
  --start
```

For details on how this works check out the following blogs:
- https://www.elastic.co/blog/how-to-deploy-nlp-named-entity-recognition-ner-example
- https://www.elastic.co/blog/how-to-deploy-nlp-text-embeddings-and-vector-search

ML Model: sentence-transformers__distiluse-base-multilingual-cased-v1

## Bring in Data
Navigate to the Home page and click *Upload a file*

Import the file located at /insurance-question/insurance_corpus.csv

Override the settings and check the *Has header row* checkbox

Click *Import*

Name the index as *insurance-questions*

After it completes, you should see that 12,887 documents were imported.

## Create Text Embeddings
In order to prepare the question set for a vector search, we need to create text embedding (i.e. vector representation) of each of the questions using the ML model we just imported.

We'll do this by creating a separate index that will store these text embeddings. From Stack Management > Dev Tools, run the following request:

```
PUT insurance-questions-embeddings
{
  "mappings": {
    "properties": {
      "text_embedding.predicted_value": {
        "type": "dense_vector",
        "dims": 512,
        "index": true,
        "similarity": "cosine"
      }
    }
  }
}
```
## Create ML Inference Pipeline
Now we create a pipeline that each document goes through to create the text embeddings.

```
PUT _ingest/pipeline/insurance-question-embeddings
{
  "description": "Text embedding pipeline",
  "processors": [
    {
      "inference": {
        "model_id": "sentence-transformers__distiluse-base-multilingual-cased-v1",
        "target_field": "qa_text_embedding",
        "field_map": {
          "question": "text_field"
        }
      }
    }
  ],
  "on_failure": [
    {
      "set": {
        "description": "Index document to 'failed-<index>'",
        "field": "_index",
        "value": "failed-{{{_index}}}"
      }
    },
    {
      "set": {
        "description": "Set error message",
        "field": "ingest.failure",
        "value": "{{_ingest.on_failure_message}}"
      }
    }
  ]
}
```
## Reindex the Insurance Questions
We're now ready to reindex our questions so they go through the ML inference pipeline to create the text embeddings, which then get stored in our new index named *insurance-questions-embeddings*

```
POST _reindex?wait_for_completion=false
{
  "source": {
    "index": "insurance-questions"
  },
  "dest": {
    "index": "insurance-questions-embeddings",
    "pipeline": "insurance-question-embeddings"
  }
}
```
If you want to check on the status of the reindex, run the following:
```
GET _tasks/<enter_task_id>
```

## Take a Look at the Text Embeddings
```
GET insurance-questions-embeddings/_search
```

## Create App Search Engine
Navigate to App Search

Click *Create an Engine*

Select *Elasticsearch index-based* as the search engine type

Enter the following information and click *Continue*
- Engine Name: insurance-app-search
- Selected index: insurance-questions-embeddings

Navigate to App Search > Credentials and note the value for the *search-key*. This needs to be entered in the configuration in the Back End setup.

search-key: _____________

## Set Up Front End
See the [README](./front-end/README.md) for the front end setup.

## Set Up Back End
See the [README](./back-end/README.MD) for the back end setup.

## Try Out App Search
The front-end is only connected to the endpoint that is connected to App Search. To try out the other endpoints mentioned in the blog you can use your browser or Postman.

After trying out a few search, navigate to the App Search UI and experiment with the functionality there!