from __future__ import unicode_literals
from django.db import models
import django.utils.timezone

# Create your models here.
class Trainroute(models.Model):
	created = models.DateTimeField(auto_now_add=True)
	origin = models.CharField(max_length=100)
	dest = models.CharField(max_length=100)
	departure = models.DateTimeField()
	arrival = models.DateTimeField()
	transfers = models.TextField(default='')
	travelTime = models.PositiveIntegerField()
