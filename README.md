# Introduction

__asuna__ is the frontend (ionic/angular).

__king__ is the backend (Django Rest Framework).

__scraping__ contains the external files for populating the database (str8 python).

# About the king Backend

## Start king Locally
To run __king__ locally and make post/get/delete requests:
* cd into __king__ (outer directory, where manage.py is)
* python manage.py runserver

## A king Trainroute Record
__king__ works with Trainroute records. Each Trainroute record is an object with the following attributes:
* created: (python datetime object, automatically created by default, so don't specify) 
	* the date and time this record was added to the database
* origin: string
	* where is the train starting?
* dest: string
	* where is the train going?
* departure: (python datetime object, but can be represented with string from browser)
	* when does the train leave origin?
* arrival: (python datetime object, but can be represented with string from browser)
	* when does the train arrive?
* duration: (integer)
	* how long is the total train ride?

## Making Trainroute GET requests to king (i.e. view database contents in browser)
* go to localhost:8000/trainsched/routes_all/ to view (get) all route instances in database
* go to localhost:8000/trainsched/routes_from_to/_origin_/_dest_ to view all route instances from _origin_ and to _dest_ in database

## Making Trainroute POST requests to king (i.e. inserting train route records into database)
* we store the objects using JSON format. For example, 
	```
	"{
	    "origin": "Princeton",
	    "dest": "Philadelphia 30th Street",
	    "departure": "2016-03-31T07:46:40Z",
	    "arrival": "2016-03-31T09:46:40Z",
	    "duration": 60
	}"
	```
* go to localhost:8000/trainsched/all/ to post individual train routes. 
   	* scroll down to the textbox next to the words "content". 
   	* copy-paste the following JSON string (you can edit the values but not the keys) without the outer double quotes into the box:
		```
		"{
			"origin": "Princeton",
			"dest": "Philadelphia 30th Street",
			"departure": "2016-03-31T07:46:40Z",
			"arrival": "2016-03-31T09:46:40Z",
			"duration": 60
		}"
		```
	* press the post button
	* view your newly entered data using one of the GET urls
* go to localhost:8000/trainsched/routes_post_mass/ to post multiple train route records simultaneously.
	* go to the textbox. 
	* copy-paste a list of JSON string representations of the train records (without the outer double quotes):
		```
		"[{
			"origin": "Princeton",
			"dest": "Philadelphia 30th Street",
			"departure": "2016-03-31T07:46:40Z",
			"arrival": "2016-03-31T09:46:40Z",
			"duration": 60
		},
		{
			"origin": "Princeton",
			"dest": "Newark Airport",
			"departure": "2016-03-31T07:46:40Z",
			"arrival": "2016-03-31T09:46:40Z",
			"duration": 100
		}]"
		```
	* press the post button
	* view your newly entered data using one of the GET urls


