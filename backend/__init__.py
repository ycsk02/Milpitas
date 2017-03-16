from flask import Flask
from flask_restful import reqparse, Resource, Api
from flask_cors import CORS
import requests
from . import config
import json

app = Flask(__name__)
CORS(app)
api = Api(app)

parser = reqparse.RequestParser()

class ProductList(Resource):

    def get(self):
        print("Call for: GET /products")
        parser.add_argument('p')
        query_string = parser.parse_args()
        url = config.es_base_url['products']+'/_search'
        query = {
            "query": {
                "match_all": {}
            },
            "sort": [
                {"id": {"order": "desc"}}
            ],
            "from":(int(query_string['p']) - 1) * 200,"size": 200
        }
        resp = requests.post(url, data=json.dumps(query))
        data = resp.json()
        products = {}
        products['totalcount'] = data['hits']['total']
        products['data'] = []
        for hit in data['hits']['hits']:
            product = hit['_source']
            product['id'] = hit['_id']
            products['data'].append(product)
        return products

    def post(self):
        print("Call for: POST /beers")
        parser.add_argument('name')
        parser.add_argument('producer')
        parser.add_argument('abv')
        parser.add_argument('description')
        parser.add_argument('styles', action='append')
        beer = parser.parse_args()
        print(beer)
        url = config.es_base_url['beers']
        resp = requests.post(url, data=json.dumps(beer))
        data = resp.json()
        return data

class Product(Resource):

    def get(self, product_id):
        print("Call for: GET /products/%s" % product_id)
        url = config.es_base_url['products']+'/'+product_id
        resp = requests.get(url)
        data = resp.json()
        product = data['_source']
        return product

    def put(self, beer_id):
        """TODO: update functionality not implemented yet."""
        pass

    def delete(self, beer_id):
        print("Call for: DELETE /beers/%s" % beer_id)
        url = config.es_base_url['beers']+'/'+beer_id
        resp = requests.delete(url)
        data = resp.json()
        return data

class Style(Resource):
    pass

class StyleList(Resource):

    def get(self):
        print("Call for /styles")
        url = config.es_base_url['styles']+'/_search'
        query = {
            "query": {
                "match_all": {}
            },
            "size": 100
        }
        resp = requests.post(url, data=json.dumps(query))
        data = resp.json()
        styles = []
        for hit in data['hits']['hits']:
            style = hit['_source']
            style['id'] = hit['_id']
            styles.append(style)
        return styles

class Search(Resource):

    def get(self):
        print("Call for GET /search")
        parser.add_argument('q')
        parser.add_argument('p')
        query_string = parser.parse_args()
        url = config.es_base_url['products']+'/_search'
            # "query": {
            #     "multi_match": {
            #         "fields": ["name", "brand", "category", "domain"],
            #         "query": query_string['q'],
            #         "type": "cross_fields",
            #         "use_dis_max": "False"
            #     }
            # },
            # "sort": [
            #     {"id": {"order": "asc"}}
            # ],
        query = {
            "query": {
                "simple_query_string": {
                   "fields": ["name", "brand", "category", "domain"],
                   "default_operator": "and",
                   "query": query_string['q']
                }
             },
            "from":(int(query_string['p']) - 1) * 200,"size": 200
        }
        resp = requests.post(url, data=json.dumps(query))
        data = resp.json()
        totalcount = data['hits']['total']
        products = {}
        products['totalcount'] = totalcount
        products['data'] = []
        for hit in data['hits']['hits']:
            product = hit['_source']
            product['id'] = hit['_id']
            products['data'].append(product)
        return products

api.add_resource(Product, config.api_base_url+'/products/<product_id>')
api.add_resource(ProductList, config.api_base_url+'/products')
api.add_resource(StyleList, config.api_base_url+'/styles')
api.add_resource(Search, config.api_base_url+'/search')
