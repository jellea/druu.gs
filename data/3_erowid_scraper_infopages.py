import urllib, json, re

f = open("substanceslist.json","r")
jsonlist = json.loads(f.read())
f.close()

commons = ["basics","effects","images","health","law","dose","chemistry"]

for sub in jsonlist:
  try:
    if(sub["exp"]):
      infolink = urllib.quote_plus(sub["info"])
      #yqllink = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22"+infolink+"%22%20%20and%20xpath%3D%22div%22&format=json&diagnostics=true"
      yqllink = "http://query.yahooapis.com/v1/public/yql?q=select%20href%2Cimg.src%20from%20html%20where%20url%3D%22"+infolink+"%22%20%20and%20xpath%3D%22%2F%2Fdiv%5B%40class%3D'summary-card-icon-surround'%5D%2Fa%22&format=json&diagnostics=true"
      fetcheddata = json.loads(urllib.urlopen(yqllink).read())
      sub["deepinfo"] = {}
      #print fetcheddata
      for link in fetcheddata["query"]["results"]["a"]:
        print link
        for typeimg in commons:
          typeimgext = "/"+typeimg+".jpg"
          if re.search(typeimgext,link["img"]["src"]) != None:
            sub["deepinfo"][typeimg] = sub["info"]+link["href"]
        #print sub["info"]+link["href"] +" to "+ link["img"]["src"]
      print sub
  except:
    print "bla"

d = open("substances-list2.json","w")
d.write(json.dumps(jsonlist))
d.close()
