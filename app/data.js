App.Data = (function(lng, app, undefined)
{
  lng.Data.Sql.init(
  {
    name: 'druu.gs',
    version: '1.0',
    schema: 
    [
      {
        name: 'substances',
        drop: false,
        fields:
        {
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
      },
      {
        name: 'experiences',
        drop: false,
        fields:
        {
          id: 'INTEGER PRIMARY KEY',
          fav: 'INTEGER DEFAULT 0',
          title: 'TEXT',
          author: 'TEXT',
          content: '',
          date: 'TEXT',
          url: 'TEXT',
          subs: 'TEXT',
          subid: 'INTEGER',
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
      callBack(result);
    });
  }

  var type = function type(o){
    return !!o && Object.prototype.toString.call(o).match(/(\w+)\]/)[1];
  }

  var getInfolinks = function(substanceobj)
  {
    for (infotype in substanceobj.deepinfo)
    {
      console.log(substanceobj.deepinfo[infotype]);
    }
    return substanceobj;
  }

  var getNextExperience = function(current,subid,prevnext)
  {
    if (prevnext == "prev")
    {
      var arrow = "<";
      var order = "ORDER BY id DESC";
    }
    else
    {
      var arrow = ">";
      var order = "";
    }
    executeSelect('SELECT id FROM experiences WHERE id '+arrow+' "'+current+'" AND subid='+subid+' '+order+' LIMIT 1',
                  function(result) {
                    getExperience(result[0].id);
                  });
  }

  var getExperience = function(reportid)
  {
    executeSelect('SELECT * FROM experiences WHERE id = "'+reportid+'"',
      function(result) {
        if (result[0].content == null){
          LUNGO.Sugar.Growl.show('Loading!', 'Downloading Experience','loading');
          var url = "http://query.yahooapis.com/v1/public/yql"
          var getdata =
          {
            q: "select * from html where url='\
            http://www.erowid.org/experiences/exp.php?ID="+encodeURIComponent(reportid)+"'\
            and xpath='//div[@class=\"report-text-surround\"]/p' and charset='iso-8859-1'",
            format:'json',
          }
          lng.Service.cache(url, getdata, '10 minutes', function(response) 
          {
            executeSelect('UPDATE experiences SET content="'+
                          response.query.results.p.content.replace(/\n/g,'<br>')+
                          '" WHERE id='+reportid+
                          ';',function(status){});
            LUNGO.Sugar.Growl.hide();
            getExperience(reportid);
          });
        }
        else
        {
          App.View.makeExperiencePage(result);
        }
      });
  };

  var makeTop10 = function() 
  {
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
  }

  var searchSubstance = function(name)
  {
    console.log('searching for...'+ name);
    executeSelect('SELECT * FROM substances WHERE name LIKE "%'+ name +'%" ORDER BY name ASC',
      function(result)
      {
        console.log(result);
        App.View.makeAsideSubstanceList(result);
      }
    );
  }

  var getSubstanceList = function()
  {
    executeSelect('SELECT * FROM substances ORDER BY name ASC',
      function(result)
      {
        if(result.length == 0)
        {
          lng.Service.get("data/substances-list2.json", '10 days', function(response) 
          {
            for(item in response)
            {
              delete response[item].deepinfo;
              if (response[item].info == "")
              {
                  delete response[item].info;
              }
              response[item].id = item;
            };
            lng.Data.Sql.insert('substances', response);
            getSubstanceList();
          });
        }
        else
        {
          App.View.makeAsideSubstanceList(result);
          makeTop10();
        }
      }
    )
  }
  getSubstanceList();

  var getExperiencesList = function(substanceobj)
  {
    LUNGO.Sugar.Growl.show('Loading!', 'Downloading Info and Experiences','loading');
    executeSelect('SELECT * FROM experiences WHERE subid="'+substanceobj[0].id+'" LIMIT 100',
      function(result) 
      {
        if(result.length == 0)
        {
          console.log(substanceobj[0]);
          var url = "http://query.yahooapis.com/v1/public/yql";
          var getdata =
          {
            q: "select * from html where url='"+
              encodeURIComponent(substanceobj[0].exp)+
              "' and xpath='//center/table/tr/td/form/table/tr[position()>2]'",
            format:'json'
          }
          lng.Service.cache(url, getdata, '10 days', function(response) 
          {
            rowdata = []
            if(App.Data.type(response.query.results.tr)=="Object")
            {
              response.query.results.tr = [response.query.results.tr];
            };
            for (item in response.query.results.tr)
            {
              var row = response.query.results.tr[item];
              var r =    {};
              r.id =     row.td[1].a.href.replace("exp.php?ID=","");
              r.author = row.td[2].p;
              r.title =  row.td[1].a.content;
              r.subs =   row.td[3].p;
              r.date =   row.td[4].p;
              r.url =    row.td[1].a.href;
              r.fav =    0;
              r.subid =  substanceobj[0].id;
              rowdata.push(r);
            }
            lng.Data.Sql.insert('experiences', rowdata);
            App.View.makeExperiencesList(rowdata);
          });
        }
        else
        {
          App.View.makeExperiencesList(result);
        }
      });
  };
  return {
    getExperiencesList: getExperiencesList,
    type:               type,
    getExperience:      getExperience,
    getInfolinks:       getInfolinks,
    searchSubstance:    searchSubstance,
    getNextExperience:  getNextExperience
  }

})(LUNGO, App);

