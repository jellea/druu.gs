App.Events = (function(lng, app, undefined) {
  
  var goToSubtance = function(substanceid){
    var substanceobj = lng.Data.Sql.select
                      ('substances', {id:substanceid}, function(substanceobj){
                        console.log(substanceobj);
                        if(substanceobj != null){
      lng.dom('#welcome header .title').text(substanceobj.name);
      lng.dom('a[id="'+substanceid+'"] span.bubble.count').text(substanceobj.totalexp); // How to select id?
      lng.dom('.aside-item').removeClass("current"); // Make it more accurate!
      lng.dom('a[id="' + substanceid + '"]').addClass("current"); // How to select id?
      App.Data.getExperiencesList(substanceobj);
      App.Data.getInfolinks(substanceobj);
    };
                      });
    
  };
  lng.dom('a[href="#details-experiences"]').tap(function(event){
    goToSubtance(event.currentTarget.id);
  });
  lng.dom('a[href="#report"]').tap(function(event){
    lng.dom('#report header .title').text(event.currentTarget.innerText);
    App.Data.getExperience(event.currentTarget.id);
  });
  lng.dom('.search-icon').tap(function(){
    lng.dom('.aside-search').show();
  });
  //lng.dom('.substances-aside').swipeLeft(function(){
    //lng.View.Aside.hide('#substances-aside');
   //});

  lng.View.Aside.show('#welcome', '#substances-aside');

  return {
    goToSubtance: goToSubtance
  }

})(LUNGO, App);
