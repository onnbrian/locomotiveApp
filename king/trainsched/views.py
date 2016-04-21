from trainsched.models import Trainroute, Transfer
from trainsched.serializers import TrainrouteSerializer, TransferSerializer
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import date

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

# LIVE SCRAPING FUNCTION
def get_train_vals(trainNum):
  base_url = "http://dv.njtransit.com/mobile/train_stops.aspx?sid=PJ&train="
  page = urllib2.urlopen(base_url + trainNum)
  soup = BeautifulSoup(page.read(), "html5lib")
  string = soup.find_all("td")
  totalString = "[\n"

  for s in range(len(string)):
    if(string[s].find("p")):
        text = string[s].find("p").get_text()
        text2 = " ".join(text.split())
  		# print text2
        splitText = text2.split()
        totalString += "    {\n        \"location\": \""
        if " at " in text2:
          for i in range(len(splitText) - 2):
            totalString += splitText[i]
            if(i != len(splitText)-3):
              totalString += " "
        else:
          for i in range(len(splitText) - 1):
            totalString += splitText[i]
            if(i != len(splitText)-2):
              totalString += " "

        totalString += "\",\n        \"time\":"
        totalString += " \"" + splitText[len(splitText)-1] + "\""
        totalString += "\n    }"
        totalString += ","
        totalString += "\n"

  if(totalString[:-2]):
    totalString = totalString[:-2]
    totalString += "\n]"
    #  print totalString
    jsonobj = json.loads(totalString)
    return jsonobj

@api_view(['GET'])
def live_data_get(request, train_number):
	if request.method == 'GET':
		return Response(get_train_vals(train_number))



