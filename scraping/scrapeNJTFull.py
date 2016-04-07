from selenium import webdriver
from selenium.webdriver.support.ui import Select
import requests
from bs4 import BeautifulSoup
from pprint import pprint
import re

# open up web driver to nj transit rail search page
driver = webdriver.Firefox();
driver.get("http://www.njtransit.com/sf/sf_servlet.srv?hdnPageAction=TrainTo")

# get relevant form elements + convert to select objects
originEl = driver.find_element_by_name('selOrigin')
destEl = driver.find_element_by_name('selDestination')
selOrigin = Select(originEl)
selDest = Select(destEl)

# make location selections: from princeton to new york penn station
selOrigin.select_by_visible_text('Princeton')
selDest.select_by_visible_text('New York Penn Station')

# submit form
button = driver.find_element_by_xpath("//input[@value='View Schedule']")
button.click()

# get html
html_source = driver.page_source

#  ---------------------------   S    C    R    A    P    E   ------------------------  #

soup = BeautifulSoup(html_source, "html.parser")
#print soup.prettify()

g_data = soup.find_all("div", {"style": "width:578px; height:630px; overflow-x:auto; overflow-y:auto;"})

master = []
count = 0
for item in g_data:
#    print item.text
    temp = item.find_all("span")
#    print temp

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
        master.append(trip)

# This is the totality of the data, correctly formatted. master is a list of trips, to put it simply. 
# Each "row" of the NJ Transit output viewable on the website represents one "trip." Each trip list in master
# is itself a list, comprising of four main parts: OriginDeparture, Transfer, DestinationArrival, and
# Total Travel Time. Each of these parts corresponds exactly with the same information seen under these same
# headins on the NJ Transit website. It is better for me to show an example. I will choose the list which is the
# first element of master when "Princeton" and "New York Penn Station" are the to and from locations,
# respectively, on the date 03/29/2016. This list is then the first trip, the trip which leaves at 04:58 AM
# and arrives at 6:12 AM. Here is that list, represented so you can see the components better:
#
#  [[u'04:58 AM', u'Princeton Shuttle #4106'],
#   [[u'A', u'05:03 AM', u'Princeton Junction'],
#    [u'D', u'05:20 AM', u'Northeast Corridor #3910']],
#   u'06:12 AM',
#   u'74 minutes']
#
# Note that the u's before each string in the list simply indicate that they are unicode strings, which can be
# easily converted to any other string format one fancies. We see that it is a list of three lists and two 
# strings, where each inner list or string represents one of the four main parts of the trip, containing all 
# of the pieces of information which make up that main part. For example, the OriginDeparture main part (the 
# first component of the trip list above), consists of a list containing '04:58 AM', the time of departure, and 
# 'Princeton Shuttle #4106', the train of departure, which are the two pieces of information found in the
# OriginDeparture column on the NK Transit website representation. On the other hand, '06:14 AM', the
# penultimate element of the above trip list, is just a string, and represents the DestinationArrival column
# (for the first trip) from the NJ Transit website. Finally, I should note that the 'A' and 'D's that you see
# in the trip list represent "Arrive" and "Depart" transfers, respectively. All other relationships should not
# be hard to figure out between the NJ Transit website and the master list. The following statement prints out
# the master list for you so that you can see all the data with clean formatting.

pprint(master)
