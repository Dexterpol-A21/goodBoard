//The RubricGradingService class is responsible for retrieving the rubric from the server.  The rubric
//returned will contain no evaluation information.  Applying any evaluation information is handled
//in the RubricGradingEvaluation class.

//NOTE: When rendering a rubric inline, the code will find the div matching the containingDivId property
//on the RubricGradingItem object.  It will then step up to its parent and look through all the children.
//For each child, if that element contains the class 'hideOnRubricGrade', it will set that element
//invisible until the inline rubric UI is canceled or submitted.

if ( !rubricGradingEvaluation )
{
  // This whole file is in an if block because when loaded inside a lightbox on a page that already has rubric
  // grading registered we don't want to rerun this file.
  var RubricGradingService = Class.create();
  var RubricGradingItem = Class.create();
  var RubricGradingEvaluation = Class.create();
  var RubricGradingEvaluationItem = Class.create();
  

  var rubricGradingServiceConstants =
  {
      'EVALUATION_ENTITY_PREFIX' : '_EvaulationEntityId'
  };
  
  var rubricGradingService = null;
  var rubricGradingEvaluation = null;

  RubricGradingService.prototype =
  {
    initialize : function()
    {
      this.rubricItems =
      {};
    },

    getGradingRubricUrl : function( mode, prefix, rubricCount, rubricId, isPopup, maxValue,
                                    isViewSwitch, viewOnly, displayGrades, type, rubricAssoId )
    {
      var gradingRubricUrl = '/webapps/rubric/do/course/gradeRubric?mode=' + mode + '&isPopup=' + isPopup + '&rubricCount=' + rubricCount + '&prefix=' + prefix + '&course_id=' + window.course_id;

      if ( maxValue !== null )
      {
        gradingRubricUrl = gradingRubricUrl + '&maxValue=' + maxValue;
      }

      if( rubricId !== null )
      {
        gradingRubricUrl = gradingRubricUrl + '&rubricId=' + rubricId;
      }

      if( typeof(isViewSwitch) !== 'undefined' && isViewSwitch !== null )
      {
        gradingRubricUrl = gradingRubricUrl + '&isViewSwitch=' + isViewSwitch;
      }

      if( typeof(viewOnly) !== 'undefined' && viewOnly !== null )
      {
        gradingRubricUrl = gradingRubricUrl + '&viewOnly=' + viewOnly;
      }

      if( typeof(displayGrades) !== 'undefined' && displayGrades !== null )
      {
        gradingRubricUrl = gradingRubricUrl + '&displayGrades=' + displayGrades;
      }

      if( typeof(type) !== 'undefined' && type !== null )
      {
        gradingRubricUrl = gradingRubricUrl + '&type=' + type;
      }
      
      if( rubricAssoId !== null )
      {
        gradingRubricUrl = gradingRubricUrl + '&rubricAssoId=' + rubricAssoId;
      }

      return gradingRubricUrl;
    },

    /**
     * Launches the rubric UI.
     *
     * rubricItem - The data object containing evaluation information.
     * isPopup - Whether to load the rubric UI in a popup or inline.
     * isViewSwitch - If true, then when loading the rubric UI, it will get the data
     *  from a local cache rather than the hidden field data.  It is important that this
     *  is only called after the data is persisted using view switch of true so that the
     *  cache is not empty.
     * overrideMode - Can be used to override which mode of the rubric UI is loaded.
     */
    gradeRubric : function( rubricItem, isPopup, isViewSwitch, overrideMode, rubricId )
    {
      var rgei = new RubricGradingEvaluationItem( rubricItem.getEvaluationObject() );

      var rubricAssoId = rgei.getRubricAssocicationId();
      var type = null;
      
      if ( rgei.isStudentViewingMultipleEvaluatorItem() )
      { 
        // student multiple evaluator view mode requires 'type' to be null since 'type' is used afterwards
        // to indicate to the LEARN Server to render the rubric list page.
        // the rubric list page contains html markup required by 'multiple evaluator' mode
        type = null;
      }
      else if( typeof(rubricId) !== 'undefined' && rubricId !== null )
      {
        rubricId = rubricId;
        if( rgei.getGradingRubricIndex() !== null && rgei.getRubricIndexByRubricId( rubricId ) === rgei.getGradingRubricIndex() )
        {
          type = "grading";
        }
        else
        {
          type = "secondary";
        }
      }
      else
      {
        if( rgei.getRubricCount() === 1 )
        {
          rubricId = rgei.getRubricId( 0 );

          if( rgei.getGradingRubricIndex() === null )
          {
            type = "secondary";
          }
          else
          {
            type = "grading";
          }
        }
      }

      var displayGrades = false;
      var maxValue = rubricItem.maxValue; // Unlocalized numeric string

      if ( type === "secondary" )
      {
        var indexRubric = rgei.getRubricIndexByRubricId( rubricId );
        maxValue = rgei.getRubricMaxValue( indexRubric );
      }

      if( typeof(rubricId) !== 'undefined' && rubricId !== null )
      {
        var rubricIndex = rgei.getRubricIndexByRubricId( rubricId );
        displayGrades = !rgei.getRubricGradesHidden( rubricIndex );

        //If the max value from the server is null, try to use the one
        //for the specific rubric evaluation.
        if( maxValue === null )
        {
          maxValue = rgei.getRubricMaxValue( rubricIndex );
        }
      }

      if ( isPopup )
      {
        var modeToUse = rubricItem.defaultMode;
        if( typeof(overrideMode) !== 'undefined' && overrideMode !== null )
        {
          modeToUse = overrideMode;
        }

        this.openRubricWindow( 'rubricGradingWindow', this.getGradingRubricUrl( modeToUse,
                                                                                rubricItem.prefix,
                                                                                rgei.getRubricCount(),
                                                                                rubricId,
                                                                                'true',
                                                                                maxValue,
                                                                                isViewSwitch,
                                                                                rubricItem.viewOnly,
                                                                                displayGrades,
                                                                                type, rubricAssoId ),
                                                                                925, window.screen.availHeight);
      }
      else
      {
        this.openInlineRubric( rubricItem, rubricId, this.getGradingRubricUrl( 'list',
                                                                               rubricItem.prefix,
                                                                               rgei.getRubricCount(),
                                                                               rubricId,
                                                                               'false',
                                                                               maxValue,
                                                                               isViewSwitch,
                                                                               rubricItem.viewOnly,
                                                                               displayGrades,
                                                                               type, rubricAssoId ));
      }
      
      rubricItem.markSelectedRubric( rubricId );

    },

    jsonToObject : function( json )
    {
      if ( typeof ( JSON ) === 'object' && typeof ( JSON.parse ) === 'function' )
      {
        return JSON.parse( json );
      }
      else
      { 
        /*jshint evil:true*/
        return eval( '(' + json + ')' );
      }
    },

    openRubricWindow : function( n, u, w, h )
    {
      var lpix = ( screen.width / 2 ) - ( w / 2 );
      var remote = window.open( u, n, 'width=' + w + ',height=' + h + ',resizable=yes,scrollbars=yes,status=no,top=20,left=' + lpix );
      if ( remote )
      {
        remote.focus();
        if ( !remote.opener )
        {
          remote.opener = self;
        }
      }
    },

    openInlineRubric : function( rubricItem, rubricId, url )
    {
      var container = $( rubricItem.containingDivId );
      container.addClassName( 'showOnRubricGrade' );
      container.update( page.bundle.getString( 'rubric.grading.inline.loading' ) );
      container.show();

      var arrPeerElements = container.up().childElements();
      arrPeerElements.each( function( element )
      {
        if ( element.hasClassName( 'hideOnRubricGrade' ) )
        {
          element.hide();
        }
      } );

      var bindObject = {};
      bindObject.containingDivId = rubricItem.containingDivId;
      bindObject.prefix = rubricItem.prefix;
      bindObject.rubricId = rubricId;

      new Ajax.Request( url,
      {
          method : 'get',
          onSuccess : this.openInlineRubricSuccess.bind( bindObject ),
          onFailure : this.openInlineRubricFailure.bind( bindObject ),
          onException : this.openInlineRubricFailure.bind( bindObject )
      } );

    },

    openInlineRubricSuccess : function( response )
    {
      var container = $( this.containingDivId );

      container.update( response.responseText );

      //Once inline rubric is loaded, populate fields from evaluation.
      rubricGradingEvaluation.populateFromRubricEvaluation('list', this.prefix, false, false, this.rubricId, false );

      (function() { container.down('input').focus();  }.bind(this).defer());

    },

    closeInlineRubric : function( prefix )
    {
      var rubricItem = this.rubricItems[ prefix + '_rubricItem' ];

      if ( rubricItem !== null )
      {
        if ( rubricItem.containingDivId !== null )
        {
          var container = $( rubricItem.containingDivId );

          var arrPeerElements = container.up().childElements();
          arrPeerElements.each( function( element )
          {
            if ( element.hasClassName( 'hideOnRubricGrade' ) )
            {
              element.show();
            }
            if ( element.hasClassName( 'showOnRubricGrade' ) )
            {
              element.update( '' );
            }
          } );
        }
        
        rubricItem.clearRubricSelection();
        
      }
    },

    openInlineRubricFailure : function( response )
    {
      rubricGradingService.closeInlineRubric( this.prefix );

      alert( page.bundle.getString( 'rubric.grading.inline.retrieve.error' ) );
    },

    showRubricEvalData : function( rubricItem )
    {
      alert( decodeURIComponent( rubricItem.getHiddenFieldValue() ) );
    }
  };

  //Each page may have one or more items that can be graded using a rubric.  Each of those items
  //is represented by a RubricGradingItem.  A RubricGradingItem tracks, among other things, the
  //evaluation data generated when grading that item with a rubric.
  RubricGradingItem.prototype =
  {
    initialize : function( prefix, defaultMode, maxValue, targetGradeFieldId, containingDivId, viewOnly )
    {
      this.prefix = prefix;
      this.defaultMode = defaultMode;
      this.maxValue = maxValue;
      this.targetGradeFieldId = targetGradeFieldId;
      this.containingDivId = containingDivId;
      this.viewOnly = viewOnly;
      this.cache = null;
      this.rubricGradingItemRequired = true;

      this.registerWithService();
      this.loadRubricDetailComments();
    },

    getPrefix : function()
    {
      return this.prefix;
    },

    registerWithService : function()
      {
        rubricGradingService.rubricItems[ this.prefix + '_rubricItem' ] = this;

        var evalObject = this.getEvaluationObject();
        if ( evalObject.has_multi_eval_entities === 'true' )
        {
          evalObject.evaluation_entities.each( function( evaluationEntity )
          {
            rubricGradingService.rubricItems[ this.prefix + rubricGradingServiceConstants.EVALUATION_ENTITY_PREFIX + evaluationEntity.evalEntityId +
                                              '_rubricItem' ] = this;
          }.bind( this ) );
        }
      },

    loadRubricDetailComments : function()
    {
      var rubricEvaluation = new RubricGradingEvaluationItem( this.getEvaluationObject() );
      if( !rubricEvaluation.evaluationHidden() )
      {
        this.setRubricDetailComments( rubricEvaluation );
      }
    },

    getGradeTextbox : function()
    {
      return $( this.targetGradeFieldId );
    },

    setGradeTextboxValue : function( value )
    {
      if ( this.targetGradeFieldId !== null )
      {
        Form.Element.setValue( this.getGradeTextbox(), value );
      }
    },

    refreshInlineRubricIfOpen :  function( rubricId )
    {
      // if we saved a rubric in a popup and the inline display is open, refresh the inline version with what was saved in the popup
      if ( $(this.containingDivId) && $(this.containingDivId).select('div.rubricControlContainer').first() )
      {
        rubricGradingService.gradeRubric( this, false, null, null, rubricId );
      }
    },

    getHiddenField : function()
    {
      return $( this.prefix + '_rubricEvaluation' );
    },

    getRubricDetailCommentsElement : function()
    {
      return $( this.prefix + '_rubricDetailsGradedFeedback' );
    },

    setHiddenFieldValue : function( rubricEvaluation )
    {
      var hfv = Object.toJSON( rubricEvaluation.evaluationObject );//DO NOT CALL (see method for comment) rubricEvaluation.serialize();
      hfv = encodeURIComponent( hfv );

      Form.Element.setValue( this.getHiddenField(), hfv );

      this.setRubricDetailComments( rubricEvaluation );

      // Since we are saving to the hidden field, we can clear the cache.
      this.setCache( null );
    },

    setRubricDetailComments : function( rubricEvaluation )
    {
      var rubricDetailCommentsElement = this.getRubricDetailCommentsElement();
      if( rubricDetailCommentsElement !== null )
      {
        var rubricFeedbackValue = rubricEvaluation.getRubricFeedback( 0 );
        if( rubricFeedbackValue === null )
        {
          rubricFeedbackValue = '';
        }
        //We are using the collab widget, so we need to update the graded rubric comments.
        rubricDetailCommentsElement.update( rubricFeedbackValue );
      }
    },

    getHiddenFieldValue : function()
    {
      return $F( this.getHiddenField() );

    },

    getEvaluationObject : function()
    {
      return rubricGradingService.jsonToObject( decodeURIComponent (this.getHiddenFieldValue() ) );
    },

    isCacheSet : function()
    {
      return ( this.cache !== null );
    },

    getCache : function()
    {
      return rubricGradingService.jsonToObject( decodeURIComponent( this.cache ) );
    },

    setCache : function( rubricEvaluation )
    {
      if( rubricEvaluation !== null )
      {
        var hfv = Object.toJSON( rubricEvaluation.evaluationObject );//DO NOT CALL (see method for comment) rubricEvaluation.serialize();
        hfv = encodeURIComponent( hfv );

        this.cache = hfv;
      }
      else
      {
        this.cache = null;
      }
    },

    isViewOnly : function()
    {
      return this.viewOnly;
    },

    updateCollabListGradedRubric : function( rubricId )
    {
      var collabRubricList = $('collabRubricList');

      if( collabRubricList !== null )
      {
        var arrCollabListChildren = collabRubricList.childElements();

        //Loop through each rubric and update items
        arrCollabListChildren.each( function(item){
          if( item.hasAttribute('rubricId'))
          {
            if( item.readAttribute('rubricId') === rubricId )
            {
              item.down('.collabRubricListType').update(page.bundle.getString('rubric.association.type.grading'));
            }
            else
            {
              item.down('.collabRubricListType').update('');
            }
          }
        });
      }
    },

    setRubricGradingItemRequired : function ( flag )
    {
      this.rubricGradingItemRequired = flag;
    },

    getRubricGradingItemRequired : function ()
    {
      return this.rubricGradingItemRequired;
    },
    
    markSelectedRubric : function( rubricId )
    {
      var rubrics = $$('#collabRubricList > div[rubricId]');

      if( rubrics !== null )
      {
        rubrics.each( function( rubric ) {
            
          if ( rubric.readAttribute('rubricId') === rubricId )
          {
            rubric.addClassName('selected');
          }
          else
          {
            rubric.removeClassName('selected');
            rubric.hide();
          }
            
        });
      }
    },
    
    clearRubricSelection : function()
    {
      var rubrics = $$('#collabRubricList > div[rubricId]');

      if ( rubrics )
      {
        rubrics.each( function( rubric ) {           
          rubric.removeClassName('selected');
          rubric.show();
        });
      }
    }
  };

  //RubricGradingEvaluationItem represents the evaluated contents of a rubric evaluation
  //hidden field.  It is used as a wrapper, and provides helper methods for reading and
  //manipulating the evaluation data.
  RubricGradingEvaluationItem.prototype =
  {
    initialize : function( evaluationObject )
    {
      this.evaluationObject = evaluationObject;
    },

    evaluationHidden : function()
    {
      return ( typeof( this.evaluationObject.hidden ) !== 'undefined' &&
          this.evaluationObject.hidden === 'true' );
    },

    setGradingRubricIndex : function( rubricId )
    {
      var arrRubrics = this.evaluationObject.rubrics;
      if( arrRubrics.length > 0 )
      {
        for( var i = 0; i < arrRubrics.length; i++ )
        {
          if( arrRubrics[i].id === rubricId )
          {
            this.evaluationObject.grading_rubric_index = i;
          }
        }
      }
    },
    
    isStudentViewingMultipleEvaluatorItem : function()
    {
      return this.evaluationObject.has_multi_eval_entities === 'true';
    },

    getGradingRubricIndex : function()
    { 
      if ( this.isStudentViewingMultipleEvaluatorItem() )
      {
        for( var i = 0; i < this.evaluationObject.simple_rubrics.length; i++ )
        {
          if( this.evaluationObject.simple_rubrics[i].id === this.evaluationObject.grading_rubric_id )
          {
            return i;
          }
        } 
      }
      else
      { 
        return this.evaluationObject.grading_rubric_index;
      }
    },

    getRubricIndexByRubricId : function( rubricId )
    {
      if ( this.isStudentViewingMultipleEvaluatorItem() )
      { 
        for( var k = 0; k < this.evaluationObject.simple_rubrics.length; k++ )
        {
          if( this.evaluationObject.simple_rubrics[k].id === rubricId )
          {
            return k;
          }
        }
      }
      else
      {
        var arrRubrics = this.evaluationObject.rubrics;
        if( arrRubrics.length > 0 )
        {
          for( var i = 0; i < arrRubrics.length; i++ )
          {
            if( arrRubrics[i].id === rubricId )
            {
              return i;
            }
          }
        }

        return null;
      } 
    },

    getRubrics : function()
    { 
      if ( this.isStudentViewingMultipleEvaluatorItem() )
      {
        return this.evaluationObject.simple_rubrics;
      }  
      else
      {  
        return this.evaluationObject.rubrics;
      }
    },

    getRubricCount : function()
    { 
      return this.getRubrics().length;
    },

    getRubricGradesHidden : function( rubricIndex, prefix )
    {
     if ( this.isStudentViewingMultipleEvaluatorItem()  )
     {
       var evalObject = this.evaluationObject.simple_rubrics.find( function( rubric, i ) {
         return i == rubricIndex; 
       }.bind( this ) );
       return evalObject.hidden === true;
     }
     else
     {    
      return typeof(this.evaluationObject.rubrics[ rubricIndex ].hidden) !== "undefined" &&
        this.evaluationObject.rubrics[ rubricIndex ].hidden === true;
     }
    },

    setClientChanged : function( rubricIndex )
    {
      this.evaluationObject.rubrics[rubricIndex].client_changed = "true";
    },
    
    getEvalEntityIdFromPrefix : function( prefix )
    { 
      // _5_1_EvaulationEntityId_8_1 -> _8_1
      var evalEntityId = "";
      var parsedPrefix = prefix.split( rubricGradingServiceConstants.EVALUATION_ENTITY_PREFIX );
      if ( parsedPrefix.length == 2 )
      {  
        evalEntityId = parsedPrefix[1];
      }
      return evalEntityId; 
    },
    
    findEvaluationEntity : function(prefix) {
      var evalEntityId = this.getEvalEntityIdFromPrefix( prefix );
      var foundEvalEntity = this.evaluationObject.evaluation_entities.find( function( evalEntry ) {
        return evalEntry.evalEntityId === evalEntityId;
      });
      return foundEvalEntity;
    },
    
    getRubricFeedback : function( rubricIndex, prefix )
    { 
      if ( this.isStudentViewingMultipleEvaluatorItem() )
      { 
        var evalEntryObject = this.findEvaluationEntity( prefix );
        
        // find the rubric evaluation for the grader/rubric combination
        var foundEval = evalEntryObject.rubric_evals.find( function (rubricEval, loopIndex ) {
           return loopIndex === rubricIndex; 
        } );
        return foundEval.feedback;
      }
      else
      { 
        return this.evaluationObject.rubrics[ rubricIndex ].feedback;
      }
    },

    setRubricFeedback : function( rubricIndex, feedback )
    {
      this.evaluationObject.rubrics[ rubricIndex ].feedback = feedback;
      this.setClientChanged( rubricIndex );
    },

    getRubricMaxValue : function( rubricIndex )
    {
      var result = null;

      if( !this.getRubricGradesHidden( rubricIndex ) )
      {
        if ( this.isStudentViewingMultipleEvaluatorItem() )
        {
          result = this.evaluationObject.simple_rubrics[ rubricIndex ].max_value;
        }
        else
        {
          result = this.evaluationObject.rubrics[ rubricIndex ].max_value;
        }
      }

      return result;
    },

    getRubricId : function( rubricIndex )
    { 
      
      if ( this.isStudentViewingMultipleEvaluatorItem() )
      {
        var foundRubric = this.evaluationObject.simple_rubrics.find( function (rubric, loopIndex ) {
         return rubricIndex === loopIndex;    
        } );
        // return the rubricId
        return foundRubric !== null ? foundRubric.id : null;
      }
      else
      {  
        var result = null;
        if( (typeof(this.evaluationObject.rubrics) === 'undefined') ||
            (rubricIndex > this.evaluationObject.rubrics.length ) )
        {
          alert( page.bundle.getString( 'rubric.grading.rubric.id.not.specified.error' ));
        }
        else
        {
          result = this.evaluationObject.rubrics[ rubricIndex ].id;
        }
        return result;
      }
    },

    getRubricTitle : function( rubricIndex )
    {
      if (rubricIndex >= this.evaluationObject.rubrics.length)
      {
        return "";
      }  
      
      if ( this.isStudentViewingMultipleEvaluatorItem() )
      {
        var rubric = this.evaluationObject.simple_rubrics.each( function (rubric, loopIndex ) {
         return rubricIndex == loopIndex;
        } );
        return rubric.title;
      }
      else
      {
        return this.evaluationObject.rubrics[ rubricIndex ].title;
      }
    },

    getRubricRowCount : function( rubricIndex )
    {
      return this.evaluationObject.rubrics[ rubricIndex ].rows.length;
    },

    getRubricRowId : function( rubricIndex, rowIndex )
    {
      return this.evaluationObject.rubrics[ rubricIndex ].rows[ rowIndex ].row_id;
    },

    getRubricRowSelectedCellData : function( rubricIndex, rubricRowId, prefix )
    {
      var dataObject =
      {};
      dataObject.selectedCellId = null;
      dataObject.feedback = null;
      dataObject.selectedPercent = null;

      var arrRows = null;
      if ( this.isStudentViewingMultipleEvaluatorItem() )
      {
        var foundEvalEntry = this.findEvaluationEntity( prefix );
        
        var rubricEval = foundEvalEntry.rubric_evals.find( function (rubricEval, loopIndex ) {
          return loopIndex === rubricIndex;  
        } );
        arrRows = rubricEval.rows; 
      }
      else
      {
        arrRows = this.evaluationObject.rubrics[ rubricIndex ].rows;
       
      }
      
       var rowIndex = 0;
        for ( rowIndex = 0; rowIndex < arrRows.length; rowIndex++ )
        {
          if ( arrRows[ rowIndex ].row_id === rubricRowId )
          {
            dataObject.selectedCellId = arrRows[ rowIndex ].cell_id;
            dataObject.feedback = arrRows[ rowIndex ].feedback;
            dataObject.selectedPercent = arrRows[ rowIndex ].selected_percent;
            break;
          }
        }
     

      return dataObject;
    },

    getRubricAssocicationId : function()
    {
      return this.evaluationObject.assocEntityId;
    },

    setRubricRowSelectedCellData : function( rubricIndex, rubricRowId, selectedCellId, selectedPercent, cellFeedback )
    {
      var rubricGradingEvaluationItem = this;
      rubricGradingEvaluationItem.evaluationObject.rubrics[ rubricIndex ].rows.each( function( row )
      {
        if ( row.row_id === rubricRowId )
        {
          //Mark dirty if needed.
          if( row.cell_id !== selectedCellId ||
              row.selected_percent !== selectedPercent ||
              row.feedback !== cellFeedback )
          {
            rubricGradingEvaluationItem.setClientChanged( rubricIndex );
          }

          row.cell_id = selectedCellId;
          row.selected_percent = selectedPercent;
          if ( cellFeedback !== null )
          {
            row.feedback = cellFeedback;
          }
          else
          {
            row.feedback = null;
          }
        }
      } );
    },

    getTotalValue : function( rubricIndex )
    {
      // rubricIndex will be null if there are no grading rubric, i.e., all associated rubrics are 'Used for secondary evaluation'
      return ( rubricIndex !== null ? this.evaluationObject.rubrics[ rubricIndex ].total_value : null );
    },

    setTotalValue : function( rubricIndex, value )
    {
      var dataValue = parseFloat( this.evaluationObject.rubrics[ rubricIndex ].total_value );
      var uiValue = parseFloat( value );

      //Mark dirty if needed.
      if( isNaN( dataValue ) && !isNaN( uiValue ) ||
          !isNaN( dataValue ) && isNaN( uiValue ) ||
          (( !isNaN( dataValue ) && !isNaN( uiValue) ) && dataValue !== uiValue ))
      {
        this.setClientChanged( rubricIndex );
      }

      this.evaluationObject.rubrics[ rubricIndex ].total_value = value;
    },

    getOverrideValue : function( rubricIndex, prefix )
    { 
      if ( this.isStudentViewingMultipleEvaluatorItem() )
      {
        var foundEvalEntity = this.findEvaluationEntity( prefix );
        
        var foundRubricEval = foundEvalEntity.rubric_evals.find( function (rubricEval, loopIndex ) {
          return loopIndex === rubricIndex;  
        } );
        return foundRubricEval.override_value;
      } 
      else
      {
        return this.evaluationObject.rubrics[ rubricIndex ].override_value;
      }
    },

    setOverrideValue : function( rubricIndex, value )
    {
      var dataValue = parseFloat( this.evaluationObject.rubrics[ rubricIndex ].override_value );
      var uiValue = parseFloat( value );

      //Mark dirty if needed.
      if( isNaN( dataValue ) && !isNaN( uiValue ) ||
          !isNaN( dataValue ) && isNaN( uiValue ) ||
          (( !isNaN( dataValue ) && !isNaN( uiValue)) && dataValue !== uiValue ))
      {
        this.setClientChanged( rubricIndex );
      }

      this.evaluationObject.rubrics[ rubricIndex ].override_value = value;
    },

    getCalculatedPercent : function( rubricIndex )
    {
      return this.evaluationObject.rubrics[ rubricIndex ].calculated_percent;
    },

    setCalculatedPercent : function( rubricIndex, value )
    {
      //Mark dirty if needed.
      if( this.evaluationObject.rubrics[ rubricIndex ].calculated_percent !== value )
      {
        this.setClientChanged( rubricIndex );
      }

      this.evaluationObject.rubrics[ rubricIndex ].calculated_percent = value;
    },

    serialize : function() // DO NOT CALL THIS METHOD - In IE it appears to corrupt this.evaluationObject.rubrics to make it 'not' an array
    {
      return Object.toJSON( this.evaluationObject );
    }
  };

  // The RubricGradingEvaluation class is responsible for loading the evaluation onto the grid,
  // handling the interaction with the rubric during grading, and communicating with the
  // RubricGradingService to update the hidden field for persisting.
  RubricGradingEvaluation.prototype =
  {
    initialize : function()
    {
      this.viewOnly = false;
      this.rubricGradingItem = null;
      this.activeMode = 'grid';
    },

    setViewOnly : function( viewOnly )
    {
      this.viewOnly = viewOnly;
    },

    isViewOnly : function()
    {
      return this.viewOnly;
    },

    setRubricGradingItem : function( rubricGradingItem )
    {
      this.rubricGradingItem = rubricGradingItem;
    },

    //Allows us to cache the rubricGradingItem for the duration of the evaluation.
    getRubricGradingItem : function( isPopup, prefix, context )
    {
      if( this.rubricGradingItem !== null && this.rubricGradingItem.getPrefix() === prefix )
      {
        return this.rubricGradingItem;
      }
      else
      {
        this.rubricGradingItem = this.getRubricGradingItemFromStore( isPopup, prefix, context );
        return this.rubricGradingItem;
      }
    },

    setActiveMode : function( mode )
    {
      this.activeMode = mode;
    },

    //Even though we know the mode from the server on page load, if the user switches
    //tabs in the popup, now we need to track which mode they are on afterwards.
    getActiveMode : function()
    {
      return this.activeMode;
    },

    prepareNavigation : function( rubricGradingEvalItem, currentRubricIndex )
    {
      var arrNavElements = $$('.changeRubricContainer');

      var navCssClass = "onlyOne";
      var maxRubricIndex = rubricGradingEvalItem.getRubricCount() - 1;

      if( currentRubricIndex === 0 )
      {
        if( currentRubricIndex < maxRubricIndex )
        {
          navCssClass = "first";
        }
      }
      else if( currentRubricIndex === maxRubricIndex )
      {
        navCssClass = "last";
      }
      else if ( currentRubricIndex > 0 && currentRubricIndex < maxRubricIndex )
      {
        navCssClass = "middle";
      }

      arrNavElements.each( function(item) {
        item.addClassName( navCssClass );
      });

      var arrPositionElements = $$('.rubricPopupPosition');

      arrPositionElements.each( function(item) {
        var format = page.bundle.getString('rubric.grading.list.position', parseInt(currentRubricIndex + 1, 10), parseInt(maxRubricIndex + 1, 10) );
        item.update(format);
      });
    },

    // Encapsulates the different code needed to get the hidden field data from a parent
    // window vs. inline.
    getRubricGradingItemFromStore : function( isPopup, prefix, context )
    {
      var rubricGradingItem = null;

      if ( isPopup )
      {
        if ( window.opener && !window.opener.closed )
        {
          rubricGradingService = window.opener.rubricGradingService;
          if ( rubricGradingService !== null )
          {
            rubricGradingItem = rubricGradingService.rubricItems[ prefix + '_rubricItem' ];
            if ( rubricGradingItem.isViewOnly() )
            {
              this.setViewOnly( true );
            }

            return rubricGradingItem;
          }
        }
        else
        {
          if ( context === 'retrieve' )
          {
            alert( page.bundle.getString( 'rubric.grading.popup.retrieve.error' ) );
          }
          else if ( context === 'save' )
          {
            alert( page.bundle.getString( 'rubric.grading.save.error' ) );
          }

        }
      }
      else
      {
        rubricGradingItem = rubricGradingService.rubricItems[ prefix + '_rubricItem' ];

        if( rubricGradingItem.isViewOnly() )
        {
          this.setViewOnly( true );
        }

        return rubricGradingItem;
      }
    },

    // Loads the rubric evaluation data and wraps it in a RubricGradingEvaluationItem object
    // for easier reads / writes of data from the hidden field.
    loadRubricEvaluation : function( isPopup, prefix, isViewSwitch )
    {
      var rubricGradingEvaluationItem = null;

      var rubricGradingItem = this.getRubricGradingItem( isPopup, prefix, 'retrieve' );

      if ( rubricGradingItem !== null )
      {
        if ( isViewSwitch && rubricGradingItem.isCacheSet() )
        {
          // Get the evaluation data from the cache.
          rubricGradingEvaluationItem = new RubricGradingEvaluationItem( rubricGradingItem.getCache() );
        }
        else
        {
          // Get the evaluation data from the hidden field.
          rubricGradingEvaluationItem = new RubricGradingEvaluationItem( rubricGradingItem.getEvaluationObject() );
        }
      }

      return rubricGradingEvaluationItem;
    },

    // Sets the grade field and hidden json field when rubric grading is complete. Uses cache instead
    // if a view change is requested.
    saveRubricEvaluation : function( prefix, isPopup, rubricGradingEvaluationItem, isViewSwitch )
    {
      var rubricGradingItem = this.getRubricGradingItem( isPopup, prefix, 'save' );

      var numberLocalizer = new NumberLocalizer();

      if ( rubricGradingItem !== null )
      {
        if ( isViewSwitch )
        {
          // Temporarily cache the evaluation for view change.
          rubricGradingItem.setCache( rubricGradingEvaluationItem );
        }
        else
        {
          // Persist the evaluation back to the grade page.
          rubricGradingItem.setHiddenFieldValue( rubricGradingEvaluationItem );
          var gradingRubricIndex = rubricGradingEvaluationItem.getGradingRubricIndex();

          if ( gradingRubricIndex !== null )
          {
            var targetGradeField = null;

            // The only way Total Value should be null is if the rubric type
            // was text, in which case, skip setting grade textbox by keeping targetGradeField
            // null.
            if ( rubricGradingItem.targetGradeFieldId !== null &&
                   rubricGradingEvaluationItem.getTotalValue( gradingRubricIndex ) !== null )
            {
              targetGradeField = rubricGradingItem.getGradeTextbox();
            }

            if ( targetGradeField !== null )
            {
              if ( rubricGradingEvaluationItem.getOverrideValue( gradingRubricIndex ) !== null )
              {
                rubricGradingItem.setGradeTextboxValue( rubricGradingEvaluationItem.getOverrideValue( gradingRubricIndex ) ) ;
              }
              else
              {
                rubricGradingItem.setGradeTextboxValue( numberLocalizer.formatScore( parseFloat( rubricGradingEvaluationItem
                    .getTotalValue( gradingRubricIndex ) ), true /* truncate */ ) );
              }
              if ( isPopup )
              {
                  rubricGradingItem.refreshInlineRubricIfOpen( rubricGradingEvaluationItem
                      .getRubricId( gradingRubricIndex ) );
              }
            }
          }
        }
      }
    },

    tabChanged : function( tabId, viewOnly, prefix, rubricId )
    {
      var rubricGradingEvalItem = this.loadRubricEvaluation( true, prefix, true );

      if ( rubricGradingEvalItem !== null && !rubricGradingEvalItem.evaluationHidden() )
      {
        if( !viewOnly )
        {
          if( tabId === 'gridViewTab' )
          {
            rubricGradingEvaluation.persistRubricEvaluation( prefix, true, true, rubricId );
            rubricGradingEvaluation.populateFromRubricEvaluation( 'grid', prefix, true, true, rubricId );
          }
          else
          {
            rubricGradingEvaluation.persistRubricEvaluation( prefix, true, true, rubricId );
            rubricGradingEvaluation.populateFromRubricEvaluation( 'list', prefix, true, true, rubricId );
          }
        }
        else
        {
          if( tabId === 'gridViewTab' )
          {
            rubricGradingEvaluation.populateFromRubricEvaluation( 'grid', prefix, true, true, rubricId );
          }
          else
          {
            rubricGradingEvaluation.populateFromRubricEvaluation( 'list', prefix, true, true, rubricId );
          }
        }
      }
    },

    setRubricRangeDropdownFromExistingEvaluation: function ( rowData, percentField )
    {
      // Ensure that trailing zeros or other differences in string representation don't interfere with selecting dropdown option
      var floatPercent = parseFloat( rowData.selectedPercent );
      Form.Element.setValue( percentField, ( isNaN( floatPercent ) ? rowData.selectedPercent : floatPercent ) );

      if ( percentField.options ) // This is an edit view and the percentField element is a dropdown
      {
        try
        {
          // Does the selected value actually now match?
          var floatSelectedValue = parseFloat( percentField.options[percentField.selectedIndex].value );
          if ( !isNaN( floatSelectedValue ) && !isNaN( floatPercent ) && floatPercent !== floatSelectedValue )
          {
            // LRN-145486: Selected percentages previously submitted using old versions of Learn can be slightly off.
            // Try to find the closest match.
            var absSmallestDiff = Number.MAX_VALUE, absSmallestDiffIdx, currentValue;
            for ( var i = 0, length = percentField.length; i < length; i++ )
            {
              currentValue = parseFloat( percentField.options[i].value );

              if ( isNaN( currentValue ) )
              {
                continue;
              }

              var diff = Math.abs( currentValue - floatPercent );

              if ( diff < absSmallestDiff )
              {
                absSmallestDiff = diff;
                absSmallestDiffIdx = i;
              }
            }

            if ( !isNaN( absSmallestDiffIdx ) )
            {
              percentField.options[absSmallestDiffIdx].selected = true;
            }
          }
        }
        catch ( err )
        {
          // If there are any issues with trying to find an inexact match, just continue.
        }
      }
    },

    // After the rubric loads, populates the view with evaluation information by editing
    // the DOM.
    populateFromRubricEvaluation : function( mode, prefix, isPopup, isViewSwitch, rubricId )
    {
      //Active mode allows us to track mode changes between grid and list when switching tabs
      //in the popup on the client side.  mode in this case is only the original mode to render when
      //the data first loads from a server request.
      this.setActiveMode( mode );
      
      var rubricGradingEvalItem = this.loadRubricEvaluation( isPopup, prefix, isViewSwitch );
      if ( rubricGradingEvalItem !== null )
      {
        if ( rubricGradingEvalItem.isStudentViewingMultipleEvaluatorItem() && rubricGradingEvalItem.evaluationObject.evaluation_entities.length == 1 )
        { 
          // only 1 eval so instead of a list page, show the rubric eval for the first rubric
          var evalEntityObject = rubricGradingEvalItem.evaluationObject.evaluation_entities[ 0 ];
          var evalEntityObjectId = evalEntityObject.evalEntityId;
          var fullEntityObjectPrefix = prefix + rubricGradingServiceConstants.EVALUATION_ENTITY_PREFIX + evalEntityId;
          rubricGradingEvaluation.switchVisibleRubric( fullEntityObjectPrefix, evalEntityObjectId.rubric_evals[0].id /*rubricId*/ );
          return;          
        }
        else if( typeof(rubricId) === "undefined" || rubricId === null || rubricId === '' )
        {
          this.renderAssociatedRubricList( prefix, rubricGradingEvalItem );
          if (isPopup)
          {
            page.util.resizeToContent($('content'));
          }
          return;
        }

        var currentRubricIndex = null;

        currentRubricIndex = rubricGradingEvalItem.getRubricIndexByRubricId( rubricId );

        if( isPopup )
        {
          this.prepareNavigation( rubricGradingEvalItem, currentRubricIndex );
        }

        var isViewOnly = this.isViewOnly();

        //If the evaluation information is hidden from the client, there is nothing
        //to populate.
        if( rubricGradingEvalItem.getRubricGradesHidden( currentRubricIndex ) )
        {
          if (isPopup)
          {
            page.util.resizeToContent($('content'));
          }
          return;
        }

        var totalSelectedPercent = 0.0;
        var rootElement = null;
        var arrRows = null;
        var rubricType = null;

        if ( mode === 'grid' )
        {
          rootElement = $( prefix + '_rubricGradingTable' );

          rubricType = rootElement.readAttribute( 'rubrictype' );

          arrRows = rootElement.down( 'tbody' ).childElements();
          var rowIndex = 0;
          arrRows.each( function( trTag, index )
                        {
            var rowData = rubricGradingEvalItem
            .getRubricRowSelectedCellData(currentRubricIndex, trTag.readAttribute( 'rubricrowid' ), prefix );
            if ( rowData.selectedCellId !== null )
            {
              var arrCells = trTag.childElements();
              arrCells.each( function( tdTag )
                             {
                if ( tdTag.hasAttribute( 'rubriccellid' ) && tdTag.readAttribute( 'rubriccellid' ) === rowData.selectedCellId )
                {
                  tdTag.addClassName( 'selectedCell' );

                  if( !isViewOnly )
                  {
                    tdTag.down( 'input.rubricCellRadio' ).checked = true;
                  }

                  if ( rowData.feedback !== null && rowData.feedback.length > 0 )
                  {
                    if( !isViewOnly )
                    {
                      Form.Element.setValue( tdTag.down( '.cellFeedbackField' ), rowData.feedback );
                    }
                    else
                    {
                      tdTag.down( '.cellFeedbackField' ).update( rowData.feedback );
                    }
                  }
                  else if( isViewOnly )
                  {
                    tdTag.down( '.feedback' ).hide();
                  }

                  var percentField = tdTag.down( '.selectedPercentField' );

                  // Only set drop down if the rubric is of one of the range types.
                  if ( rubricType === 'R' || rubricType === 'Q')
                  {
                    if( isViewOnly )
                    {
                      //Need to update the points received value from the hidden field json.
                      var jsonDataField = tdTag.down( '.pointPercentValuesJson' );
                      if( jsonDataField !== null )
                      {
                        var jsonData = decodeURIComponent($F( jsonDataField )).evalJSON();
                        var displayValue = jsonData[rowData.selectedPercent];
                        if ( !displayValue )
                        {
                          displayValue = jsonData[parseFloat(rowData.selectedPercent)];
                        }
                        var rangeSelectedPointsField = tdTag.down( '.rangeSelectedPoints' );
                        rangeSelectedPointsField.update( displayValue );
                        if ( displayValue !== null )
                        {
                          tdTag.down('.rangeSelectedPointsText').show();
                        }
                        else
                        {
                          tdTag.down('.rangeSelectedPointsText').hide();
                        }
                      }
                    }

                    rubricGradingEvaluation.setRubricRangeDropdownFromExistingEvaluation( rowData, percentField );
                  }

                  if (percentField && percentField !== null)
                  {
                    totalSelectedPercent += parseFloat( $F( percentField ) );
                  }
                }
                else
                {
                  tdTag.removeClassName( 'selectedCell' );
                }
                             } );
            }
                        } );
        }
        else
        {
          // populate linear control with data from evaluation item.
          rootElement = $( prefix + '_rubricGradingList' );

          rubricType = rootElement.readAttribute( 'rubrictype' );

          arrRows = rootElement.childElements();

          arrRows.each( function( rowDiv )
                        {
            if ( rowDiv.hasClassName( 'rubricGradingRow' ) )
            {
              var rowData = rubricGradingEvalItem.getRubricRowSelectedCellData( currentRubricIndex, rowDiv
                                                                                .readAttribute( 'rubricrowid' ), prefix );
              if ( rowData.selectedCellId !== null )
              {
                var arrCells = rowDiv.down( 'fieldset' ).childElements();
                arrCells.each( function( cellDiv )
                               {
                  if ( cellDiv.hasAttribute( 'rubriccellid' ) && cellDiv.readAttribute( 'rubriccellid' ) === rowData.selectedCellId )
                  {
                    cellDiv.addClassName( 'selectedCell' );
                    cellDiv.down( 'input.rubricCellRadio' ).checked = true;

                    var displayPoints = null;
                    var percentField = cellDiv.down( '.selectedPercentField' );

                    if (rubricType === 'T')
                    {
                      // no points for a text rubric
                    }
                    else if ( rubricType === 'R' || rubricType === 'Q' )
                    {
                      // Only set drop down if the rubric is of one of the range types.
                      rubricGradingEvaluation.setRubricRangeDropdownFromExistingEvaluation( rowData, percentField );

                      if( isViewOnly )
                      {
                        //Need to update the points received value from the hidden field json.
                        var jsonDataField = cellDiv.down( '.pointPercentValuesJson' );
                        if( jsonDataField !== null )
                        {
                          var jsonData = decodeURIComponent($F( jsonDataField )).evalJSON();
                          var displayValue = jsonData[rowData.selectedPercent];
                          if ( !displayValue )
                          {
                            displayValue = jsonData[parseFloat(rowData.selectedPercent)];
                          }
                          displayPoints = displayValue;
                        }
                      }
                      else
                      {
                        displayPoints = rubricGradingEvaluation.getDisplayValue( percentField );
                      }
                    }
                    else
                    {
                      var pointsField = cellDiv.down( '.selectedPointField' );
                      displayPoints = $F( pointsField );
                    }

                    var cellPercent = 0;
                    if (percentField && percentField !== null)
                    {
                      cellPercent = parseFloat( $F( percentField ) );
                    }

                    var pointsSpan = rowDiv.down( 'span.rubricRowPoints' );

                    if ( pointsSpan && pointsSpan !== null )
                    {
                      pointsSpan.update( displayPoints );
                    }

                    totalSelectedPercent += cellPercent;
                  }
                               } );

                if ( rowData.feedback !== null && rowData.feedback.length > 0 )
                {
                  if( !isViewOnly )
                  {
                    Form.Element.setValue( rowDiv.down( '.rowFeedbackField' ), rowData.feedback );
                  }
                  else
                  {
                    rowDiv.down( '.rowFeedbackField' ).update( rowData.feedback );
                  }
                }
                else if( isViewOnly )
                {
                  rowDiv.down( '.feedbackHeader' ).hide();
                }

              }
            }
          } );
        }

        if ( rubricType != 'T' )
        {
          if ( !isViewOnly )
          {
            this.updateTotals( rootElement, totalSelectedPercent );

            if( rubricGradingEvalItem.getOverrideValue( currentRubricIndex ) !== null )
            {
              var overrideField = rootElement.up('.rubricControlContainer').next( '.rubricGradingOverride' ).down( '.rubricGradingOverrideField' );
              Form.Element.setValue( overrideField, rubricGradingEvalItem.getOverrideValue( currentRubricIndex ) );
            }
          }
          else
          {
            this.updateTotals( rootElement, totalSelectedPercent, rubricGradingEvalItem.getOverrideValue( currentRubricIndex, prefix ) );
          }
        }
        
        if ( rubricGradingEvalItem.isStudentViewingMultipleEvaluatorItem() && !this.isGradedByAlreadyAddedToPage() )
        { 
          // add grader subheading
          var evalEntityId = rubricGradingEvalItem.getEvalEntityIdFromPrefix( prefix );
          var evalEntity = rubricGradingEvalItem.evaluationObject.evaluation_entities.find( function( evaluationEntity )
          {
            return evaluationEntity.evalEntityId == evalEntityId;
          } );

          var evaluatorLabel = "";
          if ( typeof opener.g_gradeWithRubricLocalizedEvaluatorLabel != 'undefined' )
          {
            evaluatorLabel = opener.g_gradeWithRubricLocalizedEvaluatorLabel;
          }
          var graderHeading = "<div class='gradedByClass'><h3>" + evaluatorLabel + ':' + "&nbsp;<span>" + evalEntity.evaluator_name + "</span></h3></div>";
          $( 'rubricDetailsDiv' ).insert(
          {
            bottom : graderHeading
          } );
        }
  
        this.populateRubricFeedback( prefix, rubricGradingEvalItem.getRubricFeedback( currentRubricIndex, prefix ), isViewOnly );
      }
      if (isPopup)
      {
        page.util.resizeToContent($('content'));
      }
    },
    
    isGradedByAlreadyAddedToPage: function()
    {
      var gradedByDiv = $( 'rubricDetailsDiv' ).down('div.gradedByClass');
      return !Object.isUndefined( gradedByDiv );
    },

    populateRubricFeedback : function( prefix, feedbackValue, isViewOnly )
    {
      var commentsVtbe = null;
      var vtbe;
      var editorName = prefix + '_rubricVtbeCommentstext';

      if(typeof(editors) !== "undefined")
      {
        commentsVtbe = editors[ editorName ];
      }

      if ( commentsVtbe  )
      {
        commentsVtbe.regenerateIframe( feedbackValue );
      }
      else
      {
        var feedbackField = $(editorName);
        if (feedbackField)
        {
          if (feedbackValue  !== null && feedbackValue.length > 0)
          {
            feedbackField.editor = this;
            feedbackField.update(feedbackValue );
          }
          else if ( isViewOnly )
          {
            // If there is no feedback, hide the feedback section of the page.
            feedbackField.up('.rubricGradingComments').up().hide();
          }
        }
      }
    },

    renderAssociatedRubricList : function( prefix, rubricGradingEvaluationItem )
    {
      //This is where code can be placed to render a list of rubrics in the popup
      //div called 'rubricList'.
      var listContainer = $('rubricList');
      
      if ( rubricGradingEvaluationItem.isStudentViewingMultipleEvaluatorItem() && rubricGradingEvaluationItem.evaluationObject.has_evaluation )
      {        
        rubricGradingEvaluationItem.evaluationObject.simple_rubrics.each( function (rubric, rubricIndex ) {
          var header = new Element('h4',{'class' : 'u_controlsWrapper'});
          header.update( rubric.title );
                                
          var iconPath = '/images/ci/ng/rubric_not_graded_li.png';
          var type = page.bundle.getString('rubric.association.type.non_grading');
          if( rubricIndex === rubricGradingEvaluationItem.evaluationObject.grading_rubric_index )
          {
            iconPath = '/images/ci/ng/rubric_graded_li.png';
            type = page.bundle.getString('rubric.association.type.grading');
          }

          var span = new Element('span', {'class' : 'helphelp', 'style' : 'font-weight:normal;'}).update( type );
          var img = new Element('img', {'class' : 'reset', 'src' : iconPath, 'alt' : type});
          span.insert({top : img});
          header.insert({bottom : span});
          
          var graderUlTag = new Element('ul');
          rubricGradingEvaluationItem.evaluationObject.evaluation_entities.each( function (evaluationEntity ) {

          if ( typeof( evaluationEntity.rubric_evals ) === 'undefined' )
          { 
            // reviewer has no evals, so go to the next reviewer
            return;
          }  
          evaluationEntity.rubric_evals.each( function( rubricEval ) {
            if ( rubricEval.id === rubric.id )
            { 
              var evaluatorLabel = "";
              if ( typeof opener.g_gradeWithRubricLocalizedEvaluatorLabel != 'undefined')
              {
                evaluatorLabel = opener.g_gradeWithRubricLocalizedEvaluatorLabel;
              }  
              var reviewerLabel = page.bundle.getString('rubric.grading.default.evaluatorTemplate', evaluatorLabel, evaluationEntity.evaluator_name );
              var liItem1 = new Element('li');
              var linkPrefix = prefix + rubricGradingServiceConstants.EVALUATION_ENTITY_PREFIX + evaluationEntity.evalEntityId;  
              var evalLink = new Element('a', {'href' : '#', 'onclick' : 'rubricGradingEvaluation.switchVisibleRubric(\''  + linkPrefix + '\',\'' + rubric.id + '\');return false;'}).update( reviewerLabel );
              liItem1.update(evalLink);
              graderUlTag.insert({bottom : liItem1} );
            }              
          });
          header.insert({bottom : graderUlTag}); 
        });
        listContainer.insert({bottom : header});  
       });  
      }
      else
      {
         rubricGradingEvaluationItem.getRubrics().each( function(item){
          var header = new Element('h4',{'class' : 'u_controlsWrapper'});
          var link = new Element('a', {'href' : '#', 'onclick' : 'rubricGradingEvaluation.switchVisibleRubric(\'' + prefix + '\',\'' + item.id + '\');return false;'}).update(item.title);
          header.insert({bottom : link});

          var rubricIndex = rubricGradingEvaluationItem.getRubricIndexByRubricId( item.id );
          var gradingRubricIndex = rubricGradingEvaluationItem.getGradingRubricIndex();

          var iconPath = '/images/ci/ng/rubric_not_graded_li.png';
          var type = page.bundle.getString('rubric.association.type.non_grading');
          if( rubricIndex === gradingRubricIndex )
          {
            iconPath = '/images/ci/ng/rubric_graded_li.png';
            type = page.bundle.getString('rubric.association.type.grading');
          }

          var span = new Element('span', {'class' : 'helphelp', 'style' : 'font-weight:normal;'}).update( type );
          var img = new Element('img', {'class' : 'reset', 'src' : iconPath, 'alt' : type});
          span.insert({top : img});
          header.insert({bottom : span});
  
          listContainer.insert({bottom : header});
        });
      } 

    },

    getDisplayValue : function( selectList )
    {
      for ( var optionIndex = 0; optionIndex < selectList.length; optionIndex++ )
      {
        if ( selectList[ optionIndex ].selected )
        {
          return selectList[ optionIndex ].innerHTML;
        }
      }
    },

    // Scrapes the DOM in order the get the grading state. Once the information is
    // updated in the RubricGradingEvaluationItem, calls saveRubricEvaluation to commit
    // the changes to the grade textbox and hidden field.
    persistRubricEvaluation : function( prefix, isPopup, isViewSwitch, rubricId )
    {
      var mode = this.getActiveMode();

      var rubricGradingItem = this.getRubricGradingItem( isPopup, prefix, 'retrieve' );

      var rubricGradingEvalItem = this.loadRubricEvaluation( isPopup, prefix, isViewSwitch );

      if ( !rubricGradingItem.isViewOnly() && rubricGradingEvalItem !== null )
      {
        var currentRubricIndex = null;

        currentRubricIndex = rubricGradingEvalItem.getRubricIndexByRubricId( rubricId );


        var rootElement = null;
        var arrRows = null;

        if ( mode === 'grid' )
        {
          rootElement = $( prefix + '_rubricGradingTable' );
          arrRows = rootElement.down( 'tbody' ).childElements();

          arrRows.each( function( trTag )
          {
            var arrCells = trTag.childElements();

            arrCells.each( function( tdTag )
            {
              if ( tdTag.hasClassName( 'selectedCell' ) )
              {
                var cellId = tdTag.readAttribute( 'rubriccellid' );
                var cellPercentField = tdTag.down( '.selectedPercentField' );
                var cellPercentValue = null;
                if ( cellPercentField && cellPercentField !== null )
                {
                  cellPercentValue = $F( cellPercentField );
                }
                var feedbackFieldValue = $F( tdTag.down( '.cellFeedbackField' ) );
                rubricGradingEvalItem.setRubricRowSelectedCellData( currentRubricIndex,
                                                                    trTag.readAttribute( 'rubricrowid' ), cellId,
                                                                    cellPercentValue, ( feedbackFieldValue === '' ) ? null : feedbackFieldValue );

              }
            } );
          } );
        }
        else
        {
          rootElement = $( prefix + '_rubricGradingList' );
          arrRows = rootElement.childElements();

          arrRows.each( function( rowDiv )
          {
            if ( rowDiv.hasClassName( 'rubricGradingRow' ) )
            {
              var feedbackFieldValue = $F( rowDiv.down( '.rowFeedbackField' ) );

              var arrCells = rowDiv.down( 'fieldset' ).childElements();
              arrCells.each( function( cellDiv )
              {
                if ( cellDiv.hasClassName( 'selectedCell' ) )
                {
                  var cellId = cellDiv.readAttribute( 'rubriccellid' );
                  var cellPercentField = cellDiv.down( '.selectedPercentField' );
                  var cellPercentValue = null;
                  if ( cellPercentField && cellPercentField !== null )
                  {
                    cellPercentValue = $F( cellPercentField );
                  }
                  rubricGradingEvalItem.setRubricRowSelectedCellData( currentRubricIndex,
                                                                      rowDiv.readAttribute( 'rubricrowid' ),
                                                                      cellId, cellPercentValue,
                                                                      ( feedbackFieldValue === '' ) ? null
                                                                          : feedbackFieldValue );
                }
              } );
            }
          } );
        }

        // Get the calculated score and override
        var rubricType = rootElement.readAttribute( 'rubricType' );

        if ( rubricType !== 'T' )
        {
          // If rubric type text, we don't need to proceed with persisting a score.
          var calculatedPointsField = rootElement.up('.rubricControlContainer').next( '.rubricGradingTotalPoints' )
              .down( '.rubricGradingCalcTotalField' );
          var calculatedPercentField = rootElement.up('.rubricControlContainer').next( '.rubricGradingTotalPoints' )
              .down( '.rubricGradingCalcPercent' );

          var overrideField = rootElement.up('.rubricControlContainer').next( '.rubricGradingOverride' ).down( '.rubricGradingOverrideField' );

          // isNumeric is defined in /javascript/validateForm.js
          if ( overrideField && $F( overrideField ) !== '' && $F( overrideField ) !== '-' && !isNumeric( $F( overrideField ) ) )
          {
            alert ( page.bundle.getString( "collab.grade.rubric.override.invalid.value" ) );
            safeFocus( overrideField );
            return false;
          }
          if ( $F( overrideField ) === '' )
          {

            rubricGradingEvalItem.setTotalValue( currentRubricIndex, $F( calculatedPointsField ) );
            rubricGradingEvalItem.setCalculatedPercent( currentRubricIndex, $F( calculatedPercentField ) );
            rubricGradingEvalItem.setOverrideValue( currentRubricIndex, null );
          }
          else
          {
            rubricGradingEvalItem.setTotalValue( currentRubricIndex, $F( calculatedPointsField ) );
            rubricGradingEvalItem.setCalculatedPercent( currentRubricIndex, $F( calculatedPercentField ) );
            rubricGradingEvalItem.setOverrideValue( currentRubricIndex, $F( overrideField ) );

          }
        }
        else
        {
          rubricGradingEvalItem.setTotalValue( currentRubricIndex, 0 );
          rubricGradingEvalItem.setCalculatedPercent( currentRubricIndex, null );
          rubricGradingEvalItem.setOverrideValue( currentRubricIndex, null );
        }

        this.persistRubricFeedback( prefix, rubricGradingEvalItem, currentRubricIndex );

        this.saveRubricEvaluation( prefix, isPopup, rubricGradingEvalItem, isViewSwitch );
      }
      return true;
    },

    throwCallBackEvent : function ( isPopup, rubricId, focusOnGradingTextBox )
    {
      if ( isPopup )
      {
        window.opener.document.fire( "bb:saveInlineRubricCallback",  { rubricId: rubricId, isPopup: isPopup, focusOnGradingTextBox: focusOnGradingTextBox } );
      }
      else
      {
        document.fire( "bb:saveInlineRubricCallback",  { rubricId: rubricId, isPopup: isPopup, focusOnGradingTextBox: focusOnGradingTextBox } );
      }
    },

    closeEvaluation : function ( prefix, isPopup )
    {
      if ( isPopup )
      { 
        var rubricGradingEvalItem = this.loadRubricEvaluation( true, prefix, true );
        if ( rubricGradingEvalItem && rubricGradingEvalItem.isStudentViewingMultipleEvaluatorItem() && rubricGradingEvalItem.evaluationObject.has_evaluation )
        {
          // return to page showing list of Rubric Evaluators if there are any evaluations against any of the rubrics
          // attached to the EvaluationEntity.
          var rubricGradingItem = this.getRubricGradingItem( true, prefix, 'retrieve' );
          rubricGradingService.gradeRubric( rubricGradingItem, true, null, null, null ); 
        }
        else
        {
          // close current popup
          self.window.close();
        }  
      }
      else
      {
        rubricGradingService.closeInlineRubric( prefix );
      }
    },

    persistenceAndSwitch : function( prefix, isPopup, isViewSwitch, rubricId, direction )
    {
      if ( rubricGradingEvaluation.persistRubricEvaluation( prefix, isPopup, isViewSwitch, rubricId ) )
      {
        rubricGradingEvaluation.switchVisibleRubric( prefix, rubricId, direction );
        if ( direction && ( direction === 'previous' || direction === 'next') )
        {
          focusOnGradingTextBox = false;
        }
        rubricGradingEvaluation.throwCallBackEvent( isPopup, rubricId, focusOnGradingTextBox );
        self.window.focus();
      }
      return false;
    },

    persistenceAndSwitchGrading : function( prefix, isPopup, isViewSwitch, rubricId )
    {
      if ( rubricGradingEvaluation.persistRubricEvaluation( prefix, isPopup, isViewSwitch, rubricId ) )
      {
        rubricGradingEvaluation.switchGradingRubric( prefix, isPopup, rubricId );
        rubricGradingEvaluation.throwCallBackEvent( isPopup, rubricId, true );
        rubricGradingEvaluation.closeEvaluation( prefix, isPopup );
      }
      return false;
    },

    persistenceAndSwitchGradingNavigation : function( prefix, isPopup, isViewSwitch, rubricId, direction )
    {
      if ( rubricGradingEvaluation.persistRubricEvaluation( prefix, isPopup, isViewSwitch, rubricId ) )
      {
        rubricGradingEvaluation.switchGradingRubric( prefix, isPopup, rubricId );
        var focusOnGradingTextBox = true;
        if ( direction && ( direction === 'previous' || direction === 'next') )
        {
          focusOnGradingTextBox = false;
        }  
        rubricGradingEvaluation.throwCallBackEvent( isPopup, rubricId, focusOnGradingTextBox );
        this.switchVisibleRubric (prefix, rubricId, direction);
        self.window.focus();
      }
    },

    persistenceOnly : function( prefix, isPopup, isViewSwitch, rubricId )
    {
      if ( rubricGradingEvaluation.persistRubricEvaluation( prefix, isPopup, isViewSwitch, rubricId ) )
      {
        rubricGradingEvaluation.throwCallBackEvent( isPopup, rubricId, true );
        rubricGradingEvaluation.closeEvaluation( prefix, isPopup );
      }
      return false;
    },

    persistRubricFeedback : function( prefix, rubricGradingEvalItem, currentRubricIndex )
    {
      if ( typeof ( finalizeEditors ) == "function" )
      {
        finalizeEditors();
      }
      var contents = null;

      if(typeof(editors) !== "undefined" && editors.length > 0)
      {
        var commentsVtbe = editors[ prefix + '_rubricVtbeCommentstext' ];

        if ( typeof(commentsVtbe) !== 'undefined' && commentsVtbe !== null )
        {
          contents = commentsVtbe.getHTML();
        }
      }
      else
      {
        var commentsTextarea = $(prefix + '_rubricVtbeCommentstext');
        if(commentsTextarea !== null)
        {
          contents = $(prefix + '_rubricVtbeCommentstext').value;
        }
      }

      if ( contents && contents !== '' )
      {
        rubricGradingEvalItem.setRubricFeedback( currentRubricIndex, contents );
      }
      else
      {
        rubricGradingEvalItem.setRubricFeedback( currentRubricIndex, null );
      }
    },

    /**
     * Switches which associated rubric is used for grading.
     *
     * prefix - prefix used to look up the RubricGradingItem object for the rubric.
     * isPopup - used when looking up the RubricGradingItem to know if it should
     *  look in the same window or a parent window.
     * rubricId - Id of new grading rubric.
     *
     */
    switchGradingRubric : function( prefix, isPopup, rubricId )
    {
      var proceed = false;
      var rubricGradingItem = this.getRubricGradingItem( isPopup, prefix, 'save' );

      if ( rubricGradingItem.getRubricGradingItemRequired() )
      {
        proceed = confirm(page.bundle.getString("rubric.grading.confirm.switch.grading.rubric"));
      }

      var rubricGradingEvaluationItem = null;

      rubricGradingEvaluationItem = new RubricGradingEvaluationItem( rubricGradingItem.getEvaluationObject() );

      if( proceed || !rubricGradingItem.getRubricGradingItemRequired())
      {
        rubricGradingEvaluationItem.setGradingRubricIndex( rubricId );
        // On secondary evaluation points or points range rubrics it is possible to have more points than the assignment
        // points, this prevents having more points than the assignment when changing from secondary evaluation to grading rubric
        var totalValueRubric = parseFloat( rubricGradingEvaluationItem.getRubrics()[ rubricGradingEvaluationItem.getGradingRubricIndex() ].total_value );
        var maxPossiblePoints = parseFloat( rubricGradingItem.maxValue );
        if ( totalValueRubric >  maxPossiblePoints && null !== totalValueRubric && null !== maxPossiblePoints )
        {
          rubricGradingEvaluationItem.setTotalValue( rubricGradingEvaluationItem.getGradingRubricIndex(), rubricGradingItem.maxValue );
        }
      }

      this.saveRubricEvaluation( prefix, isPopup, rubricGradingEvaluationItem, false );

      if( proceed || !rubricGradingItem.getRubricGradingItemRequired())
      {
        rubricGradingItem.updateCollabListGradedRubric( rubricId );
      }
    },

    switchVisibleRubric : function( prefix, rubricId, direction )
    {
      var rubricGradingItem = this.getRubricGradingItem( true, prefix, 'retrieve' );
      var rubricGradingEvaluationItem = new RubricGradingEvaluationItem( rubricGradingItem.getEvaluationObject() );

      var rubricAssoId = rubricGradingEvaluationItem.getRubricAssocicationId();
      var existingRubricIndex = rubricGradingEvaluationItem.getRubricIndexByRubricId( rubricId );
      var maxRubricIndex = rubricGradingEvaluationItem.getRubricCount() - 1;
      var newRubricId = null;

      if( typeof(direction) !== 'undefined' && direction === 'previous' )
      {
        newRubricId = rubricGradingEvaluationItem.getRubricId( existingRubricIndex - 1 );
      }
      else if( typeof(direction) !== 'undefined' && direction === 'next')
      {
        if( (existingRubricIndex + 1) > maxRubricIndex )
        {
          //Loop around to the beginning to prevent index out of bounds.
          newRubricId = rubricGradingEvaluationItem.getRubricId( 0 );
        }
        else
        {
          newRubricId = rubricGradingEvaluationItem.getRubricId( existingRubricIndex + 1 );
        }
      }
      else
      {
        //If the user clicked to use the currently visible rubric as the grading rubric, then
        //we are not changing the rubric id, we just need to trigger the reload to show
        //one of the rubric views.
        newRubricId = rubricId;
      }

      var associationCount = rubricGradingEvaluationItem.getRubricCount();
      var isGradingRubric = ( rubricGradingEvaluationItem.getGradingRubricIndex() !== null && rubricGradingEvaluationItem.getRubricIndexByRubricId( newRubricId ) === rubricGradingEvaluationItem.getGradingRubricIndex());

      var rubricIndex = rubricGradingEvaluationItem.getRubricIndexByRubricId( newRubricId );
      var displayGrades = !rubricGradingEvaluationItem.getRubricGradesHidden( rubricIndex );
      var maxValue = rubricGradingItem.maxValue;

      if( maxValue === null )
      {
        maxValue = rubricGradingEvaluationItem.getRubricMaxValue( rubricIndex );
      }

      var type = null;

      if( isGradingRubric )
      {
        type = "grading";
      }
      else
      {
        type = "secondary";
        maxValue = rubricGradingEvaluationItem.getRubricMaxValue( rubricGradingEvaluationItem.getRubricIndexByRubricId( newRubricId ) );
      }

      var rubricUrl = rubricGradingService.getGradingRubricUrl( this.getActiveMode(),
                                                                prefix,
                                                                associationCount,
                                                                newRubricId,
                                                                true,
                                                                maxValue,
                                                                false,
                                                                rubricGradingItem.viewOnly,
                                                                displayGrades,
                                                                type, rubricAssoId );
      window.location = rubricUrl;

    },

    selectCell : function( mode, objElement )
    {
      var objCell = null;
      var cellId = null;
      var arrCells = null;

      var wrappedElement = $( objElement );

      if ( mode === 'grid' )
      {
        if ( wrappedElement.hasClassName( 'rubricGradingCell' ) )
        {
          objCell = wrappedElement;
        }
        else
        {
          objCell = wrappedElement.up( 'td.rubricGradingCell' );
        }

        cellId = objCell.readAttribute( 'rubriccellid' );
        arrCells = objCell.up( 'tr.rubricGradingRow' ).childElements();
        objCell.down( 'input.rubricCellRadio' ).checked = true;

        arrCells.each( function( item )
        {

          if ( item.readAttribute( 'rubriccellid' ) === cellId )
          {
            item.addClassName( 'selectedCell' );
          }
          else
          {
            item.removeClassName( 'selectedCell' );
          }
        } );
      }
      else if ( mode === 'list' )
      {
        if ( wrappedElement.hasClassName( 'rubricGradingCell' ) )
        {
          objCell = wrappedElement;
        }
        else
        {
          objCell = wrappedElement.up( 'div.rubricGradingCell' );
        }

        cellId = objCell.readAttribute( 'rubriccellid' );
        arrCells = objCell.up( 'fieldset' ).childElements();

        arrCells.each( function( item )
        {
          if ( item.hasClassName( 'rubricGradingCell' ) )
          {
            if ( item.readAttribute( 'rubriccellid' ) === cellId )
            {
              item.addClassName( 'selectedCell' );
            }
            else
            {
              item.removeClassName( 'selectedCell' );
            }
          }
        } );
      }

      this.updatePoints( mode, objElement );
    },

    selectColumn : function( mode, columnNumber, objAnchor )
    {
      if ( mode === 'grid' )
      {
        var arrRows = $( objAnchor ).up( 'table.rubricGradingTable' ).down( 'tbody' ).childElements();

        arrRows.each( function( rowItem )
        {
          var arrCells = rowItem.childElements();

          arrCells.each( function( cellItem, index )
          {
            if ( index === columnNumber )
            {
              cellItem.addClassName( 'selectedCell' );
              cellItem.down( 'input.rubricCellRadio' ).checked = true;
            }
            else
            {
              cellItem.removeClassName( 'selectedCell' );
            }
          } );
        } );
      }

      this.updatePoints( mode, objAnchor );
    },

    toggleSetting : function( mode, setting, objCheck )
    {
      if ( mode === 'list' )
      {
        if ( setting === 'description' )
        {
          var arrDescriptions = Element.select( $( objCheck ).up( 'div.rubricGradingList' ), '.description' );

          if( objCheck.checked )
          {
            arrDescriptions.each( function( objDescription ){
              objDescription.show();
            });
          }
          else
          {
            arrDescriptions.each( function( objDescription ){
              objDescription.hide();
            });
          }
        }
        else if (setting === 'feedback' )
        {
          var arrFeedbacks = Element.select( $( objCheck ).up( 'div.rubricGradingList' ), '.feedback' );

          if( objCheck.checked )
          {
            arrFeedbacks.each( function( objFeedback ){
              objFeedback.show();
            });
          }
          else
          {
            arrFeedbacks.each( function( objFeedback ){
              objFeedback.hide();
            });
          }
        }
      }
    },

    updatePoints : function( mode, objFormElement )
    {
      var totalSelectedPercent = 0.0;
      var rootElement = null;
      var arrRows = null;
      var rubricType = null;

      if ( mode === 'grid' )
      {
        rootElement = $( objFormElement ).up( 'table.rubricGradingTable' );
        rubricType = rootElement.readAttribute( 'rubrictype' );
        if ( rubricType == 'T' )
        {
        // Text Rubrics have no points
          return;
        }

        arrRows = rootElement.down( 'tbody' ).childElements();

        arrRows.each( function( rowItem )
        {
          var arrCells = rowItem.childElements();

          arrCells.each( function( cellItem )
          {
            if ( cellItem.hasClassName( 'selectedCell' ) )
            {
              totalSelectedPercent += parseFloat( $F( cellItem.down( '.selectedPercentField' ) ) );
            }
          } );
        } );
      }
      else
      {
        rootElement = $( objFormElement ).up( 'div.rubricGradingList' );
        rubricType = rootElement.readAttribute( 'rubrictype' );
        if ( rubricType == 'T' )
        {
        // Text Rubrics have no points
          return;
        }

        arrRows = rootElement.childElements();

        arrRows.each( function( rowDiv )
        {
          if ( rowDiv.hasClassName( 'rubricGradingRow' ) )
          {
            var arrCells = rowDiv.down( 'fieldset' ).childElements();
            arrCells.each( function( cellDiv )
            {
              if ( cellDiv.hasClassName( 'selectedCell' ) )
              {
                var displayPoints = null;
                var percentField = cellDiv.down( '.selectedPercentField' );

                // Only set drop down if the rubric is of one of the range types.
                if ( rubricType === 'R' || rubricType === 'Q' )
                {
                  displayPoints = rubricGradingEvaluation.getDisplayValue( percentField );
                }
                else
                {
                  var pointsField = cellDiv.down( '.selectedPointField' );
                  displayPoints = $F( pointsField );
                }

                var cellPercent = parseFloat( $F( percentField ) );

                var pointsSpan = rowDiv.down( 'span.rubricRowPoints' );

                if ( pointsSpan !== null )
                {
                  pointsSpan.update( displayPoints );
                }

                totalSelectedPercent += cellPercent;
              }
            } );
          }
        } );
      }

      this.updateTotals( rootElement, totalSelectedPercent );
    },

    updateTotals : function( rootElement, totalSelectedPercent, overrideValue )
    {
      var numberLocalizer = new NumberLocalizer();
      var strPointsPossible = rootElement.readAttribute( 'maxvalue' );

      var pointsPossible = parseFloat( strPointsPossible );
      var pointsEarned = pointsPossible * totalSelectedPercent;

      var totalPointsSpan ;
      try
      {
        totalPointsSpan = rootElement.up('.rubricControlContainer').next( '.rubricGradingTotalPoints' ).down( '.rubricGradingCalcTotalLabel' );
      }
      catch ( err )
      {
        // if the total point span is not available, just return.
        return;
      }

      var totalString = "";
      if( arguments.length < 3 || ( arguments.length === 3 && overrideValue === null ) )
      {
        // Round the points earned so that the calculation from the percent works out neatly, and to match the value submitted using the form.
        totalString = page.bundle.getString( 'rubric.grading.raw.total', numberLocalizer.formatScore( pointsEarned, false /* round */ ), numberLocalizer.formatPoints( pointsPossible, true /* truncate */ ) );
      }
      else
      {
        // Round the points earned so that the calculation from the percent works out neatly, and to match the value submitted using the form.
        totalString = page.bundle.getString( 'rubric.grading.override.total.view.only', numberLocalizer.formatScore( pointsEarned, false /* round */ ), numberLocalizer.formatNumber( overrideValue ), numberLocalizer.formatPoints( pointsPossible, true /* truncate */ ) );
      }

      totalPointsSpan.update( totalString );

      if( arguments.length < 3)
      {
        Form.Element.setValue( rootElement.up('.rubricControlContainer').next( '.rubricGradingTotalPoints' ).down( '.rubricGradingCalcTotalField' ),
                               pointsEarned.toFixed( 5 ) );
        Form.Element.setValue( rootElement.up('.rubricControlContainer').next( '.rubricGradingTotalPoints' ).down( '.rubricGradingCalcPercent' ),
                               totalSelectedPercent );

        var overrideSpan = rootElement.up('.rubricControlContainer').next( '.rubricGradingOverride' ).down( '.rubricGradingOverrideLabel' );
        var overrideString = page.bundle.getString( 'rubric.grading.change.number.points', numberLocalizer.formatPoints( pointsPossible, true /* truncate */ ) );
        overrideSpan.update( overrideString );
      }
    }
  };

  rubricGradingService = new RubricGradingService();
  rubricGradingEvaluation = new RubricGradingEvaluation();
}
