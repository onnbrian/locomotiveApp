from rest_framework import serializers
from trainsched.models import Trainroute, Transfer
class TransferSerializer(serializers.ModelSerializer):
    '''
    trainroute = serializers.IntegerField()
    created = serializers.DateTimeField(read_only=True)
    order = serializers.IntegerField()
    arrival = serializers.DateTimeField()
    departure = serializers.DateTimeField()
    location = serializers.CharField(max_length=100)
    trainName = serializers.CharField(max_length=100)

    def create(self, validated_data):
        """
        Create and return a new `route` instance, given the validated data.
        """
        return Transfer.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """
        Update and return an existing `route` instance, given the validated data.
        """
        trainroute = validated_data.get('trainroute', instance,trainroute)
        instance.order = validated_data.get('order', instance.origin)
        instance.arrival = validated_data.get('arrival', instance.dest)
        instance.departure = validated_data.get('departure', instance.departure)
        instance.location = validated_data.get('location', instance.departure)
        instance.trainName = validated_data.get('trainName', instance.trainName)
        instance.save()
        return instance
    '''

    class Meta:
        model = Transfer
        fields = ('order', 'departure', 'arrival', 'location', 'trainName', 'trainroute')

class TrainrouteSerializer(serializers.ModelSerializer):
    transfers = TransferSerializer(many=True, read_only=True)
    '''
    id = serializers.ReadOnlyField()
    created = serializers.DateTimeField(read_only=True)
    origin = serializers.CharField(max_length=100)
    dest = serializers.CharField(max_length=100)
    trainName = serializers.CharField(max_length=100)
    departure = serializers.DateTimeField()
    arrival = serializers.DateTimeField()
    transfers = serializers.RelatedField(many=True, read_only=True)
    duration = serializers.IntegerField()

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
        instance.trainName = validated_data.get('trainName', instance.trainName)
        instance.departure = validated_data.get('departure', instance.departure)
        instance.arrival = validated_data.get('arrival', instance.arrival)
        instance.duration = validated_data.get('travelTime', instance.duration)
        instance.save()
        return instance
    '''

    class Meta:
        model = Trainroute
        fields = ('primary_key', 'created', 'origin', 'dest', 'trainName', 'departure', 'arrival', 'transfers', 'duration')
