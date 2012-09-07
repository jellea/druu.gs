App.Data = (function(lng, app, undefined) {
  lng.Data.Sql.init({
    name: 'druu.gs',
    version: '1.0',
    schema: [
        {
            name: 'substances',
            drop: false,
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

  var executeSelect = function(sql, callBack)
  {
    var result = [];
    lng.Data.Sql.execute(sql, function(rs){
      for (var i = 0, len = rs.rows.length; i < len; i++) 
        {
        result.push(rs.rows.item(i));
        }
      //console.log(callBack);
      callBack(result);
    }
    );
  }

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
    // check if sqlite excists otherwise get
    lng.Service.get("data/substances-list2.json", '10 days', function(response) {
      for(item in response){
        delete response[item].deepinfo;
        if (response[item].info == "")
          {
            delete response[item].info;
          }
        response[item].id = item;
      };
      lng.Data.Sql.insert('substances', response);
      
      executeSelect('SELECT * FROM substances ORDER BY name ASC',
                    function(result) 
                    {
                        App.View.makeAsideSubstanceList(result);
                    });
                    }
                   );
      executeSelect('SELECT * FROM substances ORDER BY totalexp DESC LIMIT 10',
                    function(result) {
                      var top10 = [];
                      for (i in result) 
                        {
                        top10.push(result[i]);
                        }
                      App.View.makeFavoritesList(top10);
                    }
                   );
  };
  getSubstanceList();

  var getExperiencesList = function(substanceobj){
    LUNGO.Sugar.Growl.show('Loading!', 'Downloading Info and Experiences','loading');
    var url = "http://query.yahooapis.com/v1/public/yql"
    var getdata = {
      q: "select * from html where url='"+encodeURIComponent(substanceobj[0].exp)+"' and xpath='//center/table/tr/td/form/table/tr[position()>2]'",
      format:'json'
    }
    lng.Service.cache(url, getdata, '10 days', function(response) {
      console.log(response);
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

