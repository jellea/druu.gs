App.Events = (function(lng, app, undefined)
{
  var goToSubtance = function (substanceid)
  {
    var substanceobj = lng.Data.Sql.select ('substances', {id:substanceid}, function (substanceobj)
    {
      if(substanceobj != null)
      {
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
    App.Data.getExperience(event.currentTarget.id);
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
