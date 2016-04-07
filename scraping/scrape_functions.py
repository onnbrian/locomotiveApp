from selenium import webdriver
from selenium.webdriver.support.ui import Select
import requests
from bs4 import BeautifulSoup
from pprint import pprint
import re

# Princeton
# New York Penn Station


# helper function for <getRouteData> to get HTML to scrape
def getRouteHTML(origin, dest):
	# open up web driver to nj transit rail search page
	driver = webdriver.Firefox();
	driver.get("http://www.njtransit.com/sf/sf_servlet.srv?hdnPageAction=TrainTo")

	# get relevant form elements + convert to select objects
	originEl = driver.find_element_by_name('selOrigin')
	destEl = driver.find_element_by_name('selDestination')
	selOrigin = Select(originEl)
	selDest = Select(destEl)

	# make location selections: from princeton to new york penn station
	selOrigin.select_by_visible_text(origin)
	selDest.select_by_visible_text(dest)

	# submit form
	button = driver.find_element_by_xpath("//input[@value='View Schedule']")
	button.click()

	# get html and return
	return driver.page_source

def getTransferJSON():
	return

def getTripJSON(origin, dest, timeDeparture, timeArrival, travelTime, transfers):
	return {"origin": origin, 
			"dest": dest, 
			"departure": str(timeDeparture), 
			"arrival": str(timeArrival), 
			"transfers": "none", 
			"travelTime": 60}

# scrape route data for <origin> and <dest>
def getRouteData(origin, dest):
	html_source = getRouteHTML(origin, dest)
	soup = BeautifulSoup(html_source, "html.parser")
	#print soup.prettify()

	g_data = soup.find_all("div", {"style": "width:578px; height:630px; overflow-x:auto; overflow-y:auto;"})

	master = []
	count = 0
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

			# Parse departure time + train
			orig_dep = [temp[i].text[:8], temp[i].text[8:]]
			i = i+1

			# Parse connections (if they exist. if not, just leave an empty list [] in place)
			trans = []
			while not temp[i].text[0].isdigit():  #len(temp[i].text) > 8: # and temp[i].text[:7]=="Arrive ":
				if temp[i].text[:7] == "Arrive ":
					run = temp[i].text[7:].replace("Arrive ", "^").replace("Depart ", "^").split("^")
					for j, r in enumerate(run):
						if j%2 == 0:
							trans.append([u"A", r[:8], r[8:]])
						else:
							trans.append([u"D", r[:8], r[8:]])
				i = i+1

			# Parse arrival time
			dest_arr = temp[i].text
			i = i+1

			# Parse duration
			tot_trav_time = temp[i].text
			i = i+1

			# Put the trip together
			trip = [orig_dep, trans, dest_arr, tot_trav_time]
			print getTripJSON(origin, dest,)
			break
			master.append(trip)

t = getRouteHTML('Princeton', 'New York Penn Station')
print getRouteData('Princeton', 'New York Penn Station')
