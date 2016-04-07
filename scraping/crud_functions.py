import requests
import json

url_strings = {
	'get_all': 'http://localhost:8000/trainsched/all',
	'get_fromto': 'http://localhost:8000/trainsched/fromto/{0}/{1}',
	'post_single': 'http://localhost:8000/trainsched/all/',
	'post_mass': 'http://localhost:8000/trainsched/masspost/',
	'delete_fromto': 'http://localhost:8000/trainsched/fromto/{0}/{1}',
}


# get all routes
def get_routes_all():
	r = requests.get(url_strings['get_all'])
	r.raise_for_status()
	return r.text

# get routes from/to
def get_routes_fromto(origin, dest):
	r = requests.get(url_strings['get_fromto'].format(origin, dest))
	r.raise_for_status()
	return r.text

# post one route
def post_routes_single(route_json):
	r = requests.post(url_strings['post_single'], json=route_json)
	r.raise_for_status()
	return

# post multiple routes
def post_routes_mass(route_json):
	r = requests.post(url_strings['post_mass'], json=route_json)
	r.raise_for_status()
	return

# delete all routes to/from destination
def delete_routes_fromto(origin, dest):
	r = requests.delete(url_strings['delete_fromto'].format(origin, dest))
	r.raise_for_status()
	return

#print get_routes_fromto('PrincetonStation', 'Philadelphia30thStreetStation')

#data = '{"dest":"NewarkAirport","departure":"2016-04-01T07:46:40Z","arrival":"2016-05-01T09:46:40Z","travelTime":60}'

#data = '[{"origin": "Princeton Station", "dest": "Newark Airport", "departure": "2016-03-31T07:46:40Z", "arrival": "2016-03-31T09:46:40Z", "transfers":"none", "travelTime": 60}]'
#post_routes_mass(json.loads(data))

#delete_routes_fromto('PrincetonStation', 'NewarkAirport')
# sample data
'''[
    {
        "origin": "princeton",
        "dest": "newark",
        "departure": "2016-03-31T07:46:40Z",
        "arrival": "2016-03-31T09:46:40Z",
        "travelTime": 60
    },
    {
        "origin": "princeton",
        "dest": "newark",
        "departure": "2016-03-31T07:46:40Z",
        "arrival": "2016-03-31T09:46:40Z",
        "travelTime": 60
    },
    {
        "origin": "prince",
        "dest": "ne",
        "departure": "2016-03-31T07:46:40Z",
        "arrival": "2016-03-31T09:46:40Z",
        "travelTime": 60
    },
    {
        "origin": "Princeton",
        "dest": "NewYorkPennStation",
        "departure": "2016-03-31T07:46:40Z",
        "arrival": "2016-03-31T09:46:40Z",
        "travelTime": 60
    },
    {
        "origin": "NewarkAirport",
        "dest": "NewYorkPennStation",
        "departure": "2016-03-31T07:46:40Z",
        "arrival": "2016-03-31T09:46:40Z",
        "travelTime": 60
    },
    {
        "origin": "PrincetonStation",
        "dest": "NewYorkPennStation",
        "departure": "2016-03-31T07:46:40Z",
        "arrival": "2016-03-31T09:46:40Z",
        "travelTime": 60
    },
    {
        "origin": "PrincetonStation",
        "dest": "NewYorkPennStation",
        "departure": "2016-03-31T07:46:40Z",
        "arrival": "2016-05-01T09:46:40Z",
        "travelTime": 60
    },
    {
        "origin": "PrincetonStation",
        "dest": "NewarkAirport",
        "departure": "2016-04-01T07:46:40Z",
        "arrival": "2016-05-01T09:46:40Z",
        "travelTime": 60
    },
    {
        "origin": "PrincetonStation",
        "dest": "NewarkAirport",
        "departure": "2016-04-01T07:46:40Z",
        "arrival": "2016-05-01T09:46:40Z",
        "travelTime": 60
    },
    {
        "origin": "PrincetonStation",
        "dest": "NewarkAirport",
        "departure": "2016-04-01T07:46:40Z",
        "arrival": "2016-05-01T09:46:40Z",
        "travelTime": 60
    }
]
'''