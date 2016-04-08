import scrape_functions
import crud_functions
from datetime import datetime

def updateRouteData(origin, dest, date):
	# get new data
	newData = scrape_functions.getTrainData(origin, dest, date)

	# delete old data
	crud_functions.delete_routes_from_to(origin, dest)

	# add new data 
	crud_functions.post_routes_mass(newData[0])
	crud_functions.post_transfers_mass(newData[1])

pairs = [['Princeton', 'Philadelphia 30th Street'],
		 ['Princeton', 'New York Penn Station'],
		 ['Princeton', 'Newark Airport'],
		]

for pair in pairs:
	updateRouteData(pair[0], pair[1], datetime.today())





