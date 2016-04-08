import requests
import json

url_strings = {
	'routes_get_all': 'http://localhost:8000/trainsched/routes_all',
	'routes_get_from_to': 'http://localhost:8000/trainsched/routes_from_to/{0}/{1}',
	'routes_post_single': 'http://localhost:8000/trainsched/routes_all/',
	'routes_post_mass': 'http://localhost:8000/trainsched/routes_post_mass/',
	'routes_delete_from_to': 'http://localhost:8000/trainsched/routes_from_to/{0}/{1}',
    'transfers_get_all': 'http://localhost:8000/trainsched/transfers_all/',
    'transfers_post_single': 'http://localhost:8000/trainsched/transfers_all/',
    'transfers_post_mass': 'http://localhost:8000/trainsched/transfers_post_mass/',
}

# CRUD functions for Trainroute

# get all routes
def get_routes_all():
	r = requests.get(url_strings['routes_get_all'])
	r.raise_for_status()
	return r.text

# get routes from/to
def get_routes_from_to(origin, dest):
	r = requests.get(url_strings['routes_get_from_to'].format(origin, dest))
	r.raise_for_status()
	return r.text

# post one route
def post_routes_single(route_json):
	r = requests.post(url_strings['routes_post_single'], json=route_json)
	r.raise_for_status()
	return

# post multiple routes
def post_routes_mass(route_json):
	r = requests.post(url_strings['routes_post_mass'], json=route_json)
	r.raise_for_status()
	return

# delete all routes to/from destination
def delete_routes_from_to(origin, dest):
	r = requests.delete(url_strings['routes_delete_from_to'].format(origin, dest))
	r.raise_for_status()
	return

# CRUD functions for Transfer
def get_transfers_all():
    r = requests.get(url_strings['tranfers_get_all'])
    r.raise_for_status()
    return r.text

# post one route
def post_transfers_single(transfer_json):
    r = requests.post(url_strings['transfers_post_single'], json=transfer_json)
    r.raise_for_status()
    return

# post multiple routes
def post_transfers_mass(transfer_json):
    r = requests.post(url_strings['transfers_post_mass'], json=transfer_json)
    r.raise_for_status()
    return