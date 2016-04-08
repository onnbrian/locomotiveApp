from __future__ import unicode_literals
from django.db import models
import django.utils.timezone

# Create your models here.
class Trainroute(models.Model):
	primary_key = models.CharField(max_length=100, primary_key=True)
	created = models.DateTimeField(auto_now_add=True)
	origin = models.CharField(max_length=100)
	dest = models.CharField(max_length=100)
	trainName = models.CharField(max_length=100)
	departure = models.DateTimeField()
	arrival = models.DateTimeField()
	#transfers = models.TextField(default='')
	duration = models.PositiveIntegerField()

class Transfer(models.Model):
	trainroute = models.ForeignKey(Trainroute, related_name='transfers', on_delete=models.CASCADE)
	order = models.IntegerField()
	created = models.DateTimeField(auto_now_add=True)
	arrival = models.DateTimeField()
	departure = models.DateTimeField()
	location = models.CharField(max_length=100)
	trainName = models.CharField(max_length=100)

	class Meta:
		ordering = ['order']

	def __unicode__(self):
		return '%d %s %s %s %s' % (self.order, self.location, self.trainName, self.arrival, self.departure)