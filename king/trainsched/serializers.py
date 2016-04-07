from rest_framework import serializers
from trainsched.models import Trainroute

class TrainrouteSerializer(serializers.Serializer):
    created = serializers.DateTimeField(read_only=True)
    origin = serializers.CharField(max_length=100)
    dest = serializers.CharField(max_length=100)
    departure = serializers.DateTimeField()
    arrival = serializers.DateTimeField()
    transfers = serializers.CharField()
    travelTime = serializers.IntegerField()

    def create(self, validated_data):
        """
        Create and return a new `route` instance, given the validated data.
        """
        return Trainroute.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """
        Update and return an existing `route` instance, given the validated data.
        """
        instance.origin = validated_data.get('origin', instance.origin)
        instance.dest = validated_data.get('dest', instance.dest)
        instance.departure = validated_data.get('departure', instance.departure)
        instance.arrival = validated_data.get('arrival', instance.arrival)
        instance.transfers = validated_data.get('transfers', instance.transfers)
        instance.travelTime = validated_data.get('travelTime', instance.travelTime)
        instance.save()
        return instance

'''
from trainsched.models import Trainroute
from trainsched.serializers import TrainrouteSerializer
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from datetime import datetime
t = Trainroute(origin="princeton", dest="newark", departure=datetime(2016, 3, 31, 7, 46,40, tzinfo=None), arrival=datetime(2016, 3, 31, 9, 46,40, tzinfo=None), travelTime=60)
'''
