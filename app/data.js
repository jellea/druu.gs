App.Data = (function(lng, app, undefined) {
  lng.Data.Sql.init({
    name: 'druu.gs',
    version: '1.0',
    schema: [
        {
            name: 'substances',
            drop: true,
            fields: {
              id: 'INTEGER PRIMARY KEY',
              name: 'TEXT',
              info: 'TEXT',
              exp: 'TEXT',
              perma: 'TEXT',
              totalexp: 'INTEGER',
              basics: 'TEXT',
              chemistry: 'TEXT',
              dose: 'TEXT',
              effects: 'TEXT',
              images: 'TEXT',
              law: 'TEXT'
            }
        }
    ]
  });

  var type = function type(o){
    return !!o && Object.prototype.toString.call(o).match(/(\w+)\]/)[1];
  }
  var getInfolinks = function(substanceobj){
    for (infotype in substanceobj.deepinfo){
      console.log(substanceobj.deepinfo[infotype]);
    }
    return substanceobj;
  }
  var getExperience = function(reportid){
    LUNGO.Sugar.Growl.show('Loading!', 'Downloading Experience','loading');
    var url = "http://query.yahooapis.com/v1/public/yql"
    var getdata = {
      q: "select * from html where url='\
      http://www.erowid.org/experiences/"+encodeURIComponent(reportid)+"'\
      and xpath='//div[@class=\"report-text-surround\"]/p' and charset='iso-8859-1'",
      format:'json',
    }

    lng.Service.cache(url, getdata, '10 minutes', function(response) {
      data = {
        bodycontent: response.query.results.p.content.replace(/\n/g,"<br>")
      }
      App.View.makeExperiencePage(data);
      LUNGO.Sugar.Growl.hide();
    });
  };
  var getSubstanceList = function(){
    //LUNGO.Sugar.Growl.show('Loading!', 'Downloading substances','loading');
    lng.Service.get("data/substances-list2.json", '10 days', function(response) {
      window.SubstanceList = response;
      lng.Core.orderByProperty(response, 'name', 'asc');
      App.View.makeAsideSubstanceList(response);
      for(item in response){
        //lng.Data.Sql.insert('substances', row);
        lng.Data.Cache.set(response[item].perma, response[item]);
        lng.Data.Cache.set("currentpage", response[item].perma);
      };
      lng.Core.orderByProperty(response, 'totalexp', 'desc');
      var top10 = []
      for (i=0;i<11;++i) {
        top10.push(response[i]);
      }
      App.View.makeFavoritesList(top10);

      //LUNGO.Sugar.Growl.hide();
    });
  };
  getSubstanceList();

  var getExperiencesList = function(substanceobj){
    LUNGO.Sugar.Growl.show('Loading!', 'Downloading Info and Experiences','loading');
    var url = "http://query.yahooapis.com/v1/public/yql"
    var getdata = {
      q: "select * from html where url='"+encodeURIComponent(substanceobj.exp)+"' and xpath='//center/table/tr/td/form/table/tr[position()>2]'",
      format:'json'
    }
    lng.Service.cache(url, getdata, '10 days', function(response) {
      App.View.makeExperiencesList(response.query.results.tr);
      LUNGO.Sugar.Growl.hide();
    });
  };
  return {
    getExperiencesList: getExperiencesList,
    type:               type,
    getExperience:      getExperience,
    getInfolinks:       getInfolinks
  }

})(LUNGO, App);

