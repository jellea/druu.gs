App.View = (function(lng, app, undefined)
{
  lng.View.Template.create('favorites-tmp',
                           '<li class="selectable" data-count="{{totalexp}}">\
                           <a id="{{id}}" href="#details-experiences"\
                           data-target="article">{{name}}</a></li>');

  lng.View.Template.create('substances-aside-tmp',
                           '<a id="{{id}}"\
                           href="#details-experiences" class="{{id}} aside-item"\
                           data-count="{{totalexp}}" data-target="article">\
                           {{name}}</a>');

  lng.View.Template.create('experiencelist-tmp',
                           '<li class="selectable">\
                           <a href="#report" id="{{url}}" data-target="section">\
                           <div class="onright">{{subs}}</div>\
                           {{title}}\
                           <small>{{author}} {{date}}</small></a>\
                           </li>\
  ');

  lng.View.Template.create('reportpage-tmp',
                           '{{bodycontent}}'
                           );


  var makeExperiencePage = function(data)
  {
    lng.View.Template.render('.reporttext', 'reportpage-tmp', data);
    lng.View.Scroll.refresh('reportpage');
    lng.View.Scroll.first('details-experiences');
    $('.reporttext').css('-webkit-transform',"translate3d(0px, 0px, 0px) scale(1)") // do without jquery
  };

  var makeFavoritesList = function(data)
  {
    lng.View.Template.render('#favlist', 'favorites-tmp', data); // lng.View.Scroll.append?
    lng.View.Scroll.refresh('welcome');
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
    makeExperiencesList: makeExperiencesList,
    makeFavoritesList: makeFavoritesList,
    makeAsideSubstanceList: makeAsideSubstanceList,
    makeExperiencePage: makeExperiencePage,
    scrollUp: scrollUp
  }

})(LUNGO, App);
