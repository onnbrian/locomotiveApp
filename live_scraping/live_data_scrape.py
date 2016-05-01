from bs4 import BeautifulSoup
import urllib2
import json
import sys
import datetime 
import time

# Takes in departure time in military time string (e.g. "14:35") 
# and the live-scraped hour:minute string (e.g. "11:12") and returns 
# whether the live-scraped time is 'AM' or 'PM'.
def get_am_pm(departure, live):
  dep_hm = departure.split(':')
  liv_hm = live.split(':')

  dep = datetime.time(int(dep_hm[0]), int(dep_hm[1]))

  am_edition = None
  pm_edition = None
  if (int(liv_hm[0]) < 12):
    h = int(liv_hm[0])
    m = int(liv_hm[1])
    am_edition = datetime.time(h,m)
  else:
    h = 0
    m = int(liv_hm[1])
    am_edition = datetime.time(h,m)

  pm_edition = datetime.time(h+12,m)

  dummydate = datetime.date(2000,1,1)
  dummydate_1 = datetime.date(2000,1,2)

  am_delta_00 = datetime.datetime.combine(dummydate,dep) - datetime.datetime.combine(dummydate,am_edition)
  am_delta_01 = datetime.datetime.combine(dummydate,dep) - datetime.datetime.combine(dummydate_1,am_edition)
  am_delta_10 = datetime.datetime.combine(dummydate_1,dep) - datetime.datetime.combine(dummydate,am_edition)
  
  am_delta_min = min(abs(am_delta_00.total_seconds()), abs(am_delta_01.total_seconds()), abs(am_delta_10.total_seconds()))

  pm_delta_00 = datetime.datetime.combine(dummydate,dep) - datetime.datetime.combine(dummydate,pm_edition)
  pm_delta_01 = datetime.datetime.combine(dummydate,dep) - datetime.datetime.combine(dummydate_1,pm_edition)
  pm_delta_10 = datetime.datetime.combine(dummydate_1,dep) - datetime.datetime.combine(dummydate,pm_edition)

  pm_delta_min = min(abs(pm_delta_00.total_seconds()), abs(pm_delta_01.total_seconds()), abs(pm_delta_10.total_seconds()))

  if am_delta_min < pm_delta_min:
    return 'AM'
  else:
    return 'PM'

def isTimeFormat(input):
    try:
        time.strptime(input, '%H:%M')
        return True
    except ValueError:
        return False

# LIVE SCRAPING FUNCTION
def get_train_vals(departure, trainNum):
  base_url = "http://dv.njtransit.com/mobile/train_stops.aspx?sid=PJ&train="
  page = urllib2.urlopen(base_url + trainNum)
  soup = BeautifulSoup(page.read(), "html5lib")
  string = soup.find_all("td")
  lis = []                      # list to be converted to json

  for s in range(len(string)):
    if(string[s].find("p")):
      dic = {}                  # new dictionary to go in list
      text = string[s].find("p").get_text()
      text1a = None
      if (string[s].find("i")):
        text1 = string[s].find("i").get_text()
        text1a = " ".join(text1.split())
      text2 = " ".join(text.split())
      part = text2.rpartition(" at ")

      loc = ""
      if " at " in text2:
        loc = part[0]
        text1a = part[2]
      else:
        loc = text2.replace(text1a, "")

      dic['location'] = loc
      dic['time'] = text1a

      # if time is collected, add dictionary to list
      # loc will always have something.. but j.i.c
      if text1a and loc:
        lis.append(dic)

  # iterate through list
  for dic in lis:
    if (isTimeFormat(dic['time'])):
      dic['time'] = dic['time'] + ' ' + get_am_pm(departure, dic['time']) 

  jsonobj = json.dumps(lis)
  return jsonobj


print get_train_vals('22:45', '7871')

  
