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
def formatTime(date_searched, raw_t, string):
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

def generatePrimaryKey(origin, dest, departureDatetime):
	return origin + dest + departureDatetime.strftime('%m%d%Y%I%M')

def getTransferJSON(fk, order, trainName, location, date, timeArrival, timeDeparture):
	return {"trainroute": fk,
			"order": order,
			"trainName": trainName,
			"location": location,
			"arrival": formatTime(date, timeArrival, True),
			"departure": formatTime(date, timeDeparture, True)}

def getTripJSON(origin, dest, name, date, timeDeparture, timeArrival, travelLength):
	dep = formatTime(date, timeDeparture, False)
	return {"primary_key": generatePrimaryKey(origin, dest, dep),
			"origin": origin, 
			"dest": dest, 
			"trainName": name,
			"departure": dep.isoformat(), 
			"arrival": formatTime(date, timeArrival, True),
			"duration": formatTravelLength(travelLength)}