from rest_framework import serializers
from trainsched.models import Trainroute, Transfer

# serialize transfer
class TransferSerializer(serializers.ModelSerializer):

    class Meta:
        model = Transfer
        fields = ('order', 'timeDep', 'timeArr', 'location', 'trainName', 'trainroute')

# serialize trainroute
class TrainrouteSerializer(serializers.ModelSerializer):
    transfers = TransferSerializer(many=True, read_only=True)


    class Meta:
        model = Trainroute
        fields = ('primary_key', 'created', 'origin', 'dest', 'trainName', 'searchDate', 'timeStart', 'timeEnd', 'transfers', 'duration')
