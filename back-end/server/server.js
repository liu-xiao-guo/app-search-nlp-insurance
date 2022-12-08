const { Client } = require('@elastic/elasticsearch');
const client = require('./elasticsearch/client');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const config = require('config');

const elasticConfig = config.get('elastic');
const elasticEndpoint = elasticConfig.elasticEndpoint;


const app = express();

async function infer_nlp_vectors(query) {

  const response = axios.post(
    elasticConfig.elasticEndpoint + '/_ml/trained_models/sentence-transformers__distiluse-base-multilingual-cased-v1/_infer',
    {
        'docs': {
            'text_field': query
        }
    },
    {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'ApiKey ' + elasticConfig.apiKey
        }
    }
  )

  return response;
}

async function semanticSearch(query_dense_vector) {
  const response = axios.get(elasticEndpoint + '/insurance-qa-embeddings/_search', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'ApiKey ' + elasticConfig.apiKey
    },
    data: {
      'knn': {
        'field': 'qa_text_embedding.predicted_value',
        'query_vector': query_dense_vector,
        'k': 10,
        'num_candidates': 100
      },
      '_source': [
        'question',
        'answer'
      ]
    }
  });

  return response;
}


async function semanticSearchAnalytics(query_dense_vector, query) {

  const response = await axios.post(
    elasticConfig.entSearchEndpoint + '/api/as/v1/engines/insurance-app-search/elasticsearch/_search',
    {
      'query': {
        'match': {
          'question': {
            'query': query,
            'boost': 0.5
          }
        }
      },
      'knn': {
        'field': 'qa_text_embedding.predicted_value',
        'query_vector': query_dense_vector,
        'k': 5,
        'num_candidates': 50,
        'boost': 0.5
      },
      '_source': ['question', 'answer']
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + elasticConfig.appSearchApiKey,
        'X-Enterprise-Search-Analytics': query,
        'X-Enterprise-Search-Analytics-Tags': query
      }
    }
  );

  return response;
}

app.use(cors());

// Semantic search without analytics (i.e. doesn't use App Search API)
app.get('/semantic-search', async (req, res) => {
  query = req.query.query;
  const result = await infer_nlp_vectors(query);
  const result_vector = result.data.inference_results[0].predicted_value;

  const semantic_search_result = await semanticSearch(result_vector);
  console.log(semantic_search_result);
  res.json(semantic_search_result.data.hits.hits);
});

// Semantic search with analytics (uses the App Search API)
app.get('/semantic-search-analytics', async (req, res) => {
  query = req.query.query;
  const result = await infer_nlp_vectors(query);
  const result_vector = result.data.inference_results[0].predicted_value;

  const semantic_search__analytics_result = await semanticSearchAnalytics(result_vector, query);
  console.log(semantic_search__analytics_result);
  res.json(semantic_search__analytics_result.data.hits.hits);
})

// Basic search
app.get('/search-insurance', async (req, res) => {
  query = req.query.query;
  const response = axios.get(elasticConfig.elasticEndpoint + '/insurance_qa_train_blog/_search', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'ApiKey ' + elasticConfig.apiKey
    },
    data: {
      'query': {
        'match': {
            'question': {
                'query': query
            }
        }
    },
      '_source': [
        'question', 
        'answer'
      ]
    }
  }).then(response => {
    res.send(response.data.hits.hits)
  });
})

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.group(`Server started on ${PORT}`));