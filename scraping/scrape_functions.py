from selenium import webdriver
from selenium.webdriver.support.ui import Select
from bs4 import BeautifulSoup
import re
from datetime import datetime, date
import crud_functions
import format_models
import json

# Princeton
# New York Penn Station


# helper function for <getRouteData> to get HTML to scrape
def getRouteHTML(origin, dest, d):
	input_day = str(d.day)
	#print input_day
	input_month = d.month

	month = datetime.now().month

	# open up web driver to nj transit rail search page
	driver = webdriver.PhantomJS();
	driver.get("http://www.njtransit.com/sf/sf_servlet.srv?hdnPageAction=TrainTo")

	# get relevant form elements + convert to select objects
	originEl = driver.find_element_by_name('selOrigin')
	destEl = driver.find_element_by_name('selDestination')
	selOrigin = Select(originEl)
	selDest = Select(destEl)

	# make location selections: from princeton to new york penn station
	selOrigin.select_by_visible_text(origin)
	selDest.select_by_visible_text(dest)

	# Pick date
	driver.find_element_by_id("datepicker").click()

	while month != input_month:
	    driver.find_element_by_xpath("//*[@id='dp-popup']/div[2]/a[2]").click()
	    if month == 12:
	        month = 1
	    else:
	        month = month + 1

	datepicker = driver.find_element_by_id("dp-popup")
	rows = datepicker.find_elements_by_tag_name("tr")
	columns = datepicker.find_elements_by_tag_name("td")

	passdiss = False
	for cell in columns:
	    if cell.text == "1":
	        passdiss = True
	    if passdiss:
	        #print cell.text                                                        
	        if cell.text == input_day:
	        	cell.click()
	        	break

	# submit form
	button = driver.find_element_by_xpath("//input[@value='View Schedule']")
	button.click()

	# get html and return
	return driver.page_source

# scrape route data for <origin> and <dest>
def getTrainData(origin, dest, d):
	html_source = getRouteHTML(origin, dest, d)
	soup = BeautifulSoup(html_source, "html.parser")
	#print soup.prettify()

	g_data = soup.find_all("div", {"style": "width:578px; height:630px; overflow-x:auto; overflow-y:auto;"})

	all_routes = []
	all_transfers = []
	# collected attributes per loop:
	# <time_dep> (time leaving origin)
	# <time_arr> (time arriving at dest)
	# <train_dep> (train leaving origin)
	# <trans> (transfers)
	# <tot_trav_time> (travel time)
	for item in g_data:
		# print item.text
		temp = item.find_all("span")
		# print temp
		i = 0
		
		while i < len(temp):
	        # Eat opening lines
			if temp[i].text=="OriginDeparture" or temp[i].text=="Transfer" or temp[i].text=="DestinationArrival" or temp[i].text=="Total Travel Time":
				i = i+1
				continue

			# parse departure time
			time_dep = temp[i].text[:8]
			# parse departure train
			train_name = temp[i].text[8:]

			i = i+1

			# Parse connections (if they exist. if not, just leave an empty list [] in place)
			currTransfers = []
			while not temp[i].text[0].isdigit():  #len(temp[i].text) > 8: # and temp[i].text[:7]=="Arrive ":
				if temp[i].text[:7] == "Arrive ":
					run = temp[i].text[7:].replace("Arrive ", "^").replace("Depart ", "^").split("^")
					transfer = {}
					for j, r in enumerate(run):
						if j % 2 == 0:
							transfer['arrival'] = r[:8]
							transfer['location'] = r[8:]
						else:
							transfer['departure'] = r[:8]
							transfer['trainName'] = r[8:]
							currTransfers.append(transfer)
							transfer = {}
				i = i+1

			# parse arrival time
			time_arr = temp[i].text
			i = i+1

			# Parse duration
			tot_trav_time = temp[i].text
			i = i+1

			# format trip into json for posting
			trip = format_models.getTripJSON(origin, dest, train_name, d, time_dep, time_arr, tot_trav_time)

			# add trip to routes
			all_routes.append(trip)

			# format transfers in trip into json for posting
			# and add to transfers
			for k, t in enumerate(currTransfers):
				all_transfers.append(format_models.getTransferJSON(trip["primary_key"], k, t['trainName'], 
										t['location'], d, t['arrival'], t['departure']))
			
	return [all_routes, all_transfers]