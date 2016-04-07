# Introduction

__asuna__ is the frontend (ionic/angular).

__king__ is the backend (Django Rest Framework).

__scraping__ contains the external files for populating the database.

# About the king Backend

## A king Train Record
__king__ works with train route records. Each train route record is an object with the following attributes:
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
* transfers: (string)
	* any transfers in JSON
* travelTime: (integer)
	* how long is the total train ride?

## Start king Locally

To run __king__ locally and make post/get/delete requests:
* cd into __king__ (outer directory, where manage.py is)
* python manage.py runserver

## Making GET requests to king (i.e. view database contents in browser)
* go to localhost:8000/trainsched/all/ to view (get) all route instances in database
* go to localhost:8000/trainsched/fromto/<origin>/<dest> to view all route instances from <origin> and to <dest> in database

## Making POST requests to king (i.e. inserting train route records into database)
* we store the objects using JSON format. For example:
	{
	    "origin": "Princeton Station",
	    "dest": "Philadelphia 30th Street",
	    "departure": "2016-03-31T07:46:40Z",
	    "arrival": "2016-03-31T09:46:40Z",
	    "transfers": "none",
	    "travelTime": 60
	}
* go to localhost:8000/trainsched/all/ to post individual train routes. 
   	* scroll down to the textbox next to the words "content". 
   	* copy-paste the following JSON string (you can edit the values but not the keys) without the outer double quotes into the box:
		```
		"{
			"origin": "Princeton Station",
			"dest": "Philadelphia 30th Street",
			"departure": "2016-03-31T07:46:40Z",
			"arrival": "2016-03-31T09:46:40Z",
			"transfers": "none",
			"travelTime": 60
		}"
		```
	* press the post button
	* view your newly entered data using one of the GET urls
* go to localhost:8000/trainsched/masspost/ to post multiple train route records simultaneously.
	* go to the textbox. 
	* copy-paste a list of JSON string representations of the train records (without the outer double quotes):
		```
		"[{
			"origin": "Princeton Station",
			"dest": "Philadelphia 30th Street",
			"departure": "2016-03-31T07:46:40Z",
			"arrival": "2016-03-31T09:46:40Z",
			"transfers": "none",
			"travelTime": 60
		},
		{
			"origin": "Princeton Station",
			"dest": "Newark Airport",
			"departure": "2016-03-31T07:46:40Z",
			"arrival": "2016-03-31T09:46:40Z",
			"transfers": "none",
			"travelTime": 100
		}]"
		```
	* press the post button
	* view your newly entered data using one of the GET urls


