App.View = (function(lng, app, undefined)
{
  lng.View.Template.create('favorites-tmp',
                           '<li class="selectable">\
                           <a id="{{id}}" href="#report"\
                           data-target="article">{{title}}</a></li>');

  lng.View.Template.create('top10-tmp',
                           '<li class="selectable">\
                           <a id="{{id}}" href="#details-experiences"\
                           data-target="article">{{name}}</a></li>');


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
