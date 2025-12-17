var inlineGraderList = {};

inlineGraderList.keyboardAccessible = Class.create();

inlineGraderList.keyboardAccessible.prototype =
{
    initialize : function( button, list )
    {
      this.list = $( list );
      this.button = $( button );

      this.attachEventListeners();
    },

    attachEventListeners : function()
    {
      if ( this.button && this.list )
      {
        this.button.observe( "keydown", this.onKeyDownItemHeader.bind( this ) );
        this.list.select( "a" ).each( function( item )
        {
          item.observe( "keydown", this.onKeyDownItem.bind( this ) );
        }.bind( this ) );
      }

    },

    onKeyDownItemHeader : function( event )
    {
      var key = event.keyCode;

      switch ( key )
      {

        // open the list
        case Event.KEY_RETURN:

          this.list.toggle();

          Event.stop( event );
          break;

        // move focus to the first item
        case Event.KEY_DOWN:

          if ( this.list.visible() )
          {
            var firstItem = this.list.down( "a" );
            if ( firstItem )
            {
              firstItem.focus();
            }
          }

          Event.stop( event );
          break;

        // close the list
        case Event.KEY_ESC:

          if ( this.list.visible() )
          {
            this.list.hide();
          }

          Event.stop( event );
          break;
      }
    },

    onKeyDownItem : function( event )
    {
      var item = Event.findElement( event, "a" );
      var key = event.keyCode;

      switch ( key )
      {

        // move focus to the next item - do nothing if this is the last
        case Event.KEY_DOWN:

          var next = item.parentNode.next( "li" );
          if ( next )
          {
            next.getElementsByTagName( "a" )[ 0 ].focus();
          }

          Event.stop( event );
          break;

        // focus previous item or header if this is the first
        case Event.KEY_UP:

          var previous = item.parentNode.previous( "li" );
          if ( previous )
          {
            previous.getElementsByTagName( "a" )[ 0 ].focus();
          }
          else
          {
            this.button.focus();
          }

          Event.stop( event );
          break;
          
       // close the list
        case Event.KEY_ESC:

          if ( this.list.visible() )
          {
            this.list.hide();
          }

          Event.stop( event );
          break;

      }
    }
};
