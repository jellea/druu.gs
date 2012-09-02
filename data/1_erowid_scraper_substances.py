import urllib, json

subsurl="http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22https%3A%2F%2Fwww.erowid.org%2Fexperiences%2Fexp_list.shtml%22%20and%20xpath%3D%22%2F%2Ftr%2Ftd%5B%40colspan%3D'2'%5D%2Ffont%2Fstrong%22&format=json&diagnostics=true&callback="

substances = json.loads(urllib.urlopen(subsurl).read())

subslist = [] # [{"name","exp","info"},{...}]

f = open("substances.json","w")

for substance in substances["query"]["results"]["strong"]:
  print substance["a"][0]["name"]+" - "+substance["a"][1]["href"]
  vaulturl = urllib.quote_plus("http://www.erowid.org/experiences/"+substance["a"][1]["href"])

  infoyqllink = "http://query.yahooapis.com/v1/public/yql?q=select%20href%20from%20html%20where%20url%3D%22"+vaulturl+"%22%20and%20xpath%3D%22%2F%2Ftable%2Ftr%5B1%5D%2Ftd%2Fa%22&format=json&diagnostics=false&callback="
  infoyqllink = json.loads(urllib.urlopen(infoyqllink).read())
  try:
    explink = infoyqllink["query"]["results"]["a"][2]["href"]
  except:
    explink = ""
  print explink
  try:
    infolink = "http://www.erowid.org"+infoyqllink["query"]["results"]["a"][1]["href"]
  except:
    infolink = ""
  print infolink

  subslist.append({'name':substance["a"][0]["name"],'exp':infolink,'info':explink})

f.write(json.dumps(subslist))
f.close()
