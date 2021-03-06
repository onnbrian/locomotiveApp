# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-04-08 11:52
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('trainsched', '0006_auto_20160408_1108'),
    ]

    operations = [
        migrations.CreateModel(
            name='Transfer',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.IntegerField()),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('arrival', models.DateTimeField()),
                ('departure', models.DateTimeField()),
                ('location', models.CharField(max_length=100)),
                ('trainName', models.CharField(max_length=100)),
            ],
            options={
                'ordering': ['order'],
            },
        ),
        migrations.RemoveField(
            model_name='trainroute',
            name='transfers',
        ),
        migrations.AddField(
            model_name='transfer',
            name='trainroute',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transfers', to='trainsched.Trainroute'),
        ),
    ]
