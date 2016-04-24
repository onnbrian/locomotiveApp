import scrape_functions
import crud_functions
from datetime import datetime, timedelta
import json

def updateRouteData(origin, dest, d):
	print [origin, dest, d]
	print  '----'

	formatted_date = d.strftime('%Y-%m-%d')
	# get new data
	newData = scrape_functions.getTrainData(origin, dest, d)
	#print json.dumps(newData)
	# delete old data
	crud_functions.delete_routes_from_to_on(origin, dest, formatted_date)

	# add new data 
	crud_functions.post_routes_mass(newData[0])
	crud_functions.post_transfers_mass(newData[1])

dics = {
		"Princeton": ["Princeton Junction", "New York Penn Station", "Newark Airport", "Philadelphia 30th Street", "Trenton Transit Center"],
		"Princeton Junction": ["Princeton", "New York Penn Station", "Newark Airport", "Philadelphia 30th Street", "Trenton Transit Center"],
		"New York Penn Station": ["Princeton", "Princeton Junction", "Newark Airport", "Philadelphia 30th Street", "Trenton Transit Center"],
		"Newark Airport": ["Princeton", "Princeton Junction", "New York Penn Station", "Philadelphia 30th Street", "Trenton Transit Center"],
		"Philadelphia 30th Street": ["Princeton", "Princeton Junction", "New York Penn Station", "Newark Airport", "Atlantic City", "Trenton Transit Center"],
		"Trenton Transit Center": ["Princeton", "Princeton Junction", "New York Penn Station", "Newark Airport", "Philadelphia 30th Street"],
		"Atlantic City": ["Philadelphia 30th Street"]
	}

#(datetime.today() + timedelta(days=i)).strftime('%Y-%m-%d')

NUM_DAYS = 2
for origin, dest_list in dics.iteritems():
	if (origin != "Atlantic City"):
		continue

	for dest in dest_list:
		for i in xrange(NUM_DAYS):
			updateRouteData(origin, dest, (datetime.today() + timedelta(days=i)))


'''
for dic in dics:
	for origin, dest_list in dics.iteritems():
		print dics.iteritems()
		break

		if origin != "Trenton Transit Center":
			continue
		for dest in dest_list:
			if dest != 'Princeton':
				continue
			for i in xrange(NUM_DAYS):
				print origin
				print dest
				print i
				#updateRouteData(origin, dest, (datetime.today() + timedelta(days=i)))
'''

'''
for pair in pairs:
	updateRouteData(pair[0], pair[1], datetime.today())
	for i in xrange(30):
		updateRouteData(pair[0], pair[1], datetime.date.today() + datetime.timedelta(days=i))

'''



