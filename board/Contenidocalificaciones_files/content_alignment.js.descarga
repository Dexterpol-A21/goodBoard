var bbalign = {};

bbalign.deleteAlignment = function( courseId, alignmentIdIn, tableIdIn, warningMsg )
{
  if ( warningMsg )
  {
    if ( !confirm( warningMsg ) )
    {
      return;
    }
  }
  var alignmentId = alignmentIdIn;
  var tableId = tableIdIn;
  var row = $( 'align_' + alignmentId );
  if ( !row )
  {
    return false;
  }
  row.addClassName( "pendingDelete" );
  ContentAlignmentDWRFacade.deleteAlignment( courseId, alignmentId, function()
  {
    bbalign.removeRow( alignmentId, tableId );
  } );
  return false;
};

bbalign.toggleStudentVisibility = function( courseId, alignmentIdIn, event )
{
  var alignmentId = alignmentIdIn;
  var visibilityIconElement = $( 'visibilityIcon_' + alignmentId );
  Event.stop ( event );
  ContentAlignmentDWRFacade.toggleAlignmentStudentVisibility( courseId, alignmentId, function()
  {
    var receipt =$( 'visibilitycr_' + alignmentId );
    receipt.setAttribute("role", "alert");
    receipt.setAttribute("aria-live", "assertive");
    if(visibilityIconElement.readAttribute('isStudentVisible') == "true")
    {
      visibilityIconElement.writeAttribute('isStudentVisible','false');
      visibilityIconElement.writeAttribute('src','/images/ci/icons/visibility_off_li.png');
      visibilityIconElement.writeAttribute('alt',page.bundle.getString('studentVisibilityOffStr'));
      visibilityIconElement.writeAttribute('title',page.bundle.getString('studentVisibilityOffStr'));
      receipt.innerHTML = page.bundle.getString('studentVisibilityChangedOff');
    }
    else
    {
      visibilityIconElement.writeAttribute('isStudentVisible','true');
      visibilityIconElement.writeAttribute('src','/images/ci/icons/visibility_on_li.png');
      visibilityIconElement.writeAttribute('alt',page.bundle.getString('studentVisibilityOnStr'));
      visibilityIconElement.writeAttribute('title',page.bundle.getString('studentVisibilityOnStr'));
      receipt.innerHTML = page.bundle.getString('studentVisibilityChangedOn');
    }
    receipt.show();
    if ( Prototype.Browser.IE )
    {
      receipt.focus();
    }
    setTimeout( function()
    {
      receipt.fade();
    }, 1500 );
  } );
  return false;
};

bbalign.removeRow = function( alignmentId, tableId )
{
  var row = $( 'align_' + alignmentId );
  if ( !row )
  {
    return;
  }
  var lastRow = true;
  var currentRow = row.next();
  while ( currentRow && lastRow )
  {
    if ( !currentRow.hasClassName( "pendingDelete" ) )
    {
      lastRow = false;
    }
    currentRow = currentRow.next();
  }
  if ( lastRow )
  {
    currentRow = row.previous();
    while ( currentRow && lastRow )
    {
      if ( !currentRow.hasClassName( "pendingDelete" ) )
      {
        lastRow = false;
      }
      currentRow = currentRow.previous();
    }
  }
  if ( lastRow )
  {
    $( tableId ).remove();
  }
  else
  {
    if ( !Prototype.Browser.IE )
    {
      Effect.Fade( row.id );
    }
    else
    {
      // in IE we need to fade the cells
      for ( var i = 0; i < row.cells.length; ++i )
      {
        Effect.Fade( row.cells.item( i ) );
      }
    }
  }
};

bbalign.refreshPanel = function( contentIdIn, sogType, onPanelUpdatedIn, viewMode )
{
  var typeDiv = $( sogType + "_" + window.contentId );
  var onPanelUpdated = onPanelUpdatedIn;
  var type = sogType;
  var contentId = contentIdIn;
  var mode = "read-write";
  var url = "/webapps/goal/execute/contentalign/getAlignmentPanel?cmd=refresh&";
  url += "course_id=" + bbalign.courseId; // added by alignment panel tag
  url += "&content_id=" + contentId;
  url += "&sogtype=" + sogType;
  url += "&showAddButton=" + bbalign.showAddButton;
  if ( viewMode )
  {
    mode = viewMode;
  }
  url += "&mode=" + mode;

  new Ajax.Request( url,
    {
      method: 'get',
      onSuccess: function( transport )
      {
        bbalign.showNewPanelWithEffect( transport.responseText, contentId, type, onPanelUpdated );
      },
      onFailure: function()
      {
        alert( "panel could not be refreshed" );
        typeDiv.update("");
      }
    }
  );
};

bbalign.refreshRWActionsOnlyPanel = function( contentIdIn, sogType, onPanelUpdatedIn )
{
  bbalign.refreshPanel( contentIdIn, sogType, onPanelUpdatedIn, "read-write-actions-only" );
};

bbalign.refreshSelectionPanel = function( contentIdIn, sogType, onPanelUpdatedIn )
{
  bbalign.refreshPanel( contentIdIn, sogType, onPanelUpdatedIn, "selection" );
};

bbalign.showNewPanelWithEffect = function( newTableHtml, contentId, sogType, onPanelUpdated )
{
  var typeDiv = $( sogType + "_" + contentId );
  var i;

  // If we're in a lightbox, temporarily remove the aria-live attribute to avoid
  // reading redundant information
  var lightboxContent = typeDiv.up( 'div.lb-content' );
  if ( lightboxContent )
  {
    lightboxContent.writeAttribute('aria-live','');
  }

  var currentTable = $( "table_" + sogType + "_" + contentId );
  var currentStds = {};
  if ( currentTable )
  {
    var rows = currentTable.tBodies[ 0 ].rows;
    for ( i = 0; i < rows.length; ++i )
    {
      if ( $(rows[i]).visible() )
      {
        currentStds[ rows[ i ].id ] = true;
      }
    }
  }
  typeDiv.update( newTableHtml );
  var focused = false;
  var newTable = $( "table_" + sogType + "_" + contentId );
  if ( newTable )
  {
    var newRows = newTable.tBodies[ 0 ].rows;
    for ( i = 0; i < newRows.length; ++i )
    {
      if ( currentStds[ newRows[ i ].id ] )
      {
        // already there before, just show it
        newRows[ i ].style.display = '';
      }
      else
      {
        // new one, let fade it in!
        bbalign.rowAppear( newRows[ i ] );
        if ( !focused )
        {
          if ( newRows[ i ].childNodes[3] )
          {
            // standards
            newRows[ i ].childNodes[3].focus();
          }
          else if ( newRows[ i ].childNodes[2] )
          {
            // Outcomes SOGs
            newRows[ i ].childNodes[2].focus();
          }
          focused = true;
        }
      }
    }
  }

  //Invoke the legacy update method in case it is being used somewhere already.
  if ( onPanelUpdated )
  {
    onPanelUpdated();
  }

  //If we're in a lightbox add the aria-live attribute back
  (function ()
  {
    if ( lightboxContent )
    {
      lightboxContent.writeAttribute('aria-live','assertive');
    }
  }.defer());
};

bbalign.rowAppear = function( row )
{
  if ( Prototype.Browser.IE )
  {
    var i;
    row.style.display = '';
    for ( i = 0; i<row.cells.length; ++i )
    {
      row.cells[ i ].style.zoom = 1;
      Element.setOpacity( row.cells[ i ], 0 );
    }
    for ( i = 0; i < row.cells.length; ++i )
    {
      Effect.Appear( row.cells[ i ] );
    }
  }
  else
  {
    row.style.display = '';
    row.style.opacity = 0;
    Effect.Appear( row );
  }
};

bbalign.launchStdsPicker = function( courseId, contentId, alignmentListUrl, warningMsg, callback, callbackOnly )
{
  if ( warningMsg )
  {
    if ( !confirm( warningMsg ) )
    {
      return;
    }
  }

  var url = "/webapps/goal/execute/contentalign/picker?cmd=launch";
  url = url + "&course_id=" + courseId;
  url = url + "&content_id=" + contentId;
  url = url + "&showAll=false";
  if ( callback )
  {
    url = url + "&callback=" + callback;
  }
  if ( callbackOnly )
  {
    url = url + "&callbackOnly=" + callbackOnly;
  }

  if ( alignmentListUrl )
  {
    bbalign.alignmentListUrl = alignmentListUrl;
    bbalign.pickerCallback = bbalign.callAlignmentListPage;
  }
  bbalign.pickerWin = popup.launchPicker( url, "pick_lsstds", 900, 675 );
};

bbalign.alignmentListUrl = '';

bbalign.callAlignmentListPage = function( contentId )
{
  window.location = bbalign.alignmentListUrl + '&contentId=' + contentId;
};

bbalign.showLightbox = function( contentId, title, courseIdStr, returnTo, mode )
{
  if ( bbalign.lightboxTitle )
  {
    title = bbalign.lightboxTitle.replace( '{0}', title );
  }
  var onLightboxClosed = function()
  {
    if ( bbalign.pickerWin && !bbalign.pickerWin.closed )
    {
      bbalign.pickerWin.close();
    }
  };

  bbalign.courseId = courseIdStr;
  var params = {
    'cmd': 'display',
    'course_id': bbalign.courseId ,
    'content_id': contentId
  };
  if ( mode )
  {
    params.mode = mode;
  }

  //Cleanup any existing lightboxes in preparation for launching another.
  if ( bbalign.alignLightbox )
  {
    bbalign.alignLightbox.close();
  }

  bbalign.alignLightbox = new lightbox.Lightbox(
      {
        'ajax': { 'url': '/webapps/goal/execute/contentalign/getAlignmentPanel',
                  'params': params
                },
        'closeOnBodyClick':'false',
        'title': title,
        'defaultDimensions':{'w':300, 'h':200},
        'onClose': onLightboxClosed,
        'focusOnClose': returnTo
      }
      );
  bbalign.alignLightbox.open();

  bbalign.pickerCallback = function( contentId, type )
  {
    bbalign.refreshPanel( contentId, type, function() { bbalign.alignLightbox._resizeAndCenterLightbox( false ); }, mode );
  };
};

bbalign.hasSelectedRows = function( contentId, sogType )
{
  var currentTable = $( "table_" + sogType + "_" + contentId );
  if ( currentTable )
  {
    var rows = currentTable.tBodies[ 0 ].rows;
    for ( var i = 0; i < rows.length; ++i )
    {
      if ( $(rows[i]).visible() )
      {
        return true;
      }
    }
  }
  return false;
};

bbalign.showPushingLightbox = function( url, title, contentId )
{
  var params = {
    'cmd': 'display',
    'content_id': contentId
  };

  //Cleanup any existing lightboxes in preparation for launching another.
  if ( bbalign.pushingLightbox )
  {
    bbalign.pushingLightbox.close();
  }

  bbalign.pushingLightbox = new lightbox.Lightbox(
  {
    'ajax': { 'url': url,
              'params': params
            },
    'closeOnBodyClick':'false',
    'title': title
  });

  bbalign.pushingLightbox.open();
};

bbalign.showLightboxForTempContent = function( key, contentId, title, courseIdStr, returnTo, mode )
{
  if (contentId.substring(contentId.indexOf(';')+1) === 'null') 
  {
    ContentAlignmentDWRFacade.createTemporaryContent(key, 
      courseIdStr, 
      {async : false, 
       callback : function( tempContentIdStr )
          {
            contentId = 'blackboard.plugin.goal.align.impl.AlignableContent;' + tempContentIdStr;
          }
      });
  }
  
  bbalign.showLightbox( contentId, title, courseIdStr, returnTo, mode );
};
