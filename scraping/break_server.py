import scrape_functions
import crud_functions
from datetime import datetime, timedelta
import json

dics = {
		"Princeton": ["Princeton Junction", "New York Penn Station", "Newark Airport", "Philadelphia 30th Street", "Trenton Transit Center"],
		"Princeton Junction": ["Princeton", "New York Penn Station", "Newark Airport", "Philadelphia 30th Street", "Trenton Transit Center"],
		"New York Penn Station": ["Princeton", "Princeton Junction", "Newark Airport", "Philadelphia 30th Street", "Trenton Transit Center"],
		"Newark Airport": ["Princeton", "Princeton Junction", "New York Penn Station", "Philadelphia 30th Street", "Trenton Transit Center"],
		"Philadelphia 30th Street": ["Princeton", "Princeton Junction", "New York Penn Station", "Newark Airport", "Atlantic City", "Trenton Transit Center"],
		"Trenton Transit Center": ["Princeton", "Princeton Junction", "New York Penn Station", "Newark Airport", "Philadelphia 30th Street"],
		"Atlantic City": ["Philadelphia 30th Street"]
	}
NUM_DAYS = 2
for origin, dest_list in dics.iteritems():
	for dest in dest_list:
		for i in xrange(NUM_DAYS):
			print origin
			print dest
			print i
			#updateRouteData(origin, dest, (datetime.today() + timedelta(days=i)))
