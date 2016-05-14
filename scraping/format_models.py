from datetime import datetime, time, timedelta

# convert raw travel time unicode to int
def formatTravelLength(raw_l):
	raw_l = str(raw_l)
	parts = raw_l.split()
	assert (len(parts) == 2)
	assert (parts[1] == 'minutes')
	assert (parts[0].isdigit())
	return int(parts[0])

# convert raw unicode time into python datetime object
# train info lost here
def formatTime(raw_t):
	'''
	# cut off time to convert datetime object to next day (for late night trains)
	CUTOFF_TIME =  '3:30 am'
	d = datetime.strptime(date_searched.strftime('%m-%d-%Y') + str(raw_t), '%m-%d-%Y%I:%M %p')#.isoformat()
	# convert times to next day if appropriate
	dateCheck = datetime.strptime(date_searched.strftime('%m-%d-%Y') + CUTOFF_TIME, '%m-%d-%Y%I:%M %p')
	if d < dateCheck:
		d = d + timedelta(days=1)
	if string:
		return d.isoformat()
	return d	
	'''
	d = datetime.strptime(datetime.today().strftime('%m-%d-%Y') + str(raw_t), '%m-%d-%Y%I:%M %p')
	#return d.time().strftime('%H:%M')
	return d.time().isoformat()

# format string a date object
def formatDate(date):
	#return date.isoformat()
	return date.strftime('%Y-%m-%d')

# generate primary key for a schedule by concatenating <origin> <dest> <departureTime>
def generatePrimaryKey(origin, dest, departureDatetime):
	return origin + dest + departureDatetime#.strftime('%m%d%Y%I%M')

# create a transfer python dictionary given its necessary attributes
def getTransferJSON(fk, order, trainName, location, date, timeArrival, timeDeparture):
	return {"trainroute": fk,
			"order": order,
			"trainName": trainName,
			"location": location,
			"timeArr": formatTime(timeArrival),
			"timeDep": formatTime(timeDeparture)}

# create a dictionary for a given train route for storage in database as a model without transfers (handled later)
def getTripJSON(origin, dest, name, date, timeDeparture, timeArrival, travelLength):
	date = formatDate(date)
	timeDeparture = formatTime(timeDeparture)
	return {"primary_key": generatePrimaryKey(origin, dest, date + timeDeparture),
			"origin": origin, 
			"dest": dest,
			"searchDate": date,
			"trainName": name,
			"timeStart": timeDeparture,
			"timeEnd": formatTime(timeArrival),
			"duration": formatTravelLength(travelLength)}