var App = (function(lng, undefined) {

    //Define your LungoJS Application Instance
    lng.App.init({
        name: 'erowid',
        version: '1.1',
         });

    return {

    };

})(LUNGO);

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
                    if (result[0] != null){
                      getExperience(result[0].id);
                    }
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

  var makeTop10List = function()
  {
    executeSelect('SELECT * FROM substances ORDER BY totalexp DESC LIMIT 10',
      function(result) {
        var top10 = [];
        for (i in result) 
          {
          top10.push(result[i]);
          }
        App.View.makeTop10List(top10);
      }
    );
  }

  var makeFavList = function()
  {
    executeSelect('SELECT * FROM experiences WHERE fav = 1',
      function(result) {
        var favlist = [];
        if (result.length==0) {
          favlist.push({title:"No favorite experiences yet! Click the star to \
                       add a favorite",id:"NoGo"});
        }
        for (i in result) 
          {
          favlist.push(result[i]);
          }
        App.View.makeFavoritesList(favlist);
      }
    );
  }

  var setFav = function()
  {
    executeSelect('UPDATE experiences SET fav="'+1+'"\
                  WHERE id='+$('.reporttext').attr('id')+
                  ';',function(status){});
  }

  var searchSubstance = function(name)
  {
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
          makeFavList();
          makeTop10List();
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
    getNextExperience:  getNextExperience,
    setFav:             setFav,
    makeTop10List:      makeTop10List
  }

})(LUNGO, App);


App.Events = (function(lng, app, undefined) {
  var goToSubtance = function (substanceid) {
    var substanceobj = lng.Data.Sql.select ('substances', {id:substanceid}, function (substanceobj)
                                            {
                                              if(substanceobj != null)
                                                {
                                                  _gaq.push(['_trackPageview', '/#/substance-'+substanceobj.name+'']);
                                                  lng.dom('#welcome header .title').text(substanceobj.name);
                                                  lng.dom('a[id="'+substanceid+'"] span.bubble.count').text(substanceobj.totalexp); // How to select id?
                                                  lng.dom('.aside-item').removeClass("current"); // Make it more accurate!
                                                  lng.dom('a[id="' + substanceid + '"]').addClass("current"); // How to select id?
                                                  App.Data.getExperiencesList(substanceobj);
                                                  App.Data.getInfolinks(substanceobj);
                                                };
                                            });
  };

  lng.dom('a[href="#details-experiences"]').tap(function(event)
                                                {
                                                  $('input[type="search"]').blur();
                                                  goToSubtance(event.currentTarget.id);
                                                });

                                                lng.dom('a[href="#report"]').tap(function(event)
                                                                                 {
                                                                                   if (event.currentTarget.id != "NoGo")
                                                                                     {
                                                                                       App.Data.getExperience(event.currentTarget.id);
                                                                                       _gaq.push(['_trackPageview', '/#/experience-'+event.currentTarget.id+'']);
                                                                                     }
                                                                                 });

                                                                                 lng.dom('.search-icon').tap(function()
                                                                                                             {
                                                                                                               lng.dom('.aside-search').show();
                                                                                                               $('input[type="search"]').focus();
                                                                                                             });

                                                                                                             $('input[type="search"]').keyup(function(event)
                                                                                                                                             {
                                                                                                                                               App.Data.searchSubstance(event.target.value);
                                                                                                                                             });

                                                                                                                                             $('input[type="search"]').blur(function(event)
                                                                                                                                                                            {
                                                                                                                                                                              if ($('input[type="search"]').val()=="")
                                                                                                                                                                                {
                                                                                                                                                                                  setTimeout(function()
                                                                                                                                                                                             {
                                                                                                                                                                                               App.Data.searchSubstance("");
                                                                                                                                                                                               lng.dom('.aside-search').hide();
                                                                                                                                                                                             },800);
                                                                                                                                                                                }
                                                                                                                                                                            });

                                                                                                                                                                            $('input + a').click(function(event)
                                                                                                                                                                                                 {
                                                                                                                                                                                                   App.Data.searchSubstance("");
                                                                                                                                                                                                   lng.dom('.aside-search').hide();
                                                                                                                                                                                                 });

                                                                                                                                                                                                 lng.dom('.reporttext').swipeRight(function()
                                                                                                                                                                                                                                   {
                                                                                                                                                                                                                                     GetNext("prev");
                                                                                                                                                                                                                                   });

                                                                                                                                                                                                                                   lng.dom('.reportarrowleft').tap(function()
                                                                                                                                                                                                                                                                   {
                                                                                                                                                                                                                                                                     GetNext("prev");
                                                                                                                                                                                                                                                                   });

                                                                                                                                                                                                                                                                   lng.dom('.reporttext').swipeLeft(function()
                                                                                                                                                                                                                                                                                                    {
                                                                                                                                                                                                                                                                                                      GetNext("next");
                                                                                                                                                                                                                                                                                                    });

                                                                                                                                                                                                                                                                                                    lng.dom('.reportarrowright').tap(function()
                                                                                                                                                                                                                                                                                                                                     {
                                                                                                                                                                                                                                                                                                                                       GetNext("next");
                                                                                                                                                                                                                                                                                                                                     });

                                                                                                                                                                                                                                                                                                                                     $(document).keyup(function (e) {
                                                                                                                                                                                                                                                                                                                                       if (e.which == 37) { GetNext("prev"); }
                                                                                                                                                                                                                                                                                                                                       else if (e.which == 35) { GetNext("next"); }
                                                                                                                                                                                                                                                                                                                                     });

                                                                                                                                                                                                                                                                                                                                     function GetNext(nextprev)
                                                                                                                                                                                                                                                                                                                                     {
                                                                                                                                                                                                                                                                                                                                       App.Data.getNextExperience(
                                                                                                                                                                                                                                                                                                                                         $('.reporttext').attr('id'),
                                                                                                                                                                                                                                                                                                                                         $('.reporttext').attr('subid'),
                                                                                                                                                                                                                                                                                                                                         nextprev);
                                                                                                                                                                                                                                                                                                                                     }

                                                                                                                                                                                                                                                                                                                                     $('nav .icon.star').click(function(event)
                                                                                                                                                                                                                                                                                                                                                               {
                                                                                                                                                                                                                                                                                                                                                                 App.Data.setFav();
                                                                                                                                                                                                                                                                                                                                                                 $('nav .icon.star').css("color","#fff");
                                                                                                                                                                                                                                                                                                                                                               });

                                                                                                                                                                                                                                                                                                                                                               lng.View.Aside.show('#welcome', '#substances-aside');

                                                                                                                                                                                                                                                                                                                                                               return {
                                                                                                                                                                                                                                                                                                                                                                 goToSubtance: goToSubtance
                                                                                                                                                                                                                                                                                                                                                               }

})(LUNGO, App);

App.Services = (function(lng, app, undefined) {

    return {

    }

})(LUNGO, App);
App.View = (function(lng, app, undefined)
{
  lng.View.Template.create('favorites-tmp',
                           '<li class="selectable">\
                           <a id="{{id}}" href="#report"\
                           data-target="section">{{title}}</a></li>');

  lng.View.Template.create('top10-tmp',
                           '<li class="selectable">\
                           <a id="{{id}}" href="#details-experiences"\
                           data-target="article">\
                           <span class="bubble count">{{totalexp}}</span>\
                           {{name}}</a>\
                           </li>');


  lng.View.Template.create('substances-aside-tmp',
                           '<a id="{{id}}"\
                           href="#details-experiences" class="{{id}} aside-item"\
                           data-count="{{totalexp}}" data-target="article">\
                           {{name}}</a>');

  lng.View.Template.create('experiencelist-tmp',
                           '<li class="selectable">\
                           <a href="#report" id="{{id}}" data-target="section">\
                           <div class="onright">{{subs}}</div>\
                           {{title}}\
                           <small>{{author}} {{date}}</small></a>\
                           </li>\
  ');

  lng.View.Template.create('reportpage-tmp',
                           '{{content}}'
                           );


  var makeExperiencePage = function(data)
  {
    lng.View.Template.render('.reporttext', 'reportpage-tmp', data);
    lng.dom('#report header .title').text(data[0].title);
    lng.dom('.reporttext').attr('id',data[0].id);
    lng.dom('.reporttext').attr('subid',data[0].subid);
    if (data[0].fav == 1){
      $('nav .icon.star').css('color','#fff');
    } else {
      $('nav .icon.star').css('color','inherit');
    }
    lng.View.Scroll.refresh('reportpage');
    lng.View.Scroll.first('details-experiences');
    $('.reporttext').css('-webkit-transform',"translate3d(0px, 0px, 0px) scale(1)") // do without jquery
  };

  var makeFavoritesList = function(data)
  {
    lng.View.Template.render('#favlist', 'favorites-tmp', data); // lng.View.Scroll.append?
    lng.View.Scroll.refresh('start');
  };

  var makeTop10List = function(data)
  {
    lng.View.Template.render('#top10list', 'top10-tmp', data); // lng.View.Scroll.append?
    lng.View.Scroll.refresh('start');
  };

  var makeAsideSubstanceList = function(data)
  {
    lng.View.Template.render('#substances-aside .aside-items',
                             'substances-aside-tmp', data);
    lng.View.Scroll.refresh('substances-aside');
    for(item in data){
      lng.View.Element.count('#substances-aside a[id="' + data[item].id +
                             '"]', data[item].totalexp);
    }
  };

  var makeExperiencesList = function(data)
  {
    lng.View.Template.render('#details-experiences ul', 'experiencelist-tmp', data);
    lng.View.Scroll.refresh('details-experiences');
    LUNGO.Sugar.Growl.hide();
  };

  var scrollUp = function()
  {
    lng.View.Scroll.first('#details-experiences');
  };

  return{
    makeExperiencesList:      makeExperiencesList,
    makeFavoritesList:        makeFavoritesList,
    makeAsideSubstanceList:   makeAsideSubstanceList,
    makeExperiencePage:       makeExperiencePage,
    scrollUp:                 scrollUp,
    makeTop10List:            makeTop10List
  }

})(LUNGO, App);
