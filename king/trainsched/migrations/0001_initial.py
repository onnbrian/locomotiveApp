# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-03-31 22:11
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Trainroute',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('origin', models.CharField(max_length=100)),
                ('dest', models.CharField(max_length=100)),
                ('transfers', models.TextField()),
                ('departure', models.DateTimeField()),
                ('arrival', models.DateTimeField()),
                ('travelTime', models.BigIntegerField()),
            ],
        ),
    ]
