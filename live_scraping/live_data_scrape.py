from bs4 import BeautifulSoup
import urllib2
import json
import sys

# LIVE SCRAPING FUNCTION
def get_train_vals(trainNum):
  base_url = "http://dv.njtransit.com/mobile/train_stops.aspx?sid=PJ&train="
  page = urllib2.urlopen(base_url + trainNum)
  soup = BeautifulSoup(page.read(), "html5lib")
  string = soup.find_all("td")
  totalString = "[\n"

  for s in range(len(string)):
    if(string[s].find("p")):
        text = string[s].find("p").get_text()
        text2 = " ".join(text.split())
      # print text2
        splitText = text2.split()
        totalString += "    {\n        \"location\": \""
        if " at " in text2:
          for i in range(len(splitText) - 2):
            totalString += splitText[i]
            if(i != len(splitText)-3):
              totalString += " "
        else:
          for i in range(len(splitText) - 1):
            totalString += splitText[i]
            if(i != len(splitText)-2):
              totalString += " "

        totalString += "\",\n        \"time\":"
        totalString += " \"" + splitText[len(splitText)-1] + "\""
        totalString += "\n    }"
        totalString += ","
        totalString += "\n"

  if(totalString[:-2]):
    totalString = totalString[:-2]
    totalString += "\n]"
    #  print totalString
    jsonobj = json.loads(totalString)
    return jsonobj

  
