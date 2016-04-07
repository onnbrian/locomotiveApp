from trainsched.models import Trainroute
from trainsched.serializers import TrainrouteSerializer
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

'''
# class view...
class TrainSchedList(APIView):
	"""
	List all train schedules in the database
	"""
	def get(self, request, format=None):
		schedule = Trainroute.objects.all()
		serializer = TrainrouteSerializer(schedule, many=True)
		return Response(serializer.data)

	def post(self, request, format=None):
		serializer = TrainrouteSerializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
'''

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
def routes_fromto(request, origin, dest):
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

@api_view(['POST'])
def routes_masspost(request):
	if request.method == 'POST':
		serializer = TrainrouteSerializer(data=request.data, many=True)
	if serializer.is_valid():
		serializer.save()
		return Response(serializer.data, status=status.HTTP_201_CREATED)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)	

'''
    [{
        "origin": "PrincetonStation",
        "dest": "Philadelphia30thStreetStation",
        "departure": "2016-03-31T07:46:40Z",
        "arrival": "2016-05-01T09:46:40Z",
        "travelTime": 60
    },
    {
        "origin": "PrincetonStation",
        "dest": "Philadelphia30thStreetStation",
        "departure": "2016-04-02T07:46:40Z",
        "arrival": "2016-04-02T09:46:40Z",
        "travelTime": 70
    }],
    {
        "origin": "PrincetonStation",
        "dest": "Philadelphia30thStreetStation",
        "departure": "2016-04-02T07:46:40Z",
        "arrival": "2016-04-02T10:06:40Z",
        "travelTime": 70
    }
'''
