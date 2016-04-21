import scrape_functions
import crud_functions
from datetime import datetime, timedelta

def updateRouteData(origin, dest, d):
	print [origin, dest, d]
	print  '----'

	formatted_date = d.strftime('%Y-%m-%d')
	# get new data
	newData = scrape_functions.getTrainData(origin, dest, d)
	#print newData
	# delete old data
	crud_functions.delete_routes_from_to_on(origin, dest, formatted_date)

	# add new data 
	crud_functions.post_routes_mass(newData[0])
	crud_functions.post_transfers_mass(newData[1])

'''
pairs = [['Princeton', 'Philadelphia 30th Street'],
		 ['Princeton', 'New York Penn Station'],
		 ['Princeton', 'Newark Airport'],
		]
'''

'''
dics = [
			{
				"origin": "Princeton",
				"destinations": ["New York Penn Station", "Newark Airport", "Philadelphia 30th Street","Trenton Transit Center"]
			},
			{
				"origin": "New York Penn Station",
				"destinations": ["Princeton", "Newark Airport", "Philadelphia 30th Street","Trenton Transit Center"]
			},
			{
				"origin": "Newark Airport",
				"destinations": ["New York Penn Station","Princeton","Philadelphia 30th Street","Trenton Transit Center"]
			},
			{
				"origin": "Philadelphia 30th Street",
				"destinations": ["New York Penn Station","Princeton","Newark Airport","Atlantic City","Trenton Transit Center"]
			},
			{
				"origin": "Trenton Transit Center",
				"destinations": ["Princeton","New York Penn Station","Newark Airport","Philadelphia 30th Street"]
			},
			{
				"origin": "Atlantic City",
				"destinations": ["Philadelphia 30th Street"]
			}
		]
'''

dics = {
			"Princeton": ["New York Penn Station", "Newark Airport", "Philadelphia 30th Street","Trenton Transit Center"],
			"New York Penn Station": ["Princeton", "Newark Airport", "Philadelphia 30th Street","Trenton Transit Center"],
			"Newark Airport": ["New York Penn Station","Princeton","Philadelphia 30th Street","Trenton Transit Center"],
			"Philadelphia 30th Street": ["New York Penn Station","Princeton","Newark Airport","Atlantic City","Trenton Transit Center"],
			"Trenton Transit Center": ["Princeton","New York Penn Station","Newark Airport","Philadelphia 30th Street"],
			"Atlantic City": ["Philadelphia 30th Street"]
		}

#(datetime.today() + timedelta(days=i)).strftime('%Y-%m-%d')

NUM_DAYS = 2
for dic in dics:
	for origin, dest_list in dic.iteritems():
		for dest in dest_list:
			for i in xrange(2):
				updateRouteData(origin, dest, (datetime.today() + timedelta(days=i)))

'''
for pair in pairs:
	updateRouteData(pair[0], pair[1], datetime.today())
	for i in xrange(30):
		updateRouteData(pair[0], pair[1], datetime.date.today() + datetime.timedelta(days=i))

'''



