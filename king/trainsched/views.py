from trainsched.models import Trainroute, Transfer
from trainsched.serializers import TrainrouteSerializer, TransferSerializer
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

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
