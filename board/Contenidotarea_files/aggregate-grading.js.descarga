var aggregateGrade = {};

aggregateGrade.OverrideControl = Class.create();

aggregateGrade.OverrideControl.prototype = {

  initialize : function( id, overrideUrl, revertUrl, initGrade, maxGrade )
  {
    this.overrideUrl = overrideUrl;
    this.revertUrl = revertUrl;

    this.id = id;

    this.overrideRevert = $(this.id + 'OverrideRevert');
    this.gradeInput = $(this.id);
    this.saveButton = $(this.id + 'OverrideSave');
    this.cancelButton = $(this.id + 'OverrideCancel');

    this.contentDiv = $(this.id + 'Content');
    this.container  = $(this.id + 'Container');

    this.initGrade = initGrade;
    this.maxGrade = maxGrade;

    if( this.overrideRevert )
    {
      this.overrideRevert.observe( "click", this.overrideOnClick.bindAsEventListener(this) );

      if ( this.overrideUrl )
      {
        this.gradeInput.observe( "keydown", this.gradeOnKeyDown.bindAsEventListener(this) );
        this.gradeInput.observe( "change", this.gradeOnChange.bindAsEventListener(this) );
      }

      this.saveButton.observe( "click", this.overrideSaveOnClick.bindAsEventListener(this) );
      this.cancelButton.observe( "click", this.overrideCancelOnClick.bindAsEventListener(this) );

    }
  },

  overrideOnClick : function( event )
  {
    Event.stop( event );

    // revert button is clicked
    if ( this.overrideRevert.hasClassName('revert') )
    {
      if ( this.revertUrl && confirm( page.bundle.getString( "aggregate_grade.revert.confirm" ) ) )
      {
        var params = this.revertUrl.toQueryParams();
        params[ "blackboard.platform.security.NonceUtil.nonce.ajax" ] = $( 'ajaxNonceId' ).value;

        new Ajax.Request( this.revertUrl.split("?")[0],
                          {
                              method : 'post',
                              parameters : params,
                              onSuccess : this.responseHandler.bind( this ),
                              onException : this.errorHandler.bind( this )
                          } );

      }
    }
    // override is clicked
    else
    {
      // remember grade to revert back to on cancel click before edit begins
      this.initGrade = this.gradeInput.value;

      // switch button to revert button
      if ( this.revertUrl )
      {
        this.overrideRevert.addClassName( 'revert' );
        this.overrideRevert.removeClassName( 'override' );
        this.overrideRevert.title = page.bundle.getString( "aggregate_grade.revert.title" );
      }
      else
      {
        this.overrideRevert.hide();
      }

      if ( this.overrideUrl )
      {
        this.gradeInput.readOnly = !this.gradeInput.readOnly;
      }

      this.gradeInput.focus();
      this.toggleSaveCancel( true );
      this.contentDiv.removeClassName('locked');
     }
  },

  overrideSaveOnClick : function( event )
  {
    Event.stop( event );

    var ajaxUrl = this.overrideUrl;
    var validationPassed = false;
    if ( this.gradeInput.value === "-" )
    {
      // support the old way of using '-' to revert an override grade, in addition to having a dedicated button for it
      if( !confirm( page.bundle.getString( "aggregate_grade.revert.confirm" ) ) )
      {
        return;
      }
      ajaxUrl = this.revertUrl;
      validationPassed = true;
    }
    else
    {
      var refLabel =  page.bundle.getString( "aggregate_grade.grade.input.label" );
      var gradeInputText = new inputText( { ref_label: refLabel,
                                            id: this.gradeInput.id,
                                            trim: true,
                                            valid_efloat: true,
                                            minlength: 1, maxlength:11 } );
      validationPassed = gradeInputText.check();
    }

    if( validationPassed )
    {
      var params = ajaxUrl.toQueryParams();
      params[ "blackboard.platform.security.NonceUtil.nonce.ajax" ] = $( 'ajaxNonceId' ).value;
      if( ajaxUrl !== this.revertUrl )
      {
        var thousandsep = LOCALE_SETTINGS.getString('thousand.sep.format');
        params.grade = this.gradeInput.value.replace( new RegExp(thousandsep, 'g'), '');
      }
      new Ajax.Request( ajaxUrl.split("?")[0],
                        {
                            method : "post",
                            parameters : params,
                            onSuccess : this.responseHandler.bind( this ),
                            onException : this.errorHandler.bind( this )
                        } );
    }
  },

  errorHandler : function( request )
  {
    new inlineGrading.MiniReceipt( false, "aggregate_grade.receipt.error", null, this.container, 1 );
  },

  responseHandler : function( request )
  {
    var result = request.responseText.evalJSON( true );

    if ( result.success == "true" )
    {
      this.revertUrl = result.revertUrl;
      this.overrideUrl = result.overrideUrl;

      this.reset( result.grade );
    }

    if ( this.revertUrl )
    {
      this.gradeInput.addClassName( "overridden" );
      this.gradeInput.title = page.bundle.getString( "aggregate_grade.overridden.title" );
    }
    else
    {
      this.gradeInput.removeClassName( "overridden" );
      this.gradeInput.title = "";
    }


    var cascadeUpdate = result.cascadeUpdate;
    if ( cascadeUpdate )
    {
      try
      {
        var newGrades = cascadeUpdate.evalJSON();
        Object.keys(newGrades).each( function( inputId )
        {
          if ( $(inputId) )
          {
            $(inputId).value = newGrades[inputId];
          }
        });
      }
      catch(e)
      {
        if ( console )
        {
          console.log( "Couldn't cascade update other grade inputs likely due to they are ill formatted." );
        }
      }

    }
    new inlineGrading.MiniReceipt( result.success, "aggregate_grade.receipt.success", result.receiptMessage, this.container, 1 );
  },

  overrideCancelOnClick : function( event )
  {
    Event.stop( event );
    return this.reset( this.initGrade );
  },

  reset : function( resetGrade )
  {
    // back to override button
    this.overrideRevert.removeClassName( 'revert' );
    this.overrideRevert.addClassName( 'override' );
    this.overrideRevert.title = page.bundle.getString( "aggregate_grade.override.title" );

    this.overrideRevert.show();

    // reset grade and lock it
    if ( resetGrade !== undefined )
    {
      this.gradeInput.value = resetGrade;
      this.initGrade = resetGrade;
    }
    this.gradeInput.readOnly = true;

    attemptGrading.pageMonitor.getInstance().clearInputChange( this.gradeInput.id );

    // hide save/cancel
    this.toggleSaveCancel( false );

    // set entire div to locked
    this.contentDiv.addClassName('locked');

    return false;
  },

  gradeOnKeyDown : function( event )
  {
    var key = event.keyCode || event.which;

    if ( key == Event.KEY_RETURN  )
    {
      this.overrideSaveOnClick( event );
      this.gradeInput.blur();
    }
    else if ( key == Event.KEY_ESC )
    {
      this.overrideCancelOnClick( event );
    }

  },

  gradeOnChange : function()
  {
    attemptGrading.pageMonitor.getInstance().onInputChange( this.gradeInput.id );
  },

  toggleSaveCancel : function( show )
  {
    if ( show )
    {
      if ( this.saveButton && !this.saveButton.visible() ) new Effect.SlideDown( this.saveButton, {duration:0.3});
      if ( this.cancelButton && !this.cancelButton.visible() ) new Effect.SlideDown( this.cancelButton, {duration:0.3});

      this.container.setStyle( "min-height: 70px;" );
    }
    else
    {
      if ( this.saveButton && this.saveButton.visible() ) new Effect.SlideUp( this.saveButton, {duration:0.3});
      if ( this.cancelButton && this.cancelButton.visible() ) new Effect.SlideUp( this.cancelButton, {duration:0.3});

      this.container.removeAttribute( "style" );
    }
  }

};
