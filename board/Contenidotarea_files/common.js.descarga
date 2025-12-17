var common_util;

common_util =
{
  showData : function( item )
  {
    var ul = $( item );
    var a = $( item + 'Link' );
    var itemTitle = a.innerHTML.stripTags( );
    var img = a.getElementsByTagName('img')[0];

    function applyTitle( key, title )
    {
      a.title = page.bundle.getString( key, title );
      img.alt = page.bundle.getString( key, '' );
    }

    if ( ul.style.display == 'none' )
    {
      ul.show( );
      applyTitle( 'expandCollapse.collapse.section.nocolon' );
      a.removeClassName( 'collapsed' );
      a.addClassName( 'expanded' );
    }
    else
    {
      ul.hide( );
      applyTitle( 'expandCollapse.expand.section.nocolon' );
      a.removeClassName( 'expanded' );
      a.addClassName( 'collapsed' );
    }
    return false;
  }
};