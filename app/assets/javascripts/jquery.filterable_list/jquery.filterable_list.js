(function($){

  $.PMX.FilterableList = function(el, options) {
    var base = this;

    base.$el = $(el);

    base.filters = {
      absolute: /^!=\s*/
    };

    base.defaultOptions = {
      $queryField: base.$el.find('input.query-field'),
      queryFormSelector: 'form.search-form',
      $queryForm: base.$el.find('form.search-form'),
      limit: 40,
      $localImageResults: base.$el.find('.local-image-results'),
      $remoteImageResults: base.$el.find('.remote-image-results'),
      $absoluteImageResults: base.$el.find('.absolute-image-results'),
      $templateResults: base.$el.find('.template-results'),
      $resultHeadings: base.$el.find('.search-title'),
      remoteImageResultTemplate: Handlebars.compile($('#remote_image_result_template').html()),
      localImageResultTemplate: Handlebars.compile($('#local_image_result_template').html()),
      absoluteImageResultTemplate: Handlebars.compile($('#absolute_image_result_template').html()),
      templateResultTemplate: Handlebars.compile($('#template_result_template').html()),
      loadingTemplate: Handlebars.compile($('#loading_row_template').html()),
      noResultsTemplate: Handlebars.compile($('#no_results_row_template').html()),
      sourceRepoBlurbTemplate: Handlebars.compile($('#source_blurb_row_template').html()),
      trackingAction: 'not-given',
      tagDropdownSelector: 'select.image-tag-select',
      chosenDropdownSelector: '.chosen-container',
      templateDetailsSelector: '.template-details-link'
    };

    base.init = function(){
      base.options = $.extend({}, base.defaultOptions, options);
      base.queryField = new $.PMX.QueryField(base.options.$queryField);
      base.queryField.bindEvents();
      base.searchResults = new $.PMX.SearchResults(base.resultsEndpoint(), base.options.limit);

      base.bindEvents();
    };

    base.bindEvents = function() {
      base.queryField.onChange(base.execQuery);
      base.$el.on('submit', base.options.queryFormSelector, base.handleSubmit);
      base.$el.on('click', base.options.chosenDropdownSelector, base.fetchTags);
      base.$el.on('click', base.options.templateDetailsSelector, base.handleTemplateDetailsClick);
    };

    base.handleSubmit = function(e) {
      e.preventDefault();
      base.execQuery(base.queryField.getTerm());
    };

    base.handleTemplateDetailsClick = function(e) {
      e.preventDefault();
      var $elem = $(e.target),
          url = $elem.attr('href'),
          modal = base.initTemplateDetailsDialog(url, url.replace(/\D/g,''));
      modal.showTemplateDialog();
    };

    base.initTemplateDetailsDialog = function(url, template_id) {
      var modal = new $.PMX.TemplateDetailsDialog(base.options.templateDetailsSelector, {url: url, template_id: template_id});

      modal.init();
      return modal;
    };

    base.execQuery = function(term) {
      PMX.Tracker.trackEvent('search', base.options.trackingAction, term);
      base.options.$resultHeadings.css('display', 'block');

      if (term.match(base.filters.absolute)) {
        base.loadAbsoluteResult(term);
      } else {
        base.displayLoadingIndicators();
        base.searchResults.fetch(term);
        base.searchResults.templates(base.loadTemplateResults);
        base.searchResults.localImages(base.loadLocalImageResults);
        base.searchResults.remoteImages(base.loadRemoteImageResults);
      }
    };

    base.loadAbsoluteResult = function(term) {
        base.options.$resultHeadings.first().css('display', 'none');
        base.options.$templateResults.html('');
        base.options.$remoteImageResults.html('');

        var image = { source: term.replace(base.filters.absolute, '') };
        var resultsHtml = base.options.absoluteImageResultTemplate(image);
        base.options.$localImageResults.html(resultsHtml);
    };

    base.loadRemoteImageResults = function(images, errors) {
      var resultsHtml = '';

      for (var i = 0; i < errors.length; i++) {
        $.PMX.Helpers.displayError(errors[i].summary);
      }

      $.each(images, function(i, image) {
        resultsHtml += base.options.remoteImageResultTemplate(image);
      });
      base.options.$remoteImageResults.html(resultsHtml);
      base.displayTagDropdown();
    };

    base.loadLocalImageResults = function(images) {
      var resultsHtml = '';
      $.each(images, function(i, image) {
        resultsHtml += base.options.localImageResultTemplate(image);
      });
      base.options.$localImageResults.html(resultsHtml);
      base.displayTagDropdown();
    };

    base.loadTemplateResults = function(templates) {
      var resultsHtml = '';
      if (templates && templates.length) {
        $.each(templates, function(i, template) {
          resultsHtml += base.options.templateResultTemplate(template);
        });
      } else {
        resultsHtml = base.options.noResultsTemplate();
      }
      resultsHtml += base.options.sourceRepoBlurbTemplate();
      base.options.$templateResults.html(resultsHtml);
    };

    base.displayTagDropdown = function () {
      $(base.options.tagDropdownSelector).chosen({disable_search: true});
    };

    base.fetchTags = function (e) {
      var $elem = $(e.currentTarget),
          $resultRow = $elem.closest('.search-result-item'),
          $selectBox = $resultRow.find(base.options.tagDropdownSelector),
          loaded = $selectBox.data('loaded'),
          localImage = $resultRow.data('status-label') == 'Local';
          registryId = $selectBox.data('registry-id');
      if (!loaded) {
        var tagsXhr = $.get(
          $(base.options.tagDropdownSelector).data('load-tags-endpoint'),
          { 'repo': $resultRow.data('title'), 'local_image': localImage, 'registry_id': registryId }
        );

        tagsXhr.done(function (response) {
          $selectBox.empty();
          response.forEach(function (tag) {
            $selectBox.append('<option value="' + tag + '">' + tag + '</option>');
          });
          $selectBox.data('loaded', true);
          $selectBox.trigger("chosen:updated");
        });
      }
    };

    base.displayLoadingIndicators = function() {
      var forTemplates = base.options.loadingTemplate({loading_copy: 'Finding Templates'}),
          forLocalImages = base.options.loadingTemplate({loading_copy: 'Finding Images'}),
          forRemoteImages = base.options.loadingTemplate({loading_copy: 'Searching Docker Index'});
      base.options.$templateResults.html(forTemplates);
      base.options.$localImageResults.html(forLocalImages);
      base.options.$remoteImageResults.html(forRemoteImages);
    };

    base.resultsEndpoint = function() {
      return base.options.$queryForm.attr('action') + '.json';
    };
  };


  $.fn.filterableList = function(options){
    return this.each(function(){
      (new $.PMX.FilterableList(this, options)).init();
    });
  };

})(jQuery);
