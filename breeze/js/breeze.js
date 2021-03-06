// 
// Breeze Framework : Version 0.0.5
// (C) Sergiy Lavryk
// jagermesh@gmail.com
// 

!function (window, undefined) {

  window.br = window.br || {};

  window.br.isNumber = function(value) {
    return (!isNaN(parseFloat(value)) && isFinite(value));
  }

  window.br.isArray = function (value) {
    return (!br.isNull(value) && (Object.prototype.toString.call(value) === '[object Array]'));
  }

  window.br.isObject = function (value) {
    return (!br.isEmpty(value) && (typeof value == 'object'));
  }

  window.br.isBoolean = function (value) {
    return (typeof value == 'boolean');
  }

  window.br.isString = function (value) {
    return (typeof value == 'string');
  }

  window.br.isNull = function(value) {
    return (
             (value === undefined) || 
             (value === null) 
           );
  }

  window.br.isEmpty = function(value) {
    return ( 
             br.isNull(value) || 
             ((typeof value.length != 'undefined') && (value.length == 0)) // Array, String
           );
  }

}(window);// 
// Breeze Framework : Version 0.0.5
// (C) Sergiy Lavryk
// jagermesh@gmail.com
// 

!function (window, undefined) {

  window.br = window.br || {};

  var _helper = {

    pack: function(data) {
      return JSON.stringify(data);
    },

    unpack: function(data) {
      try {
        return JSON.parse(data);
      } catch(ex) {
        return null;
      }
    }

  }

  var storage = function(storage) {

    var _storage = storage;
    var _this = this;

    this.get = function(key, defaultValue) {
      if (br.isArray(key)) {
        var result = {};
        for(i in key) {
          result[key[i]] = this.get(key[i]);
        }
      } else {        
        var result = _helper.unpack(_storage.getItem(key));
      }
      return br.isEmpty(result) ? (br.isEmpty(defaultValue) ? result : defaultValue) : result;
    }

    this.set = function(key, value) {
      if (br.isObject(key)) {
        for(name in key) {
          this.set(name, key[name]);
        }
      } else {
        _storage.setItem(key, _helper.pack(value));
      }
      return this;
    }

    this.inc = function(key, increment, glue) {
      var value = this.get(key);
      if (br.isNumber(value)) {
        var increment = (br.isNumber(increment) ? increment : 1);
        this.set(key, value + increment);
      } else
      if (br.isString(value)) {
        if (!br.isEmpty(increment)) {
          if (glue === undefined) {
            glue = ', ';
          }
          if (!br.isEmpty(value)) {
            value = value + glue + increment;
          } else {
            value = increment;
          }
          this.set(key, value);
        }
      } else {
        var increment = (br.isNumber(increment) ? increment : 1);
        this.set(key, increment);
      }
      return this;
    }

    this.dec = function(key, increment) {
      var increment = (br.isNumber(increment) ? increment : 1);
      var value = this.get(key);
      this.set(key, br.isNumber(value) ? (value - increment) : increment);
      return this;
    }

    this.append = function(key, newValue, limit) {
      if (!br.isEmpty(newValue)) {
        var value = this.get(key);
        if (!br.isArray(value)) {
          value = [];
        }
        if (br.isArray(newValue)) {
          for(i in newValue) {
            this.append(key, newValue[i], limit);
          }
        } else {
          if (br.isNumber(limit)) {
            while(value.length >= limit) {
              value.shift();
            }
          }
          value.push(newValue);
          this.set(key, value);
        }
      }
      return this;
    }

    this.appendUnique = function(key, newValue, limit) {
      if (!br.isEmpty(newValue)) {
        this.remove(key, newValue);
        this.append(key, newValue, limit);
      }
      return this;
    }

    this.prepend = function(key, newValue, limit) {
      if (!br.isEmpty(newValue)) {
        var value = this.get(key);
        if (!br.isArray(value)) {
          value = [];
        }
        if (br.isArray(newValue)) {
          for(i in newValue) {
            this.prepend(key, newValue[i], limit);
          }
        } else {
          if (br.isNumber(limit)) {
            while(value.length >= limit) {
              value.pop();
            }
          }
          value.unshift(newValue);
          this.set(key, value);
        }
      }
      return this;
    }

    this.prependUnique = function(key, newValue, limit) {
      if (!br.isEmpty(newValue)) {
        this.remove(key, newValue);
        this.prepend(key, newValue, limit);
      }
      return this;
    }

    this.each = function(key, fn) {
      var value = this.get(key);
      if (!br.isArray(value)) {
        value = [];
      }
      for(i=0;i<value.length;i++) {
        fn.call(this, value[i]);
      }
      return this;
    }

    function _getLast(key, defaultValue, remove) {
      var result = null;
      var value = _this.get(key, defaultValue);
      if (br.isArray(value)) {
        if (value.length > 0) {
          var result = value.pop();
          if (remove) {
            _this.set(key, value);
          }
        }
      }
      return br.isEmpty(result) ? (br.isEmpty(defaultValue) ? result : defaultValue) : result;
   }

    this.getLast = function(key, defaultValue) {
      return _getLast(key, defaultValue, false);
    }

    this.takeLast = function(key, defaultValue) {
      return _getLast(key, defaultValue, true);
    }

    function _getFirst(key, defaultValue, remove) {
      var result = null;
      var value = _this.get(key, defaultValue);
      if (br.isArray(value)) {
        if (value.length > 0) {
          var result = value.shift();
          if (remove) {
            _this.set(key, value);
          }
        }
      }
      return br.isEmpty(result) ? (br.isEmpty(defaultValue) ? result : defaultValue) : result;
    }

    this.getFirst = function(key, defaultValue) {
      return _getFirst(key, defaultValue, false);
    }

    this.takeFirst = function(key, defaultValue) {
      return _getFirst(key, defaultValue, true);
    }

    this.extend = function(key, newValue) {
      if (!br.isEmpty(newValue)) {
        var value = this.get(key);
        if (!br.isObject(value)) {
          value = {};
        }
        if (br.isObject(newValue)) {
          for(i in newValue) {
            value[i] = newValue[i];
          }
          this.set(key, value);
        }
      }
      return this;
    }

    this.not = function(key) {
      var value = this.get(key);
      if (!br.isBoolean(value)) {
        value = false;
      }
      this.set(key, !value);
      return this;
    }

    this.clear = function() {
      _storage.clear();
      return this;
    }

    this.all = function() {
      var result = {};
      for(name in _storage) {
        result[name] = this.get(name);
      }
      return result;
    }

    this.remove = function(key, arrayValue) {
      var value = this.get(key);
      if (!br.isEmpty(arrayValue) && br.isArray(value)) {
        var idx = value.indexOf(arrayValue)
        if (idx != -1) {
          value.splice(idx, 1);
        }
        this.set(key, value);
      } else {
        _storage.removeItem(key);
      }
      return this;
    }

  }

  window.br.storage = new storage(window.localStorage);
  window.br.session = new storage(window.sessionStorage);

}(window);
// 
// Breeze Framework : Version 0.0.5
// (C) Sergiy Lavryk
// jagermesh@gmail.com
// 

!function (window, undefined) {

  window.br = window.br || {};

  window.br.request = new BrRequest();

  function BrRequest() {

    this.continueRoute = true;
    this.get = function(name, defaultValue) {
      var vars = document.location.search.replace('?', '').split('&');
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == name) {
          return unescape(pair[1]);
        }
      }
      return defaultValue;
    };
    this.anchor = function(defaultValue) {
      var value = document.location.hash.replace('#', '');
      if (value.length == 0) {
        value = defaultValue;
      }
      return value;
    };
    this.route = function(path, func) {
      if (this.continueRoute) {
        var l = document.location.toString();
        l = l.replace(/[?].*/, '');
        if (l.search(path) != -1) {
          this.continueRoute = false;
          func.call();
        }
      }
      return this;
    }

  }

}(window);
// 
// Breeze Framework : Version 0.0.5
// (C) Sergiy Lavryk
// jagermesh@gmail.com
// 

!function ($, window, undefined) {

  window.br = window.br || {};

  window.br.dataSource = function (restServiceUrl, options) {
    return new BrDataSource(restServiceUrl, options);
  }

  function BrDataSource(restServiceUrl, options) {

    var $ = jQuery;
    var datasource = this;
    var ajaxRequest = null;

    this.cb = {};
    this.refreshTimeout;
    this.name = '-';
    this.options = options || {};
    this.options.restServiceUrl = restServiceUrl;
    this.options.refreshDelay = this.options.refreshDelay || 500;
    if (this.options.restServiceUrl.charAt(this.options.restServiceUrl.length-1) != '/') {
      this.options.restServiceUrl = this.options.restServiceUrl + '/';
    }

    if (this.options.offlineMode) {
      this.db = TAFFY();
      this.db.store('taffy-db-' + name);
    }

    this.before = function(event, callback) {
      this.cb['before:' + event] = this.cb['before:' + event] || new Array();
      this.cb['before:' + event][this.cb['before:' + event].length] = callback;
    }

    this.on = function(event, callback) {
      this.cb[event] = this.cb[event] || new Array();
      this.cb[event][this.cb[event].length] = callback;
    }

    this.after = function(event, callback) {
      this.cb['after:' + event] = this.cb['after:' + event] || new Array();
      this.cb['after:' + event][this.cb['after:' + event].length] = callback;
    }

    function callEvent(event, context1, context2, context3) {

      datasource.cb[event] = datasource.cb[event] || new Array();

      for (i in datasource.cb[event]) {

        switch(event) {
          case 'request':
          case 'removeAfterUpdate':
            return datasource.cb[event][i].call(datasource, context1, context2, context3);
            break;
          default:
            datasource.cb[event][i].call(datasource, context1, context2, context3);
            break;
        }

      }

    }

    this.insert = function(item, callback) {

      request = item;

      callEvent('before:insert', request);

      if (this.options.crossdomain) {
        request.crossdomain = 'put';
      }

      function returnInsert(data) {

        var result;

        if (datasource.options.crossdomain) {
          if (typeof data == 'string') {
            result = false;
            callEvent('error', 'insert', data.length > 0 ? data : 'Empty response. Was expecting new created records with ROWID.');
          } else {
            result = true;
            callEvent('insert', data);
          }
        } else {
          if (data) {
            result = true;
            callEvent('insert', data);
          } else {
            result = false;
            callEvent('error', 'insert', 'Empty response. Was expecting new created records with ROWID.');
          }
        }
        callEvent('after:insert', result, data, request);
        if (result) {
          callEvent('change', 'insert', data);
        }
        if (typeof callback == 'function') { callback.call(datasource, result, data, request); }

      }

      if (datasource.options.offlineMode) {
        datasource.db.insert(request);
        request.rowid = request.___id;
        request.syncState = 'n';
        returnInsert(request);
      } else {
        $.ajax({ type: this.options.crossdomain ? 'GET' : 'PUT'
               , data: request
               , dataType: this.options.crossdomain ? 'jsonp' : 'json'
               , url: this.options.restServiceUrl + (this.options.authToken ? '?token=' + this.options.authToken : '')
               , success: function(response) {
                   returnInsert(response);
                 }
               , error: function(jqXHR, textStatus, errorThrown) {
                   callEvent('error', 'insert', jqXHR.responseText);
                   callEvent('after:insert', false, jqXHR.responseText, request);
                   if (typeof callback == 'function') { callback.call(datasource, false, jqXHR.responseText, request); }
                 }
               });
      }

    }

    this.update = function(rowid, item, callback) {

      request = item;

      callEvent('before:update', rowid, request);

      function returnUpdate(data) {
        var operation = 'update';
        if (data) {
          var res = callEvent('removeAfterUpdate', item, data);
          if ((res != null) && res) {
            operation = 'remove';
            callEvent('remove', rowid);
          } else {
            callEvent('update', data, rowid);
          }
        }
        callEvent('after:' + operation, true, data, request);
        callEvent('change', operation, data);
        if (typeof callback == 'function') { callback.call(datasource, true, data, request); }
      }

      if (datasource.options.offlineMode) {
        datasource.db({rowid: rowid}).update(request);
        returnUpdate(request);
      } else {
        $.ajax({ type: 'POST'
               , data: request
               , dataType: 'json'
               , url: this.options.restServiceUrl + rowid + (this.options.authToken ? '?token=' + this.options.authToken : '')
               , success: function(response) {
                   returnUpdate(response);
                 }
               , error: function(jqXHR, textStatus, errorThrown) {
                   callEvent('error', 'update', jqXHR.responseText);
                   callEvent('after:update', false, jqXHR.responseText, request);
                   if (typeof callback == 'function') { callback.call(datasource, false, jqXHR.responseText, request); }
                 }
               });
      }

    }

    this.remove = function(rowid, callback) {

      request = {};

      callEvent('before:remove', null, rowid);

      function returnRemove(data) {
        callEvent('remove', rowid);
        callEvent('after:remove', true, data, request);
        callEvent('change', 'remove', data);
        if (typeof callback == 'function') { callback.call(datasource, true, data, request); }
      }

      if (datasource.options.offlineMode) {
        var data = datasource.db({rowid: rowid}).get();
        datasource.db({rowid: rowid}).remove();
        returnRemove(data);
      } else {
        $.ajax({ type: 'DELETE'
               , data: request
               , dataType: 'json'
               , url: this.options.restServiceUrl + rowid + (this.options.authToken ? '?token=' + this.options.authToken : '')
               , success: function(response) {
                   returnRemove(response);
                 }
               , error: function(jqXHR, textStatus, errorThrown) {
                   callEvent('error', 'remove', jqXHR.responseText);
                   callEvent('after:remove', false, jqXHR.responseText, request);
                   if (typeof callback == 'function') { callback.call(datasource, false, jqXHR.responseText, request); }
                 }
               });
      }

    }

    this.selectCount = function(filter, callback, options) {

      var newFilter = {};
      for(i in filter) {
        newFilter[i] = filter[i];
      }
      newFilter.__result = 'count';

      options = options || {};
      options.result = 'count';

      this.select(newFilter, callback, options);

    }

    this.selectOne = function(rowid, callback, options) {

      return this.select({ rowid: rowid }, callback, options);

    }

    this.select = function(filter, callback, options) {

      var disableEvents = options && options.disableEvents;
      var disableGridEvents = options && (options.result == 'count');

      var request = { };
      var requestRowid;

      if (typeof filter == 'function') {
        options = callback;
        callback = filter;
      } else
      if (filter) {
        for(i in filter) {
          if (i != 'rowid') {
            request[i] = filter[i];
          } else {
            requestRowid = filter[i];
          }
        }
      }

      options = options || { };

      var url = this.options.restServiceUrl;
      if (requestRowid) {
        url = url + requestRowid;
      }

      var proceed = true;

      if (!disableEvents) {
        try {
          callEvent('before:select', request, options);
        } catch(e) {
          proceed = false;
        }
      }

      if (proceed) {
        if (this.options.limit) {
          request.__limit = this.options.limit;
        }

        if (options && options.skip) {
          request.__skip = options.skip;
        }

        if (options && options.limit) {
          request.__limit = options.limit;
        }

        if (options && options.fields) {
          request.__fields = options.fields;
        }

        if (options && options.order) {
          request.__order = options.order;
        }

        function handleSuccess(data) {
          if (!disableEvents && !disableGridEvents) {
            callEvent('select', data);
            callEvent('after:select', true, data, request);
          }
          if (typeof callback == 'function') { callback.call(datasource, true, data, request); }
        }

        function handleError(error, response) {
          if (!disableEvents) {
            callEvent('error', 'select', error);
            callEvent('after:select', false, error, request);
          }
          if (typeof callback == 'function') { callback.call(datasource, false, error, request); }
        }

        if (datasource.options.offlineMode) {
          handleSuccess(datasource.db(request).get());
        } else {
          this.ajaxRequest = $.ajax({ type: 'GET'
                                    , data: request
                                    , dataType: 'json'
                                    , url: url + (this.options.authToken ? '?token=' + this.options.authToken : '')
                                    , success: function(response) {
                                        datasource.ajaxRequest = null;
                                        if (response) {
                                          handleSuccess(response);
                                        } else {
                                          handleError('', response);
                                        }
                                      }
                                    , error: function(jqXHR, textStatus, errorThrown) {
                                        datasource.ajaxRequest = null;
                                        var error = (jqXHR.statusText == 'abort') ? '' : jqXHR.responseText;
                                        handleError(error, jqXHR);
                                      }
                                    });
        }
      } else {
        
      }

    }
    this.requestInProgress = function() {
      return (this.ajaxRequest != null);
    }
    this.abortRequest = function() {
      if (this.ajaxRequest != null) {
        this.ajaxRequest.abort();
      }
    }
    this.invoke = function(method, params, callback) {

      var datasource = this;

      request = params;

      callEvent('before:' + method, request);

      if (this.options.crossdomain) {
        request.crossdomain = 'post';
      }

      $.ajax({ type: this.options.crossdomain ? 'GET' : 'POST'
             , data: request
             , dataType: this.options.crossdomain ? 'jsonp' : 'json'
             , url: this.options.restServiceUrl + method + (this.options.authToken ? '?token=' + this.options.authToken : '')
             , success: function(response) {
                 if (datasource.options.crossdomain && (typeof response == 'string')) {
                   callEvent('error', method, response);
                   callEvent('after:' + method, false, response, request);
                   if (typeof callback == 'function') { callback.call(datasource, false, response, request); }
                 } else {
                   callEvent(method, response, params);
                   callEvent('after:' + method, true, response, request);
                   if (typeof callback == 'function') { callback.call(datasource, true, response, request); }
                 }
               }
             , error: function(jqXHR, textStatus, errorThrown) {
                 callEvent('error', method, jqXHR.responseText);
                 callEvent('after:' + method, false, jqXHR.responseText, request);
                 if (typeof callback == 'function') { callback.call(datasource, false, jqXHR.responseText, request); }
               }
             });

    }

    this.fillCombo = function(selector, data, options) {
      options = options || { };
      valueField = options.valueField || 'rowid';
      nameField = options.nameField || 'name';
      hideEmptyValue = options.hideEmptyValue || false;
      emptyValue = options.emptyValue || '-- any --';
      selectedValue = options.selectedValue || null;
      $(selector).each(function() {
        var val = $(this).val();
        if (br.isEmpty(val)) {
          val = $(this).attr('data-value');
          $(this).removeAttr('data-value');
        }
        $(this).html('');
        var s = '';
        if (!hideEmptyValue) {
          s = s + '<option value="">' + emptyValue + '</option>';
        }
        for(i in data) {
          s = s + '<option value="' + data[i][valueField] + '">' + data[i][nameField] + '</option>';
        }
        $(this).html(s);
        if (!br.isEmpty(selectedValue)) {
          val = selectedValue;
        }
        if (!br.isEmpty(val)) {
          $(this).find('option[value=' + val +']').attr('selected', 'selected');
        }
      })
    }


    this.deferredSelect = function(filter, callback, msec) {
      var savedFilter = {}
      for(i in filter) {
        savedFilter[i] = filter[i];
      }
      msec = msec || this.options.refreshDelay;
      window.clearTimeout(this.refreshTimeout);
      this.refreshTimeout = window.setTimeout(function() {
        datasource.select(savedFilter, callback);
      }, msec);
    }

  }

}(jQuery, window);
// 
// Breeze Framework : Version 0.0.5
// (C) Sergiy Lavryk
// jagermesh@gmail.com
// 

!function ($, window, undefined) {

  window.br = window.br || {};

  window.br.dataGrid = function (selector, rowTemplate, dataSource, options) {
    return new BrDataGrid(selector, rowTemplate, dataSource, options);
  }

  function BrDataGrid(selector, rowTemplate, dataSource, options) {

    var $ = jQuery;
    var datagrid = this;

    this.cb = {};
    this.selector = selector;
    this.options = options || {};
    this.options.templates = this.options.templates || {};
    this.options.templates.row = rowTemplate;
    this.options.dataSource = dataSource;

    this.on = function(event, callback) {
      this.cb[event] = this.cb[event] || new Array();
      this.cb[event][this.cb[event].length] = callback;
    }

    function callEvent(event, data) {

      datagrid.cb[event] = datagrid.cb[event] || new Array();

      for (i in datagrid.cb[event]) {

        switch(event) {
          case 'insert':
          case 'update':
          case 'remove':
          case 'select':
          case 'change':
            datagrid.cb[event][i].call($(datagrid.selector), data);
            break;
          case 'renderRow':
          case 'renderHeader':
            return datagrid.cb[event][i].call($(datagrid.selector), data);
            break;
        }

      }

      switch(event) {
        case 'insert':
        case 'update':
        case 'remove':
        case 'select':
          callEvent('change', data);
          break;
      }

    }

    this.renderHeader = function(data) {
      var data = callEvent('renderHeader', data) || data;
      var template = $(datagrid.options.templates.header).html();
      var result = $(br.fetch(template, data));
      return result;
    }

    this.renderFooter = function(data) {
      var data = callEvent('renderFooter', data) || data;
      var template = $(datagrid.options.templates.footer).html();
      var result = $(br.fetch(template, data));
      return result;
    }

    this.renderRow = function(data) {
      var data = callEvent('renderRow', data) || data;
      var template = $(datagrid.options.templates.row).html();
      var result = $(br.fetch(template, data));
      result.data('data-row', data);
      return result;
    }

    this.prepend = function(row) {
      $(datagrid.selector).prepend(row);
    }

    function isGridEmpty() {
      return ($(datagrid.selector).find('[data-rowid]').length == 0);
    }

    function checkForEmptyGrid() {
      if (isGridEmpty()) {
        $(datagrid.selector).html($(datagrid.options.templates.noData).html());
        callEvent('nodata');
      }
    }

    if (this.options.dataSource) {

      this.options.dataSource.before('select', function() {
        $(datagrid.selector).html('');
        $(datagrid.selector).addClass('progress-big');
      });

      this.options.dataSource.after('select', function() {
        $(datagrid.selector).removeClass('progress-big');
      });

      this.options.dataSource.on('select', function(data) {
        $(datagrid.selector).removeClass('progress-big');
        datagrid.render(data);
      });

      this.options.dataSource.after('insert', function(success, response) {
        if (success) {
          if (isGridEmpty()) {
            $(datagrid.selector).html(''); // to remove No-Data box
          }
          datagrid.prepend(datagrid.renderRow(response));
        }
      });

      this.options.dataSource.on('update', function(data) {
        var row = $(datagrid.selector).find('[data-rowid=' + data.rowid + ']');
        if (row.length == 1) {
          var ctrl = datagrid.renderRow(data);
          var s = ctrl.html();
          ctrl.remove();
          if (s.length > 0) {
            $(row[0]).html(s).hide().fadeIn();
            callEvent('update');
          } else {
            datagrid.options.dataSource.select();
          }
        } else {
          datagrid.options.dataSource.select();
        }
      });

      this.options.dataSource.on('remove', function(rowid) {
        var row = $(datagrid.selector).find('[data-rowid=' + rowid + ']');
        if (row.length > 0) {
          if (br.isTouchScreen()) {
            row.remove();
            checkForEmptyGrid();
            callEvent('remove');
          } else {
            row.fadeOut(function() {
              $(this).remove();
              checkForEmptyGrid();
              callEvent('remove');
            });
          }
        } else {
          datagrid.options.dataSource.select();
        }
      });

      if (this.options.deleteSelector) {
        $(datagrid.selector).on('click', this.options.deleteSelector, function() {
          var row = $(this).closest('[data-rowid]');
          if (row.length > 0) {
            var rowid = $(row).attr('data-rowid');
            if (!br.isEmpty(rowid)) {
              br.confirm( 'Delete confirmation'
                        , 'Are you sure you want delete this record?'
                        , function() {
                            datagrid.options.dataSource.remove(rowid);
                          }
                        );
            }
          }
        });
      }

    }

    this.render = function(data) {
      if (data) {
        if (datagrid.options.freeGrid) {
          if (data.headers) {
            for (i in data.headers) {
              if (data.headers[i]) {
                $(datagrid.options.headersSelector).append(datagrid.renderHeader(data.headers[i]));
              }
            }
          }
          if (data.footers) {
            for (i in data.footers) {
              if (data.footers[i]) {
                $(datagrid.options.footersSelector).append(datagrid.renderFooter(data.headers[i]));
              }
            }
          }
          $(datagrid.selector).html('');
          if (data.rows) {
            if (data.rows.length == 0) {
              $(datagrid.selector).html($(this.options.templates.noData).html());
            } else {
              for (i in data.rows) {
                if (data.rows[i]) {
                  if (data.rows[i].row) {
                    $(datagrid.selector).append(datagrid.renderRow(data.rows[i].row));
                  }
                  if (data.rows[i].header) {
                    $(datagrid.selector).append(datagrid.renderHeader(data.rows[i].header));
                  }
                  if (data.rows[i].footer) {
                    $(datagrid.selector).append(datagrid.renderFooter(data.rows[i].footer));
                  }
                }
              }
            }
          } else {
            $(datagrid.selector).html($(this.options.templates.noData).html());
          }
        } else {
          $(datagrid.selector).html('');
          if (data && (data.length > 0)) {
            for (i in data) {
              if (data[i]) {
                $(datagrid.selector).append(datagrid.renderRow(data[i]));
              }
            }
          } else {
            $(datagrid.selector).html($(this.options.templates.noData).html());
          }
        }
      } else {
        $(datagrid.selector).html($(this.options.templates.noData).html());
      }
      callEvent('change', data);
    }

  }

}(jQuery, window);
// 
// Breeze Framework : Version 0.0.5
// (C) Sergiy Lavryk
// jagermesh@gmail.com
// 

!function ($, window, undefined) {

  window.br = window.br || {};

  window.br.dataCombo = function (selector, dataSource, options) {
    return new BrDataCombo(selector, dataSource, options);
  }

  function BrDataCombo(selector, dataSource, options) {

    var $ = jQuery;
    var _this = this;

    _this.selector = selector;
    _this.dataSource = dataSource;
    _this.options = options;
    _this.fields = _this.options.fields || {};
    _this.saveSelection = _this.options.saveSelection || false;

    _this.cb = {};

    _this.on = function(event, callback) {
      _this.cb[event] = this.cb[event] || new Array();
      _this.cb[event][this.cb[event].length] = callback;
    }

    function callEvent(event, data) {
      _this.cb[event] = _this.cb[event] || new Array();
      for (i in _this.cb[event]) {
        _this.cb[event][i].call($(_this.selector), data);
      }
    }

    function storageTag(c) {

      return document.location.toString() + ':filter-value:' + $(c).attr('name');
    }

    function render(data) {
      var options = _this.options;
      if (_this.saveSelection) {
        options.selectedValue = br.storage.get(storageTag(_this.selector));
      }
      _this.dataSource.fillCombo(_this.selector, data, options);
      callEvent('load', data);
    }

    _this.reload = function(callback) {
      _this.dataSource.select({}, function(result) {
        if (result) {
          if (callback) {
            callback.call($(_this.selector), result);
          }
        }
      }, { fields: _this.fields });
    }

    _this.dataSource.on('select', function(data) {
      render(data);
    });

    _this.dataSource.on('insert', function(data) {
  //    insert(data, true);
    });

    _this.dataSource.on('update', function(data) {
  //    $(_this.selector).find('option[value=' + rowid +']').remove();
    });

    _this.dataSource.on('remove', function(rowid) {
      $(_this.selector).find('option[value=' + rowid +']').remove();
      callEvent('change');
    });

    $(_this.selector).change(function() {
      if (_this.saveSelection) {
        br.storage.set(storageTag(this), $(this).val());
      }
      callEvent('change');
    });

  }

}(jQuery, window);


// 
// Breeze Framework : Version 0.0.5
// (C) Sergiy Lavryk
// jagermesh@gmail.com
// 

!function ($, window, undefined) {

  window.br = window.br || {};

  window.br.editable = function(selector, callback, value) {
    if (typeof callback == 'string') {
      var data = $(selector).data('editable');
      if (data) {
        data[callback](value);
      }
    } else {
      $(selector).live('click', function(e) {
        var $this = $(this)
          , data = $this.data('editable');
        if (!data) {
          $this.data('editable', (data = new BrEditable(this, callback)));
        }
        data.click(e);
      });
    }
  }

  function BrEditable(ctrl, saveCallback) {

    var _this = this;
    _this.ctrl = $(ctrl);
    _this.saveCallback = saveCallback;
    _this.editor = null;
    _this.tooltip = null;
    _this.click = function(element, e) {
      if (!_this.activated()) {
        var content = _this.ctrl.text();
        _this.ctrl.data('original-content', content);
        var width = _this.ctrl.innerWidth();
        _this.ctrl.text('');
        _this.editor = $('<input />');
        _this.editor.css('width', '100%');
        _this.editor.css('box-sizing', '100%');
        _this.editor.css('-webkit-box-sizing', 'border-box');
        _this.editor.css('-moz-box-sizing', 'border-box');
        _this.editor.css('-ms-box-sizing', 'border-box');
        _this.editor.css('margin-top', '2px');
        _this.editor.css('margin-bottom', '2px');
        _this.editor.val(content);
        _this.ctrl.append(_this.editor);
        _this.ctrl.css('width', width - 10);
        _this.editor.focus();
        _this.editor.attr('data-original-title', 'Press [Enter] to save changes, [Esc] to cancel changes.');
        _this.editor.tooltip({placement: 'bottom', trigger: 'focus'});
        _this.editor.tooltip('show');
        _this.tooltip = _this.editor.data('tooltip');
        $(_this.editor).keyup(function(e) {
          if (e.keyCode == 13) {
            var content = $(this).val();
            if (typeof _this.saveCallback == 'function') {
              _this.editor.tooltip('hide');
              _this.saveCallback.call(_this.ctrl, content);
            } else {
              _this.apply(content);
            }
          }
          if (e.keyCode == 27) {
            _this.cancel();
          }
        });
      }
    }
    _this.activated = function() {
      return _this.editor != null;
    }
    _this.apply = function(content) {
      _this.tooltip.hide();
      _this.editor.remove();
      _this.editor = null;
      _this.ctrl.text(content);
    }
    _this.cancel = function() {
      _this.tooltip.hide();
      _this.editor.remove();
      _this.editor = null;
      _this.ctrl.text(_this.ctrl.data('original-content'));
    }

  }

}(jQuery, window);
// 
// Breeze Framework : Version 0.0.5
// (C) Sergiy Lavryk
// jagermesh@gmail.com
// 

!function ($, window, undefined) {

  window.br = window.br || {};

  var baseUrl = '';
  $('script').each(function(i, e) {
    var s = $(e).attr('src');
    if (s) {
      var idx = s.indexOf('breeze/js/breeze.js');
      if (idx > 0) {
        baseUrl = s.substring(0, idx);
        return true;
      }
    }
  });

  window.br.baseUrl = baseUrl;

  window.br.log = function(msg) {
    if (typeof(console) != 'undefined') {
      console.log(msg);
    }
  };

  window.br.isTouchScreen = function() {
    var ua = navigator.userAgent;
    return /iPad/i.test(ua) || /iPhone/i.test(ua) || /Android/i.test(ua);
  };

  window.br.isiOS = function() {
    var ua = navigator.userAgent;
    return /iPad/i.test(ua) || /iPhone/i.test(ua);
  };

  window.br.redirect = function(url) {
    if ((url.search(/^\//) == -1) && (url.search(/^http[s]?:\/\//) == -1)) {
      url = this.baseUrl + url;
    }
    document.location = url;
  };

  window.br.refresh = function() {
    document.location = document.location;
  };

  window.br.preloadImages = function(images) {
    try {
      var div = document.createElement("div");
      var s = div.style;
      s.position = "absolute";
      s.top = s.left = 0;
      s.visibility = "hidden";
      document.body.appendChild(div);
      div.innerHTML = "<img src=\"" + images.join("\" /><img src=\"") + "\" />";
    } catch(e) {
        // Error. Do nothing.
    }
  };

  window.br.randomInt = function(min, max) {
    if (max == undefined) {
      max = min;
      min = 0;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  window.br.forHtml = function(text) {
    if (text) {
      text = text.split('<').join('&lt;').split('>').join('&gt;');
    }
    return text;
  };

  window.br.extend = function(Child, Parent) {
    var F = function() { };
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.superclass = Parent.prototype;
  };

  window.br.toInt = function(value) {
    if (typeof value == 'string') {
      if (value.length > 0) {
        return parseInt(value);
      }
    }
    //return null;
  };

  window.br.toReal = function(value) {
    if (typeof value == 'string') {
      if (value.length > 0) {
        return parseFloat(value);
      }
    }
    //return null;
  };

  window.br.openPopup = function(url, w, h) {

    if (w == null) {
      if (screen.width)
        if (screen.width >= 1280)
          w = 1000;
        else
        if (screen.width >= 1024)
          w = 800;
        else
          w = 600;
    }
    if (h == null) {
      if (screen.height)
        if (screen.height >= 900)
          h = 700;
        else
        if (screen.height >= 800)
          h = 600;
        else
          h = 500;
    }
    var left = (screen.width) ? (screen.width-w)/2 : 0;
    var settings = 'height='+h+',width='+w+',top=20,left='+left+',menubar=0,scrollbars=1,resizable=1'
    var win = window.open(url, '_blank', settings)
    if (win) {
      win.focus();
    }

  };

  var modifiedTimeout;

  window.br.modifiedDeferred = function(selector, callback) {
    $(selector).live('change', function() {
      var $this = $(this);
      window.clearTimeout(modifiedTimeout);
      modifiedTimeout = window.setTimeout(function() {
        if ($this.data('br-last-change') != $this.val()) {
          $this.data('br-last-change', $this.val());
          callback.call($this);
        }
      }, 500);
    });
    $(selector).live('keyup', function(e) {
      if ((e.keyCode == 8) || (e.keyCode == 32) || ((e.keyCode >= 48) && (e.keyCode <= 90)) || ((e.keyCode >= 96) && (e.keyCode <= 111)) || ((e.keyCode >= 186) && (e.keyCode <= 222))) {
        var $this = $(this);
        window.clearTimeout(modifiedTimeout);
        modifiedTimeout = window.setTimeout(function() {
          if ($this.data('br-last-change') != $this.val()) {
            $this.data('br-last-change', $this.val());
            callback.call($this);
          }
          // callback.call($this);
        }, 500);
      }
    });
  }

  window.br.modified = function(selector, callback) {
    $(selector).live('change', function() {
      if ($(this).data('br-last-change') != $(this).val()) {
        $(this).data('br-last-change', $(this).val());
        callback.call(this);
      }
    });
    $(selector).live('keyup', function(e) {
      if ((e.keyCode == 8) || (e.keyCode == 32) || ((e.keyCode >= 48) && (e.keyCode <= 90)) || ((e.keyCode >= 96) && (e.keyCode <= 111)) || ((e.keyCode >= 186) && (e.keyCode <= 222))) {
        if ($(this).data('br-last-change') != $(this).val()) {
          $(this).data('br-last-change', $(this).val());
          callback.call(this);
        }
      }
    });
  }

  window.br.closeConfirmationMessage = 'Some changes have been made. Are you sure you want to close current window?';

  function breezeConfirmClose() {
    return closeConfirmationMessage;
  }

  window.br.confirmClose = function(message) {
    if (message) {
      closeConfirmationMessage = message;
    }
    window.onbeforeunload = breezeConfirmClose;
  }

  window.br.resetCloseConfirmation = function(message) {
    window.onbeforeunload = null;
  }

}(jQuery, window);
// 
// Breeze Framework : Version 0.0.5
// (C) Sergiy Lavryk
// jagermesh@gmail.com
// 

!function ($, window, undefined) {

  window.br = window.br || {};

  window.br.showError = function(s) {
    alert(s);
  };

  window.br.growlError = function(s, image) {
    if (!br.isEmpty(s)) {
      if (typeof $.gritter != 'undefined') {
        $.gritter.add({
            title: ' '
          , text: s
          , class_name: 'gritter-red'
          , image: image
        });
      } else
      if (typeof window.humane != 'undefined') {
        humane.log(s, { addnCls     : 'humane-jackedup-error humane-original-error'
                      //, clickToClose: true
                      , timeout     : 5000
                      });
      } else {
        alert(s);
      }
    }
  };

  window.br.showMessage = function(s) {
    if (!br.isEmpty(s)) {
      alert(s);
    }
  };

  window.br.growlMessage = function(s, image) {
    if (!br.isEmpty(s)) {
      if (typeof $.gritter != 'undefined') {
        $.gritter.add({
            title: ' '
          , text: s
          , class_name: 'gritter-light'
          , image: image
        });
      } else
      if (typeof window.humane != 'undefined') {
        humane.log(s);
      } else {
        alert(s);
      }
    }
  };

  window.br.confirm = function(title, message, buttons, callback) {
    var s = '<div class="modal">'+
            '<div class="modal-header"><a class="close" data-dismiss="modal">×</a><h3>' + title + '</h3></div>' +
            '<div class="modal-body">' + message + '</div>' +
            '<div class="modal-footer">';
    if (typeof buttons == 'function') {
      callback = buttons;
      s = s + '<a href="javascript:;" class="btn btn-primary action-confirm-close" rel="confirm">Yes</a>';
    } else {
      for(i in buttons) {
        s = s + '<a href="javascript:;" class="btn action-confirm-close" rel="' + i + '">' + buttons[i] + '</a>';
      }
    }
    s = s + '<a href="javascript:;" class="btn" data-dismiss="modal">&nbsp;Cancel&nbsp;</a>';
    s = s + '</div></div>';
    var dialog = $(s);
    $(dialog)
      .on('show', function(e) {
        $(this).find('.action-confirm-close').click(function() {
          $(dialog).modal('hide');
          callback.call(this, $(this).attr('rel'));
        });
      })
      .on('hide', function(e) {
        dialog.remove();
      });
    $(dialog).modal();
  }

  window.br.prompt = function(title, fields, callback, options) {
    options = options || {};
    var s = '<div class="modal">'+
            '<div class="modal-header"><a class="close" data-dismiss="modal">×</a><h3>' + title + '</h3></div>' +
            '<div class="modal-body">';
    var inputs = {}
    if (br.isObject(fields)) {
      inputs = fields;
    } else {
      inputs[fields] = '';
    }
    for(i in inputs) {
      s = s + '<label>' + i + '</label>' +
              '<input type="text" class="span4" value="' + inputs[i] + '" data-click-on-enter=".action-confirm-close" />';
    }
    s = s + '</div>' +
            '<div class="modal-footer">';
    s = s + '<a href="javascript:;" class="btn btn-primary action-confirm-close" rel="confirm" >Ok</a>';
    s = s + '<a href="javascript:;" class="btn" data-dismiss="modal">&nbsp;Cancel&nbsp;</a>';
    s = s + '</div></div>';
    var dialog = $(s);
    $(dialog)
      .on('shown', function(e) {
        $(this).find('input[type=text]')[0].focus();
      })
      .on('show', function(e) {
        $(this).find('.action-confirm-close').click(function() {
          $(dialog).modal('hide');
          var results = [];
          $(this).closest('div.modal').find('input[type=text]').each(function() {
            results.push($(this).val());
          });
          callback.call(this, results);
        });
      })
      .on('hide', function(e) {
        dialog.remove();
      });
    $(dialog).modal();
  }

  var noTemplateEngine = false;

  window.br.fetch = function(template, data, tags) {
    data = data || {};
    if (template) {
      if (typeof window.Mustache == 'undefined') {
        if (typeof window.Handlebars == 'undefined') {
          if (!noTemplateEngine) {
            noTemplateEngine = true;
            this.showError('Template engine not found. Please link breeze/3rdparty/mustache.js or breeze/3rdparty/handlebars.js.');
          }
        } else {
          var t = Handlebars.compile(template);
          return t(data);
        }
      } else {
        return Mustache.render(template, data);
      }
    } else {
      return '';
    }
  };

  var progressCounter = 0;

  window.br.showProgress = function() {
    progressCounter++;
    $('.ajax-in-progress').css('visibility', 'visible');
  }

  window.br.hideProgress = function() {
    progressCounter--;
    if (progressCounter <= 0) {
      $('.ajax-in-progress').css('visibility', 'hidden');
      progressCounter = 0;
    }
  }

  $(document).ready(function() { 

    var notAuthorized = false;

    $('body').ajaxStart(function() { br.showProgress(); });

    $('body').ajaxStop(function() { br.hideProgress(); });
    
    $('body').ajaxError(function(event, jqXHR, ajaxSettings, thrownError) {
      if (jqXHR.status == 401) {
        if (!notAuthorized) {
          notAuthorized = true;
          br.growlError('You are trying to run operation which require authorization.');
        }
      }
    });

    $('input[data-click-on-enter]').live('keypress', function(e) {
      if (e.keyCode == 13) { $($(this).attr('data-click-on-enter')).trigger('click'); }
    });

    if ($('.focused').length > 0) {
      $('.focused')[0].focus();
    }

  });

}(jQuery, window);
// 
// Breeze Framework : Version 0.0.5
// (C) Sergiy Lavryk
// jagermesh@gmail.com
// 

!function ($, window, undefined) {

  $(document).ready(function() { 
    
    var users = br.dataSource(br.baseUrl + 'api/users/');

    users.on('error', function(operation, error) {
      br.growlError(error);
    });

    $('.action-signup').click(function() {

      var form = $(this).closest('form');
      var data = {};
      $(form).find('input').each(function() {
        data[$(this).attr('name')] = $(this).val();
      });
      $(form).find('select').each(function() {
        data[$(this).attr('name')] = $(this).val();
      });
      users.invoke('signup', data, function(result) {
        if (result) {
          br.redirect('?from=signup');
        }
      });

    });

    $('.action-login').click(function() {

      var form = $(this).closest('form');
      var data = {};
      $(form).find('input').each(function() {
        data[$(this).attr('name')] = $(this).val();
      });
      $(form).find('select').each(function() {
        data[$(this).attr('name')] = $(this).val();
      });

      users.invoke( 'login'
                  , data
                  , function(result) {
                      if (result) {
                        br.redirect(br.request.get('caller', '?from=login'));
                      }
                    }
                  );

    });

    $('.action-forgot-password').click(function() {

      var form = $(this).closest('form');
      var data = {};
      $(form).find('input').each(function() {
        data[$(this).attr('name')] = $(this).val();
      });
      $(form).find('select').each(function() {
        data[$(this).attr('name')] = $(this).val();
      });

      users.invoke( 'remindPassword'
                  , data
                  , function(result) {
                      if (result) {
                        br.redirect(br.request.get('caller', '?from=login'));
                      }
                    }
                  );

    });

    $('.action-logout').live('click', function() {

      users.invoke( 'logout'
                  , { }
                  , function(result) {
                      if (result) {
                        document.location = br.baseUrl;
                      }
                    }
                  );

    });

  });

}(jQuery, window);
