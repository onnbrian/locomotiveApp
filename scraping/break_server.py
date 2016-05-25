import scrape_functions
import crud_functions
from datetime import datetime, timedelta
import json
import time

dics = {
		"Princeton": ["Princeton Junction", "New York Penn Station", "Newark Airport", "Philadelphia 30th Street", "Trenton Transit Center"],
		"Princeton Junction": ["Princeton", "New York Penn Station", "Newark Airport", "Philadelphia 30th Street", "Trenton Transit Center"],
		"New York Penn Station": ["Princeton", "Princeton Junction", "Newark Airport", "Philadelphia 30th Street", "Trenton Transit Center"],
		"Newark Airport": ["Princeton", "Princeton Junction", "New York Penn Station", "Philadelphia 30th Street", "Trenton Transit Center"],
		"Philadelphia 30th Street": ["Princeton", "Princeton Junction", "New York Penn Station", "Newark Airport", "Atlantic City", "Trenton Transit Center"],
		"Trenton Transit Center": ["Princeton", "Princeton Junction", "New York Penn Station", "Newark Airport", "Philadelphia 30th Street"],
		"Atlantic City": ["Philadelphia 30th Street"]
	}


NUM_DAYS = 1
count = 0
for i in range(10):
	for origin, dest_list in dics.iteritems():
		for dest in dest_list:
			for i in xrange(NUM_DAYS):
				start_time = time.time()
				data = crud_functions.get_routes_from_to_on(origin, dest, '2016-05-24')
				elapsed_time = time.time() - start_time
				print '------------------------------------'
				print "ITERATION: " + str(count)
				print "FROM: " + origin
				print "TO: " + dest
				print "TIME: " + str(elapsed_time)
				print '------------------------------------'

				print data[:100]
				count+=1
				#time.sleep(0.1)
				#updateRouteData(origin, dest, (datetime.today() + timedelta(days=i)))
