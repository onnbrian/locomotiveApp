# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-04-08 20:41
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('trainsched', '0010_auto_20160408_2026'),
    ]

    operations = [
        migrations.RenameField(
            model_name='trainroute',
            old_name='date',
            new_name='searchDate',
        ),
    ]
