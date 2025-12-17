var inlineGrading = {};

inlineGrading.gradingUtil = {};
inlineGrading.gradingUtil.toggleOnEvent = function( event, targetElement, slide, selector )
{
  Event.stop( event );
  
  var link;
  if ( selector )
  {
    link = Event.findElement( event, selector );
  }
  
  if ( targetElement )
  {
    if ( slide === true )
    {
      return inlineGrading.gradingUtil.slideUpDown( targetElement, link );
    }
    else
    {
      if( targetElement.id !== "resizeControls" )
      {
        targetElement.toggle();
      }
      if ( link )
      {
        if ( targetElement.visible() )
        {
          link.addClassName("expanded");
          link.setAttribute("aria-expanded","true");
        }
        else
        {
          link.removeClassName("expanded");
          link.setAttribute("aria-expanded","false");
        }
      }
      
      Event.fire(window, "bb:resize"); // fire off any listeners in case the page size changed (e.g. submit button pinning in page.js)
    }
  } 

  return false;
};

inlineGrading.gradingUtil.collapseLink = function( event )
{
  var menuElem = $( "currentAttempt_attemptList");
  if ( menuElem && menuElem.visible() && event &&
       ( !event.findElement( 'li' ) || !event.findElement( 'li' ).down( 'a' ) || !event.findElement( 'li' ).down( 'a' )
           .hasClassName( 'attemptInfo' ) ) )
  {
    // attempts menu is open and user clicked out of menu div, close menu
    menuElem.hide();
  }
  menuElem = $( "currentAttempt_gradersList");
  if ( menuElem && menuElem.visible() && event &&
       ( !event.findElement( 'li' ) || !event.findElement( 'li' ).down( 'span' ) || !event.findElement( 'li' )
           .down( 'span' ).hasClassName( 'graderName' ) ) )
  {
    // graders menu is open and user clicked out of menu div, close menu
    menuElem.hide();
  }
};

inlineGrading.gradingUtil.gradingPaneltoggleOnEvent = function( event, targetElement, slide, selector )
{
	UserDataDWRFacade.setStringTempScope( "grading_panel_open", !targetElement.visible()  );
	inlineGrading.gradingUtil.toggleOnEvent( event, targetElement, slide, selector ) ;
};

inlineGrading.gradingUtil.slideUpDown = function( targetElement, link )
{
  var opts = { duration : 0.3 };

  if ( targetElement )
  {  
    if ( targetElement.visible() )
    {
      new Effect.SlideUp( targetElement, opts);
      
      if ( link )
      {
        link.removeClassName("expanded");
        link.setAttribute("aria-expanded","false");
      }
    }
    else
    {
      new Effect.SlideDown( targetElement, opts);
      
      if ( link )
      {
        link.addClassName("expanded");
        link.setAttribute("aria-expanded","true");
      }
    }

    // fire off any listeners in case the page size changed (e.g. submit button pinning in page.js)
    // delay the firing until after slide effect above is complete
    window.setTimeout(function () {
      Event.fire(window, "bb:resize");
    }, opts.duration * 1000);

  }
  
  return false;

};

inlineGrading.toggleGradingPanel = function( event )
{
   var control = Event.findElement( event, "a" );

   $("previewerInner").toggleClassName( "expanded" );
   $("resizeControls").toggleClassName( "expanded" );
   
   inlineGrading.gradingUtil.toggleOnEvent( event, $("gradingPanel"), false, "a" );

   var toCopy = $("resizeControls").clone(true, true);

   if( !$("gradingPanel").visible() )
   {
     $("resizeControls").remove();
     $("inlineGrader").appendChild(toCopy);
     $("gradingPanelCollapse_btn").focus();
   }
   else
   {
     $("resizeControls").remove();
     $("gradingPanel").insertBefore(toCopy, $("gradingPanel").children[1]);
     $("gradingPanelCollapse_btn").focus();
   }

   inlineGrading.callDocMenu();
};

inlineGrading.toggleMaximized = function( event )
{
   var control = Event.findElement( event, "a" );
   var locationPane = $('contentPanel').up('.locationPane');
   var navigationPane = $('navigationPane');

   // TODO: too collab specific - can pull it out to a separate func in collab and pass that func in as second arg?
   var collabContainers = $$(".collabContainer"); 
   if ( collabContainers && collabContainers.size() !== 0  ) 
   {
     var collabContainer = collabContainers[0];
     if ( collabContainer.style.position == "static" )
     {
       collabContainer.style.position ="relative";
     }
     else
     {
       collabContainer.style.position ="static";
     }
   }

   control.toggleClassName('on');
   locationPane.toggleClassName('maximizedWrapper');

   //hide navigation pane when maximized, so it doesn't stick out from the bottom when tall.
   navigationPane.toggle();

   if( !document.getElementsByClassName("on")[0] )
   {
     $("maximizer_btn").setAttribute("aria-label","Maximize");
     $("maximizer_btn").setAttribute("aria-pressed","false");
   }
   else
   {
     $("maximizer_btn").setAttribute("aria-label","Restore");
     $("maximizer_btn").setAttribute("aria-pressed","true");
   }

   var previewInner = $( 'previewerInner' );

   // it shouldn't be null, but check just in case
   if ( previewInner )
   {
     if ( locationPane.hasClassName('maximizedWrapper') )
     {
       // if maximized
       previewInner.style.height = navigationPane.style.height;
     }
     else
     {
       // if not maximized
       previewInner.style.height = null;
     }
   }
   
   $("containerdiv").toggleClassName('inlineGrader maximized');
   // not doubting its existence but just in case...
   if ( $("breadcrumbs") )
   {
     $("breadcrumbs").toggle();
   }
   
   inlineGrading.callDocMenu();
};

// TODO: find a way for docMenu() to be automatically called by the menu during their initialization
inlineGrading.callDocMenu = function()
{
  var gradeSubmissionPanel = $$('.gradeSubmissionPanel');
  if ( gradeSubmissionPanel && gradeSubmissionPanel.size() !== 0 )
  {
    window.setTimeout(dockMenu,300);
  }
};

inlineGrading.showSelectedGraderFeedback = function( event, selectedGraderId, selectedGraderNum, provisionalGrade, id )
{
  inlineGrading.gradingUtil.toggleOnEvent( event, $( id + '_gradersList' ), false, 'a' );
  $( 'selectedGrader' ).update( $( 'graderName_' + selectedGraderNum ).innerHTML );
  $( 'grader_provisionalGrade' ).update( provisionalGrade );
  if ( $( 'graderRubric_' + selectedGraderNum ) )
  {
    $( 'selectedGraderRubric' ).update( $( 'graderRubric_' + selectedGraderNum ).innerHTML );
  }
  var graders = $$( '.graderSection' );
  if ( selectedGraderId != 'all_graders' )
  {
    graders.forEach( function( section ) {
      if ( section.id == selectedGraderId + '_' + selectedGraderNum )
        section.removeClassName( 'graderHidden' );
      else
        section.addClassName( 'graderHidden' );
    } );
  }
  var gradersListButton = $( id + "_gradersListButton" );
  gradersListButton.focus();
  
  // The all-graders option doesn't quite work yet and isn't in-scope yet so leaving it out.
  // If it comes into scope then start by uncommenting this and fixing the bugs.
  /*
  else
  {
    graders.forEach( function( section ) {
      section.removeClassName( 'graderHidden' );
    } );
  }
  */
  
  inlineGrading.initPreviewDivs( 'graderFeedbackPreview' );

  return false;
};

inlineGrading.MiniReceipt = Class.create();
inlineGrading.MiniReceipt.prototype =
{
  initialize : function( success, defaultMessageKey, customMessage, containerElement, top )
  {
    var message = customMessage;
    if ( !message && defaultMessageKey )
    {
      message = page.bundle.getString( defaultMessageKey );
    }
    
    if ( success === true || success === "true" )
    {
      this.show( message, containerElement, top, 0, 5000, "good" );         
    }
    else
    { 
      this.show( message, containerElement, top, 0, 5000, "bad" );   
    }
  },


  show : function( message, containerElement, top, left, time, className )
  {
    var visibleDuration = time ? time : 2000;
    var alreadyExistingReceipt = containerElement.down( "div.miniReceipt" );
    if ( alreadyExistingReceipt )
    {
      alreadyExistingReceipt.hide( );
    }

    top = top ? top : -22; // usually show receipt above
    left = left ? left : 0;
    className = className ? className : "good";
    
    var receiptHtml = '<div class="miniReceipt ' + className + '" style="display: none; top:' + top + 'px; left:'+ left + 'px" role="alert" aria-live="assertive">' + message + '</div>';
    var receiptElement = containerElement.insert( { top:receiptHtml } ).firstDescendant( );
    receiptElement.show( );
    
    setTimeout( function()
    {
      Element.fade( receiptElement, {duration:0.3, afterFinish: function() { receiptElement.remove(); } } );
    }, visibleDuration );
  }
};


inlineGrading.contentInfo = {};
inlineGrading.contentInfo.switchTabs = function( event, isInstruction )
{
	Event.stop( event );
	var instructionEl = $( "instructionId" );
	var alignmentEl = $( "alignmentPanelId" );
	if ( isInstruction )
	{
		if ( alignmentEl && alignmentEl.visible() )
		{
			alignmentEl.setAttribute("aria-expanded","false");
			$("alignmentTabPanel").removeClassName("active");
			alignmentEl.hide();
		}
		instructionEl.setAttribute("aria-expanded","true");
		$("instructionTabPanel").addClassName("active");
		instructionEl.show();
	}
	else
	{
		if ( instructionEl && instructionEl.visible() )
		{
			instructionEl.setAttribute("aria-expanded","false");
			$("instructionTabPanel").removeClassName("active");
			instructionEl.hide();
		}
		alignmentEl.setAttribute("aria-expanded","true");
		$("alignmentTabPanel").addClassName("active");
		alignmentEl.show();
	}
	return false;
};

inlineGrading.initPreviewDivs = function( previewDivClass )
{
  // loop through preview divs
  $A( document.getElementsByTagName( 'div' ) ).each( function( div )
  {
    if ( page.util.hasClassName( div, previewDivClass ) )
    {
      div = $( div );
      
      if ( div.empty() || ( div.scrollWidth <= div.clientWidth && div.scrollHeight <= div.clientHeight ) )
      {
        if ( div.clientWidth !== 0 && div.clientHeight !== 0 )
        {
          // if div is empty or no overflow remove style so it's width & height shrink to fit the div contents
          div.removeClassName( previewDivClass );
        }
      }
      else
      {
        // open lightbox with div contents when view full link is clicked
        var viewFullLink = div.next( 'input' );
        // display the button to show the content in lightbox
        viewFullLink.show();
        Event.observe( viewFullLink, 'click', function( event )
        {
          new lightbox.Lightbox(
          {
            defaultDimensions :
            {
              w : 400,
              h : 100
            },
            useDefaultDimensionsAsMinimumSize : true,
            title : div.readAttribute( 'bb:lbTitle' ),
            contents : '<div class="container">' + div.innerHTML + '</div>',
            focusOnClose : viewFullLink
          } ).open();
          Event.stop( event );
        } );
      }
    }
  } );
};
