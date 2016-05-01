from trainsched.models import Trainroute, Transfer
from trainsched.serializers import TrainrouteSerializer, TransferSerializer
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
import datetime
import time

# scraping libaries
from bs4 import BeautifulSoup
import urllib2
import json

# Views for <Trainroute> model/serializer

@api_view(['GET', 'POST'])
def routes_all(request):
	"""
	List all train routes, or create a new route
	"""
	if request.method == 'GET':
		schedules = Trainroute.objects.all()
		serializer = TrainrouteSerializer(schedules, many=True)
		return Response(serializer.data)

	elif request.method == 'POST':
		serializer = TrainrouteSerializer(data=request.data)
	if serializer.is_valid():
		serializer.save()
		return Response(serializer.data, status=status.HTTP_201_CREATED)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'DELETE'])
def routes_from_to(request, origin, dest):
	"""
	Retrieve all route instance specifying to/from.
	"""
	try:
		routes = Trainroute.objects.filter(origin=origin, dest=dest)
	except Trainroute.DoesNotExist:
		return Response(status=status.HTTP_404_NOT_FOUND)

	if request.method == 'GET':
		serializer = TrainrouteSerializer(routes, many=True)
		return Response(serializer.data)

	elif request.method == 'DELETE':
		for route in routes:
			route.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'DELETE'])
def routes_from_to_on(request, origin, dest, searchDate):
	"""
	Retrieve all route instance specifying to/from.
	"""
	try:
		routes = Trainroute.objects.filter(origin=origin, dest=dest, searchDate=searchDate)
	except Trainroute.DoesNotExist:
		return Response(status=status.HTTP_404_NOT_FOUND)

	if request.method == 'GET':
		serializer = TrainrouteSerializer(routes, many=True)
		return Response(serializer.data)

	elif request.method == 'DELETE':
		for route in routes:
			route.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
def routes_post_mass(request):
	if request.method == 'POST':
		serializer = TrainrouteSerializer(data=request.data, many=True)
	if serializer.is_valid():
		serializer.save()
		return Response(serializer.data, status=status.HTTP_201_CREATED)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def routes_delete_all(request):
	if request.method == 'DELETE':
		routes = Trainroute.objects.all()
		for route in routes:
			route.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)

# Views for <Transfer> model/serializer
@api_view(['GET', 'POST'])
def transfers_all(request):
	"""
	List all train routes, or create a new route
	"""
	if request.method == 'GET':
		transfers = Transfer.objects.all()
		serializer = TransferSerializer(transfers, many=True)
		return Response(serializer.data)

	elif request.method == 'POST':
		serializer = TransferSerializer(data=request.data)
	if serializer.is_valid():
		serializer.save()
		return Response(serializer.data, status=status.HTTP_201_CREATED)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def transfers_post_mass(request):
	if request.method == 'POST':
		serializer = TransferSerializer(data=request.data, many=True)
	if serializer.is_valid():
		serializer.save()
		return Response(serializer.data, status=status.HTTP_201_CREATED)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# Takes in departure time in military time string (e.g. "14:35") 
# and the live-scraped hour:minute string (e.g. "11:12") and returns 
# whether the live-scraped time is 'AM' or 'PM'.
def get_am_pm(live, arrival_time):
	dep_hm = arrival_time.split(':')
	liv_hm = live.split(':')

	dep = datetime.time(int(dep_hm[0]), int(dep_hm[1]))

	am_edition = None
	pm_edition = None
	if (int(liv_hm[0]) < 12):
		h = int(liv_hm[0])
		m = int(liv_hm[1])
		am_edition = datetime.time(h,m)
	else:
		h = 0
		m = int(liv_hm[1])
		am_edition = datetime.time(h,m)

	pm_edition = datetime.time(h+12,m)

	dummydate = datetime.date(2000,1,1)
	dummydate_1 = datetime.date(2000,1,2)

	am_delta_00 = datetime.datetime.combine(dummydate,dep) - datetime.datetime.combine(dummydate,am_edition)
	am_delta_01 = datetime.datetime.combine(dummydate,dep) - datetime.datetime.combine(dummydate_1,am_edition)
	am_delta_10 = datetime.datetime.combine(dummydate_1,dep) - datetime.datetime.combine(dummydate,am_edition)

	am_delta_min = min(abs(am_delta_00.total_seconds()), abs(am_delta_01.total_seconds()), abs(am_delta_10.total_seconds()))

	pm_delta_00 = datetime.datetime.combine(dummydate,dep) - datetime.datetime.combine(dummydate,pm_edition)
	pm_delta_01 = datetime.datetime.combine(dummydate,dep) - datetime.datetime.combine(dummydate_1,pm_edition)
	pm_delta_10 = datetime.datetime.combine(dummydate_1,dep) - datetime.datetime.combine(dummydate,pm_edition)

	pm_delta_min = min(abs(pm_delta_00.total_seconds()), abs(pm_delta_01.total_seconds()), abs(pm_delta_10.total_seconds()))

	if am_delta_min < pm_delta_min:
		return 'AM'
	else:
		return 'PM'

def isTimeFormat(input):
	try:
		time.strptime(input, '%H:%M')
		return True
	except ValueError:
		return False

# LIVE SCRAPING FUNCTION
def get_train_vals(trainNum, arrival_time):
	base_url = "http://dv.njtransit.com/mobile/train_stops.aspx?sid=PJ&train="
	page = urllib2.urlopen(base_url + trainNum)
	soup = BeautifulSoup(page.read(), "html5lib")
	string = soup.find_all("td")
	lis = []                      # list to be converted to json

	for s in range(len(string)):
		if(string[s].find("p")):
			dic = {}                  # new dictionary to go in list
			text = string[s].find("p").get_text()
			text1a = None
			if (string[s].find("i")):
				text1 = string[s].find("i").get_text()
				text1a = " ".join(text1.split())
			text2 = " ".join(text.split())
			part = text2.rpartition(" at ")

			loc = ""
			if " at " in text2:
				loc = part[0]
				text1a = part[2]
			else:
				loc = text2.replace(text1a, "")

			dic['location'] = loc
			dic['time'] = text1a

			# if time is collected, add dictionary to list
			# loc will always have something.. but j.i.c
			if text1a and loc:
				lis.append(dic)

	# iterate through list and add am/pm to valid times
	for dic in lis:
		if (isTimeFormat(dic['time']) and isTimeFormat(arrival_time)):
			dic['time'] = dic['time'] + ' ' + get_am_pm(dic['time'], arrival_time) 

	jsonobj = json.dumps(lis)
	return jsonobj

@api_view(['GET'])
def live_data_get(request, train_number, arrival_time):
	if request.method == 'GET':
		return Response(get_train_vals(train_number, arrival_time))



