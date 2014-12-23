/***********************************************
 * ng-grid JavaScript Library
 * Authors: https://github.com/angular-ui/ng-grid/blob/master/README.md
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 * Compiled At: 04/29/2014 10:21
 ***********************************************/
(function(window, $) {
	'use strict';
	// the # of rows we want to add to the top and bottom of the rendered grid rows
	var EXCESS_ROWS = 6;
	var SCROLL_THRESHOLD = 4;
	var ASC = "asc";
	// constant for sorting direction
	var DESC = "desc";
	// constant for sorting direction
	var NG_FIELD = '_ng_field_';
	var NG_DEPTH = '_ng_depth_';
	var NG_HIDDEN = '_ng_hidden_';
	var NG_COLUMN = '_ng_column_';
	var CUSTOM_FILTERS = /CUSTOM_FILTERS/g;
	var COL_FIELD = /COL_FIELD/g;
	var DISPLAY_CELL_TEMPLATE = /DISPLAY_CELL_TEMPLATE/g;
	var EDITABLE_CELL_TEMPLATE = /EDITABLE_CELL_TEMPLATE/g;
	var CELL_EDITABLE_CONDITION = /CELL_EDITABLE_CONDITION/g;
	var TEMPLATE_REGEXP = /<.+>/;
	window.ngGrid = {};
	window.ngGrid.i18n = {};

	// Declare app level module which depends on filters, and services
	var ngGridServices = angular.module('ngGrid.services', []);
	var ngGridDirectives = angular.module('ngGrid.directives', []);
	var ngGridFilters = angular.module('ngGrid.filters', []);
	// initialization of services into the main module
	angular.module('ngGrid', ['ngGrid.services', 'ngGrid.directives', 'ngGrid.filters']);
	//set event binding on the grid so we can select using the up/down keys
	var ngMoveSelectionHandler = function($scope, elm, evt, grid) {
		if ($scope.selectionProvider.selectedItems === undefined) {
			return true;
		}

		var charCode = evt.which || evt.keyCode,
			newColumnIndex,
			lastInRow = false,
			firstInRow = false,
			rowIndex = $scope.selectionProvider.lastClickedRow === undefined ? 1 : $scope.selectionProvider.lastClickedRow.rowIndex,
			visibleCols = $scope.columns.filter(function(c) { return c.visible; }),
			pinnedCols = $scope.columns.filter(function(c) { return c.pinned; });

		if ($scope.col) {
			newColumnIndex = visibleCols.indexOf($scope.col);
		}

		if (charCode !== 37 && charCode !== 38 && charCode !== 39 && charCode !== 40 && (grid.config.noTabInterference || charCode !== 9) && charCode !== 13) {
			return true;
		}

		if ($scope.enableCellSelection) {
			if (charCode === 9) { //tab key
				evt.preventDefault();
			}

			var focusedOnFirstColumn = $scope.showSelectionCheckbox ? $scope.col.index === 1 : $scope.col.index === 0;
			var focusedOnFirstVisibleColumns = $scope.$index === 1 || $scope.$index === 0;
			var focusedOnLastVisibleColumns = $scope.$index === ($scope.renderedColumns.length - 1) || $scope.$index === ($scope.renderedColumns.length - 2);
			var focusedOnLastColumn = visibleCols.indexOf($scope.col) === (visibleCols.length - 1);
			var focusedOnLastPinnedColumn = pinnedCols.indexOf($scope.col) === (pinnedCols.length - 1);

			if (charCode === 37 || charCode === 9 && evt.shiftKey) {
				var scrollTo = 0;

				if (!focusedOnFirstColumn) {
					newColumnIndex -= 1;
				}

				if (focusedOnFirstVisibleColumns) {
					if (focusedOnFirstColumn && charCode === 9 && evt.shiftKey){
						scrollTo = grid.$canvas.width();
						newColumnIndex = visibleCols.length - 1;
						firstInRow = true;
					}
					else {
						scrollTo = grid.$viewport.scrollLeft() - $scope.col.width;
					}
				}
				else if (pinnedCols.length > 0) {
					scrollTo = grid.$viewport.scrollLeft() - visibleCols[newColumnIndex].width;
				}

				grid.$viewport.scrollLeft(scrollTo);

			}
			else if (charCode === 39 || charCode ===  9 && !evt.shiftKey) {
				if (focusedOnLastVisibleColumns) {
					if (focusedOnLastColumn && charCode ===  9 && !evt.shiftKey) {
						grid.$viewport.scrollLeft(0);
						newColumnIndex = $scope.showSelectionCheckbox ? 1 : 0;
						lastInRow = true;
					}
					else {
						grid.$viewport.scrollLeft(grid.$viewport.scrollLeft() + $scope.col.width);
					}
				}
				else if (focusedOnLastPinnedColumn) {
					grid.$viewport.scrollLeft(0);
				}

				if (!focusedOnLastColumn) {
					newColumnIndex += 1;
				}
			}
		}

		var items;
		if ($scope.configGroups.length > 0) {
			items = grid.rowFactory.parsedData.filter(function (row) {
				return !row.isAggRow;
			});
		}
		else {
			items = grid.filteredRows;
		}

		var offset = 0;
		if (rowIndex !== 0 && (charCode === 38 || charCode === 13 && evt.shiftKey || charCode === 9 && evt.shiftKey && firstInRow)) { //arrow key up or shift enter or tab key and first item in row
			offset = -1;
		}
		else if (rowIndex !== items.length - 1 && (charCode === 40 || charCode === 13 && !evt.shiftKey || charCode === 9 && lastInRow)) {//arrow key down, enter, or tab key and last item in row?
			offset = 1;
		}

		if (offset) {
			var r = items[rowIndex + offset];
			if (r.beforeSelectionChange(r, evt)) {
				r.continueSelection(evt);
				$scope.$emit('ngGridEventDigestGridParent');

				if ($scope.selectionProvider.lastClickedRow.renderedRowIndex >= $scope.renderedRows.length - EXCESS_ROWS - 2) {
					grid.$viewport.scrollTop(grid.$viewport.scrollTop() + $scope.rowHeight);
				}
				else if ($scope.selectionProvider.lastClickedRow.renderedRowIndex <= EXCESS_ROWS + 2) {
					grid.$viewport.scrollTop(grid.$viewport.scrollTop() - $scope.rowHeight);
				}
			}
		}

		if ($scope.enableCellSelection) {
			setTimeout(function(){
				$scope.domAccessProvider.focusCellElement($scope, $scope.renderedColumns.indexOf(visibleCols[newColumnIndex]));
			}, 3);
		}

		return false;
	};

	if (!String.prototype.trim) {
		String.prototype.trim = function() {
			return this.replace(/^\s+|\s+$/g, '');
		};
	}
	if (!Array.prototype.indexOf) {
		Array.prototype.indexOf = function(elt /*, from*/) {
			var len = this.length >>> 0;
			var from = Number(arguments[1]) || 0;
			from = (from < 0) ? Math.ceil(from) : Math.floor(from);
			if (from < 0) {
				from += len;
			}
			for (; from < len; from++) {
				if (from in this && this[from] === elt) {
					return from;
				}
			}
			return -1;
		};
	}
	if (!Array.prototype.filter) {
		Array.prototype.filter = function(fun /*, thisp */) {
			"use strict";
			var t = Object(this);
			var len = t.length >>> 0;
			if (typeof fun !== "function") {
				throw new TypeError();
			}
			var res = [];
			var thisp = arguments[1];
			for (var i = 0; i < len; i++) {
				if (i in t) {
					var val = t[i]; // in case fun mutates this
					if (fun.call(thisp, val, i, t)) {
						res.push(val);
					}
				}
			}
			return res;
		};
	}
	ngGridFilters.filter('checkmark', function() {
		return function(input) {
			return input ? '\u2714' : '\u2718';
		};
	});
	ngGridFilters.filter('ngColumns', function() {
		return function(input) {
			return input.filter(function(col) {
				return !col.isAggCol;
			});
		};
	});
	angular.module('ngGrid.services').factory('$domUtilityService',['$utilityService', '$window', function($utils, $window) {
		var domUtilityService = {};
		var regexCache = {};
		var getWidths = function() {
			var $testContainer = $('<div></div>');
			$testContainer.appendTo('body');
			// 1. Run all the following measurements on startup!
			//measure Scroll Bars
			$testContainer.height(100).width(100).css("position", "absolute").css("overflow", "scroll");
			$testContainer.append('<div style="height: 400px; width: 400px;"></div>');
			domUtilityService.ScrollH = ($testContainer.height() - $testContainer[0].clientHeight);
			domUtilityService.ScrollW = ($testContainer.width() - $testContainer[0].clientWidth);
			$testContainer.empty();
			//clear styles
			$testContainer.attr('style', '');
			//measure letter sizes using a pretty typical font size and fat font-family
			$testContainer.append('<span style="font-family: Verdana, Helvetica, Sans-Serif; font-size: 14px;"><strong>M</strong></span>');
			domUtilityService.LetterW = $testContainer.children().first().width();
			$testContainer.remove();
		};
		domUtilityService.eventStorage = {};
		domUtilityService.AssignGridContainers = function($scope, rootEl, grid) {
			grid.$root = $(rootEl);
			//Headers
			grid.$topPanel = grid.$root.find(".ngTopPanel");
			grid.$groupPanel = grid.$root.find(".ngGroupPanel");
			grid.$headerContainer = grid.$topPanel.find(".ngHeaderContainer");
			$scope.$headerContainer = grid.$headerContainer;

			grid.$headerScroller = grid.$topPanel.find(".ngHeaderScroller");
			grid.$headers = grid.$headerScroller.children();
			//Viewport
			grid.$viewport = grid.$root.find(".ngViewport");
			//Canvas
			grid.$canvas = grid.$viewport.find(".ngCanvas");
			//Footers
			grid.$footerPanel = grid.$root.find(".ngFooterPanel");

			var scopeDereg = $scope.$watch(function () {
				return grid.$viewport.scrollLeft();
			}, function (newLeft) {
				return grid.$headerContainer.scrollLeft(newLeft);
			});

			$scope.$on('$destroy', function() {
				// Remove all references to DOM elements, otherwise we get memory leaks
				$(grid.$root.parent()).off('resize.nggrid');

				grid.$root = null;
				grid.$topPanel = null;
				// grid.$groupPanel = null;
				grid.$headerContainer = null;
				// grid.$headerScroller = null;
				grid.$headers = null;
				grid.$canvas = null;
				grid.$footerPanel = null;

				scopeDereg();
			});

			domUtilityService.UpdateGridLayout($scope, grid);
		};
		domUtilityService.getRealWidth = function (obj) {
			var width = 0;
			var props = { visibility: "hidden", display: "block" };
			var hiddenParents = obj.parents().andSelf().not(':visible');
			$.swap(hiddenParents[0], props, function () {
				width = obj.outerWidth();
			});
			return width;
		};
		domUtilityService.UpdateGridLayout = function($scope, grid) {
			if (!grid.$root){
				return;
			}
			//catch this so we can return the viewer to their original scroll after the resize!
			var scrollTop = grid.$viewport.scrollTop();
			grid.elementDims.rootMaxW = grid.$root.width();
			if (grid.$root.is(':hidden')) {
				grid.elementDims.rootMaxW = domUtilityService.getRealWidth(grid.$root);
			}
			grid.elementDims.rootMaxH = grid.$root.height();
			//check to see if anything has changed
			grid.refreshDomSizes();
			$scope.adjustScrollTop(scrollTop, true); //ensure that the user stays scrolled where they were
		};
		domUtilityService.numberOfGrids = 0;
		domUtilityService.setStyleText = function(grid, css) {
			var style = grid.styleSheet,
				gridId = grid.gridId,
				doc = $window.document;

			if (!style) {
				style = doc.getElementById(gridId);
			}
			if (!style) {
				style = doc.createElement('style');
				style.type = 'text/css';
				style.id = gridId;
				(doc.head || doc.getElementsByTagName('head')[0]).appendChild(style);
			}

			if (style.styleSheet && !style.sheet) {
				style.styleSheet.cssText = css;
			} else {
				style.innerHTML = css;
			}
			grid.styleSheet = style;
			grid.styleText = css;
		};
		domUtilityService.BuildStyles = function($scope, grid, digest) {
			var rowHeight = grid.config.rowHeight,
				gridId = grid.gridId,
				css,
				cols = $scope.columns,
				sumWidth = 0;

			var trw = $scope.totalRowWidth();
			css = "." + gridId + " .ngCanvas { width: " + trw + "px; }" +
			"." + gridId + " .ngRow { width: " + trw + "px; }" +
			"." + gridId + " .ngCanvas { width: " + trw + "px; }" +
			"." + gridId + " .ngHeaderScroller { width: " + (trw + domUtilityService.ScrollH) + "px}";

			for (var i = 0; i < cols.length; i++) {
				var col = cols[i];
				if (col.visible !== false) {
					css += "." + gridId + " .col" + i + " { width: " + col.width + "px; left: " + sumWidth + "px; height: " + rowHeight + "px }" +
					"." + gridId + " .colt" + i + " { width: " + col.width + "px; }";
					sumWidth += col.width;
				}
			}
			domUtilityService.setStyleText(grid, css);

			$scope.adjustScrollLeft(grid.$viewport.scrollLeft());
			if (digest) {
				domUtilityService.digest($scope);
			}
		};
		domUtilityService.setColLeft = function(col, colLeft, grid) {
			if (grid.styleText) {
				var regex = regexCache[col.index];
				if (!regex) {
					regex = regexCache[col.index] = new RegExp(".col" + col.index + " { width: [0-9]+px; left: [0-9]+px");
				}
				var css = grid.styleText.replace(regex, ".col" + col.index + " { width: " + col.width + "px; left: " + colLeft + "px");
				domUtilityService.setStyleText(grid, css);
			}
		};
		domUtilityService.setColLeft.immediate = 1;
		domUtilityService.RebuildGrid = function($scope, grid){
			domUtilityService.UpdateGridLayout($scope, grid);
			if (grid.config.maintainColumnRatios == null || grid.config.maintainColumnRatios) {
				grid.configureColumnWidths();
			}
			$scope.adjustScrollLeft(grid.$viewport.scrollLeft());
			domUtilityService.BuildStyles($scope, grid, true);
		};

		domUtilityService.digest = function($scope) {
			if (!$scope.$root.$$phase) {
				$scope.$digest();
			}
		};
		domUtilityService.ScrollH = 17; // default in IE, Chrome, & most browsers
		domUtilityService.ScrollW = 17; // default in IE, Chrome, & most browsers
		domUtilityService.LetterW = 10;
		getWidths();
		return domUtilityService;
	}]);
	angular.module('ngGrid.services').factory('$sortService', ['$parse', function($parse) {
		var sortService = {};
		sortService.colSortFnCache = {}; // cache of sorting functions. Once we create them, we don't want to keep re-doing it
		sortService.isCustomSort = false; // track if we're using an internal sort or a user provided sort
		// this takes an piece of data from the cell and tries to determine its type and what sorting
		// function to use for it
		// @item - the cell data
		sortService.guessSortFn = function(item) {
			var itemType = typeof(item);
			//check for numbers and booleans
			switch (itemType) {
				case "number":
					return sortService.sortNumber;
				case "boolean":
					return sortService.sortBool;
				case "string":
					// if number string return number string sort fn. else return the str
					return item.match(/^[-+]?[£$¤]?[\d,.]+%?$/) ? sortService.sortNumberStr : sortService.sortAlpha;
				default:
					//check if the item is a valid Date
					if (Object.prototype.toString.call(item) === '[object Date]') {
						return sortService.sortDate;
					}
					else {
						//finally just sort the basic sort...
						return sortService.basicSort;
					}
			}
		};
		//#region Sorting Functions
		sortService.basicSort = function(a, b) {
			if (a === b) {
				return 0;
			}
			if (a < b) {
				return -1;
			}
			return 1;
		};
		sortService.sortNumber = function(a, b) {
			return a - b;
		};
		sortService.sortNumberStr = function(a, b) {
			var numA, numB, badA = false, badB = false;
			numA = parseFloat(a.replace(/[^0-9.-]/g, ''));
			if (isNaN(numA)) {
				badA = true;
			}
			numB = parseFloat(b.replace(/[^0-9.-]/g, ''));
			if (isNaN(numB)) {
				badB = true;
			}
			// we want bad ones to get pushed to the bottom... which effectively is "greater than"
			if (badA && badB) {
				return 0;
			}
			if (badA) {
				return 1;
			}
			if (badB) {
				return -1;
			}
			return numA - numB;
		};
		sortService.sortAlpha = function(a, b) {
			var strA = a.toLowerCase(),
				strB = b.toLowerCase();
			return strA === strB ? 0 : (strA < strB ? -1 : 1);
		};
		sortService.sortDate = function(a, b) {
			var timeA = a.getTime(),
				timeB = b.getTime();
			return timeA === timeB ? 0 : (timeA < timeB ? -1 : 1);
		};
		sortService.sortBool = function(a, b) {
			if (a && b) {
				return 0;
			}
			if (!a && !b) {
				return 0;
			} else {
				return a ? 1 : -1;
			}
		};
		//#endregion
		// the core sorting logic trigger
		sortService.sortData = function(sortInfo, data /*datasource*/) {
			// first make sure we are even supposed to do work
			if (!data || !sortInfo) {
				return;
			}
			var l = sortInfo.fields.length,
				order = sortInfo.fields,
				col,
				direction,
			// IE9 HACK.... omg, I can't reference data array within the sort fn below. has to be a separate reference....!!!!
				d = data.slice(0);
			//now actually sort the data
			data.sort(function (itemA, itemB) {
				var tem = 0,
					indx = 0,
					res,
					sortFn;
				while (tem === 0 && indx < l) {
					// grab the metadata for the rest of the logic
					col = sortInfo.columns[indx];
					direction = sortInfo.directions[indx];
					sortFn = sortService.getSortFn(col, d);

					var propA = $parse(order[indx])(itemA);
					var propB = $parse(order[indx])(itemB);
					// if user provides custom sort, we want them to have full control of the sort
					if (sortService.isCustomSort) {
						res = sortFn(propA, propB);
						tem = direction === ASC ? res : 0 - res;
					} else {
						// we want to allow zero values to be evaluated in the sort function
						if ((!propA && propA !== 0) || (!propB && propB !== 0)) {
							// we want to force nulls and such to the bottom when we sort... which effectively is "greater than"
							if (!propB && !propA) {
								tem = 0;
							}
							else if (!propA) {
								tem = 1;
							}
							else if (!propB) {
								tem = -1;
							}
						}
						else {
							// this will keep nulls at the bottom regardless of ordering
							res = sortFn(propA, propB);
							tem = direction === ASC ? res : 0 - res;
						}
					}
					indx++;
				}
				return tem;
			});
		};
		sortService.Sort = function(sortInfo, data) {
			if (sortService.isSorting) {
				return;
			}
			sortService.isSorting = true;
			sortService.sortData(sortInfo, data);
			sortService.isSorting = false;
		};
		sortService.getSortFn = function(col, data) {
			var sortFn, item;
			//see if we already figured out what to use to sort the column
			if (sortService.colSortFnCache[col.field]) {
				sortFn = sortService.colSortFnCache[col.field];
			}
			else if (col.sortingAlgorithm !== undefined) {
				sortFn = col.sortingAlgorithm;
				sortService.colSortFnCache[col.field] = col.sortingAlgorithm;
				sortService.isCustomSort = true;
			}
			else { // try and guess what sort function to use
				item = data[0];
				if (!item) {
					return sortFn;
				}
				sortFn = sortService.guessSortFn($parse(col.field)(item));
				//cache it
				if (sortFn) {
					sortService.colSortFnCache[col.field] = sortFn;
				} else {
					// we assign the alpha sort because anything that is null/undefined will never get passed to
					// the actual sorting function. It will get caught in our null check and returned to be sorted
					// down to the bottom
					sortFn = sortService.sortAlpha;
				}
			}
			return sortFn;
		};
		return sortService;
	}]);

	angular.module('ngGrid.services').factory('$utilityService', ['$parse', function ($parse) {
		var funcNameRegex = /function (.{1,})\(/;
		var utils = {
			visualLength: function(node) {
				var elem = document.getElementById('testDataLength');
				if (!elem) {
					elem = document.createElement('SPAN');
					elem.id = "testDataLength";
					elem.style.visibility = "hidden";
					document.body.appendChild(elem);
				}
				var $node = $(node);
				$(elem).css({'font': $node.css('font'),
					'font-size': $node.css('font-size'),
					'font-family': $node.css('font-family')});
				elem.innerHTML = $node.text();
				var width = elem.offsetWidth;
				document.body.removeChild(elem);
				return width;
			},
			forIn: function(obj, action) {
				for (var prop in obj) {
					if (obj.hasOwnProperty(prop)) {
						action(obj[prop], prop);
					}
				}
			},
			evalProperty: function (entity, path) {
				return $parse("entity." + path)({ entity: entity });
			},
			endsWith: function(str, suffix) {
				if (!str || !suffix || typeof str !== "string") {
					return false;
				}
				return str.indexOf(suffix, str.length - suffix.length) !== -1;
			},
			isNullOrUndefined: function(obj) {
				if (obj === undefined || obj === null) {
					return true;
				}
				return false;
			},
			getElementsByClassName: function(cl) {
				if (document.getElementsByClassName) {
					return document.getElementsByClassName(cl);
				}
				else {
					var retnode = [];
					var myclass = new RegExp('\\b' + cl + '\\b');
					var elem = document.getElementsByTagName('*');
					for (var i = 0; i < elem.length; i++) {
						var classes = elem[i].className;
						if (myclass.test(classes)) {
							retnode.push(elem[i]);
						}
					}
					return retnode;
				}
			},
			newId: (function() {
				var seedId = new Date().getTime();
				return function() {
					return seedId += 1;
				};
			})(),
			seti18n: function($scope, language) {
				var $langPack = window.ngGrid.i18n[language];
				for (var label in $langPack) {
					$scope.i18n[label] = $langPack[label];
				}
			},
			getInstanceType: function (o) {
				var results = (funcNameRegex).exec(o.constructor.toString());
				if (results && results.length > 1) {
					var instanceType = results[1].replace(/^\s+|\s+$/g, ""); // Trim surrounding whitespace; IE appears to add a space at the end
					return instanceType;
				}
				else {
					return "";
				}
			}
		};

		return utils;
	}]);

	var ngAggregate = function (aggEntity, rowFactory, rowHeight, groupInitState) {
		this.rowIndex = 0;
		this.offsetTop = this.rowIndex * rowHeight;
		this.entity = aggEntity;
		this.label = aggEntity.gLabel;
		this.field = aggEntity.gField;
		this.depth = aggEntity.gDepth;
		this.parent = aggEntity.parent;
		this.children = aggEntity.children;
		this.aggChildren = aggEntity.aggChildren;
		this.aggIndex = aggEntity.aggIndex;
		this.collapsed = groupInitState;
		this.groupInitState = groupInitState;
		this.rowFactory = rowFactory;
		this.rowHeight = rowHeight;
		this.isAggRow = true;
		this.offsetLeft = aggEntity.gDepth * 25;
		this.aggLabelFilter = aggEntity.aggLabelFilter;
	};

	ngAggregate.prototype.toggleExpand = function () {
		this.collapsed = this.collapsed ? false : true;
		if (this.orig) {
			this.orig.collapsed = this.collapsed;
		}
		this.notifyChildren();
	};
	ngAggregate.prototype.setExpand = function (state) {
		this.collapsed = state;
		this.notifyChildren();
	};
	ngAggregate.prototype.notifyChildren = function () {
		var longest = Math.max(this.rowFactory.aggCache.length, this.children.length);
		for (var i = 0; i < longest; i++) {
			if (this.aggChildren[i]) {
				this.aggChildren[i].entity[NG_HIDDEN] = this.collapsed;
				if (this.collapsed) {
					this.aggChildren[i].setExpand(this.collapsed);
				}
			}
			if (this.children[i]) {
				this.children[i][NG_HIDDEN] = this.collapsed;
			}
			if (i > this.aggIndex && this.rowFactory.aggCache[i]) {
				var agg = this.rowFactory.aggCache[i];
				var offset = (30 * this.children.length);
				agg.offsetTop = this.collapsed ? agg.offsetTop - offset : agg.offsetTop + offset;
			}
		}
		this.rowFactory.renderedChange();
	};
	ngAggregate.prototype.aggClass = function () {
		return this.collapsed ? "ngAggArrowCollapsed" : "ngAggArrowExpanded";
	};
	ngAggregate.prototype.totalChildren = function () {
		if (this.aggChildren.length > 0) {
			var i = 0;
			var recurse = function (cur) {
				if (cur.aggChildren.length > 0) {
					angular.forEach(cur.aggChildren, function (a) {
						recurse(a);
					});
				} else {
					i += cur.children.length;
				}
			};
			recurse(this);
			return i;
		} else {
			return this.children.length;
		}
	};
	ngAggregate.prototype.copy = function () {
		var ret = new ngAggregate(this.entity, this.rowFactory, this.rowHeight, this.groupInitState);
		ret.orig = this;
		return ret;
	};
	var ngColumn = function (config, $scope, grid, domUtilityService, $templateCache, $utils) {
		var self = this,
			colDef = config.colDef,
			delay = 500,
			clicks = 0,
			timer = null;
		self.colDef = config.colDef;
		self.width = colDef.width;
		self.groupIndex = 0;
		self.isGroupedBy = false;
		self.minWidth = !colDef.minWidth ? 50 : colDef.minWidth;
		self.maxWidth = !colDef.maxWidth ? 9000 : colDef.maxWidth;

		// TODO: Use the column's definition for enabling cell editing
		// self.enableCellEdit = config.enableCellEdit || colDef.enableCellEdit;
		self.enableCellEdit = colDef.enableCellEdit !== undefined ? colDef.enableCellEdit : (config.enableCellEdit || config.enableCellEditOnFocus);

		self.cellEditableCondition = colDef.cellEditableCondition || config.cellEditableCondition || 'true';

		self.headerRowHeight = config.headerRowHeight;

		// Use colDef.displayName as long as it's not undefined, otherwise default to the field name
		self.displayName = (colDef.displayName === undefined) ? colDef.field : colDef.displayName;

		self.index = config.index;
		self.isAggCol = config.isAggCol;
		self.cellClass = colDef.cellClass;
		self.sortPriority = undefined;
		self.cellFilter = colDef.cellFilter ? colDef.cellFilter : "";
		self.field = colDef.field;
		self.aggLabelFilter = colDef.aggLabelFilter || colDef.cellFilter;
		self.visible = $utils.isNullOrUndefined(colDef.visible) || colDef.visible;
		self.sortable = false;
		self.resizable = false;
		self.pinnable = false;
		self.pinned = (config.enablePinning && colDef.pinned);
		self.originalIndex = config.originalIndex == null ? self.index : config.originalIndex;
		self.groupable = $utils.isNullOrUndefined(colDef.groupable) || colDef.groupable;
		if (config.enableSort) {
			self.sortable = $utils.isNullOrUndefined(colDef.sortable) || colDef.sortable;
		}
		if (config.enableResize) {
			self.resizable = $utils.isNullOrUndefined(colDef.resizable) || colDef.resizable;
		}
		if (config.enablePinning) {
			self.pinnable = $utils.isNullOrUndefined(colDef.pinnable) || colDef.pinnable;
		}
		self.sortDirection = undefined;
		self.sortingAlgorithm = colDef.sortFn;
		self.headerClass = colDef.headerClass;
		self.cursor = self.sortable ? 'pointer' : 'default';
		self.headerCellTemplate = colDef.headerCellTemplate || $templateCache.get('headerCellTemplate.html');
		self.cellTemplate = colDef.cellTemplate || $templateCache.get('cellTemplate.html').replace(CUSTOM_FILTERS, self.cellFilter ? "|" + self.cellFilter : "");
		if(self.enableCellEdit) {
			self.cellEditTemplate = colDef.cellEditTemplate || $templateCache.get('cellEditTemplate.html');
			self.editableCellTemplate = colDef.editableCellTemplate || $templateCache.get('editableCellTemplate.html');
		}
		if (colDef.cellTemplate && !TEMPLATE_REGEXP.test(colDef.cellTemplate)) {
			self.cellTemplate = $templateCache.get(colDef.cellTemplate) || $.ajax({
				type: "GET",
				url: colDef.cellTemplate,
				async: false
			}).responseText;
		}
		if (self.enableCellEdit && colDef.editableCellTemplate && !TEMPLATE_REGEXP.test(colDef.editableCellTemplate)) {
			self.editableCellTemplate = $templateCache.get(colDef.editableCellTemplate) || $.ajax({
				type: "GET",
				url: colDef.editableCellTemplate,
				async: false
			}).responseText;
		}
		if (colDef.headerCellTemplate && !TEMPLATE_REGEXP.test(colDef.headerCellTemplate)) {
			self.headerCellTemplate = $templateCache.get(colDef.headerCellTemplate) || $.ajax({
				type: "GET",
				url: colDef.headerCellTemplate,
				async: false
			}).responseText;
		}
		self.colIndex = function () {
			var classes = self.pinned ? "pinned " : "";
			classes += "col" + self.index + " colt" + self.index;
			if (self.cellClass) {
				classes += " " + self.cellClass;
			}
			return classes;
		};
		self.groupedByClass = function() {
			return self.isGroupedBy ? "ngGroupedByIcon" : "ngGroupIcon";
		};
		self.toggleVisible = function() {
			self.visible = !self.visible;
		};
		self.showSortButtonUp = function() {
			return self.sortable ? self.sortDirection === DESC : self.sortable;
		};
		self.showSortButtonDown = function() {
			return self.sortable ? self.sortDirection === ASC : self.sortable;
		};
		self.noSortVisible = function() {
			return !self.sortDirection;
		};
		self.sort = function(evt) {
			if (!self.sortable) {
				return true; // column sorting is disabled, do nothing
			}
			var dir = self.sortDirection === ASC ? DESC : ASC;
			self.sortDirection = dir;
			config.sortCallback(self, evt);
			return false;
		};
		self.gripClick = function() {
			clicks++; //count clicks
			if (clicks === 1) {
				timer = setTimeout(function() {
					//Here you can add a single click action.
					clicks = 0; //after action performed, reset counter
				}, delay);
			} else {
				clearTimeout(timer); //prevent single-click action
				config.resizeOnDataCallback(self); //perform double-click action
				clicks = 0; //after action performed, reset counter
			}
		};
		self.gripOnMouseDown = function(event) {
			$scope.isColumnResizing = true;
			if (event.ctrlKey && !self.pinned) {
				self.toggleVisible();
				domUtilityService.BuildStyles($scope, grid);
				return true;
			}
			event.target.parentElement.style.cursor = 'col-resize';
			self.startMousePosition = event.clientX;
			self.origWidth = self.width;
			$(document).mousemove(self.onMouseMove);
			$(document).mouseup(self.gripOnMouseUp);
			return false;
		};
		self.onMouseMove = function(event) {
			var diff = event.clientX - self.startMousePosition;
			var newWidth = diff + self.origWidth;
			self.width = (newWidth < self.minWidth ? self.minWidth : (newWidth > self.maxWidth ? self.maxWidth : newWidth));
			$scope.hasUserChangedGridColumnWidths = true;
			domUtilityService.BuildStyles($scope, grid);
			return false;
		};
		self.gripOnMouseUp = function (event) {
			$(document).off('mousemove', self.onMouseMove);
			$(document).off('mouseup', self.gripOnMouseUp);
			event.target.parentElement.style.cursor = 'default';
			domUtilityService.digest($scope);
			$scope.isColumnResizing = false;
			return false;
		};
		self.copy = function() {
			var ret = new ngColumn(config, $scope, grid, domUtilityService, $templateCache, $utils);
			ret.isClone = true;
			ret.orig = self;
			return ret;
		};
		self.setVars = function (fromCol) {
			self.orig = fromCol;
			self.width = fromCol.width;
			self.groupIndex = fromCol.groupIndex;
			self.isGroupedBy = fromCol.isGroupedBy;
			self.displayName = fromCol.displayName;
			self.index = fromCol.index;
			self.isAggCol = fromCol.isAggCol;
			self.cellClass = fromCol.cellClass;
			self.cellFilter = fromCol.cellFilter;
			self.field = fromCol.field;
			self.aggLabelFilter = fromCol.aggLabelFilter;
			self.visible = fromCol.visible;
			self.sortable = fromCol.sortable;
			self.resizable = fromCol.resizable;
			self.pinnable = fromCol.pinnable;
			self.pinned = fromCol.pinned;
			self.originalIndex = fromCol.originalIndex;
			self.sortDirection = fromCol.sortDirection;
			self.sortingAlgorithm = fromCol.sortingAlgorithm;
			self.headerClass = fromCol.headerClass;
			self.headerCellTemplate = fromCol.headerCellTemplate;
			self.cellTemplate = fromCol.cellTemplate;
			self.cellEditTemplate = fromCol.cellEditTemplate;
		};
	};

	var ngDimension = function (options) {
		this.outerHeight = null;
		this.outerWidth = null;
		$.extend(this, options);
	};
	var ngDomAccessProvider = function (grid) {
		this.previousColumn = null;
		this.grid = grid;

	};

	ngDomAccessProvider.prototype.changeUserSelect = function (elm, value) {
		elm.css({
			'-webkit-touch-callout': value,
			'-webkit-user-select': value,
			'-khtml-user-select': value,
			'-moz-user-select': value === 'none' ? '-moz-none' : value,
			'-ms-user-select': value,
			'user-select': value
		});
	};
	ngDomAccessProvider.prototype.focusCellElement = function ($scope, index) {
		if ($scope.selectionProvider.lastClickedRow) {
			var columnIndex = index !== undefined ? index : this.previousColumn;
			var elm = $scope.selectionProvider.lastClickedRow.clone ? $scope.selectionProvider.lastClickedRow.clone.elm : $scope.selectionProvider.lastClickedRow.elm;
			if (columnIndex !== undefined && elm) {
				var columns = angular.element(elm[0].children).filter(function () { return this.nodeType !== 8; }); //Remove html comments for IE8
				var i = Math.max(Math.min($scope.renderedColumns.length - 1, columnIndex), 0);
				if (this.grid.config.showSelectionCheckbox && angular.element(columns[i]).scope() && angular.element(columns[i]).scope().col.index === 0) {
					i = 1; //don't want to focus on checkbox
				}
				if (columns[i]) {
					columns[i].children[1].children[0].focus();
				}
				this.previousColumn = columnIndex;
			}
		}
	};
	ngDomAccessProvider.prototype.selectionHandlers = function ($scope, elm) {
		var doingKeyDown = false;
		var self = this;

		function keydown (evt) {
			if (evt.keyCode === 16) { //shift key
				self.changeUserSelect(elm, 'none', evt);
				return true;
			} else if (!doingKeyDown) {
				doingKeyDown = true;
				var ret = ngMoveSelectionHandler($scope, elm, evt, self.grid);
				doingKeyDown = false;
				return ret;
			}
			return true;
		}

		elm.bind('keydown', keydown);

		function keyup (evt) {
			if (evt.keyCode === 16) { //shift key
				self.changeUserSelect(elm, 'text', evt);
			}
			return true;
		}

		elm.bind('keyup', keyup);

		elm.on('$destroy', function() {
			elm.off('keydown', keydown);
			elm.off('keyup', keyup);
		});
	};
	var ngEventProvider = function (grid, $scope, domUtilityService, $timeout) {
		var self = this;
		// The init method gets called during the ng-grid directive execution.
		self.colToMove = undefined;
		self.groupToMove = undefined;
		self.assignEvents = function() {
			// Here we set the onmousedown event handler to the header container.
			if (grid.config.jqueryUIDraggable && !grid.config.enablePinning) {
				grid.$groupPanel.droppable({
					addClasses: false,
					drop: function(event) {
						self.onGroupDrop(event);
					}
				});

				grid.$groupPanel.on('$destroy', function() {
					grid.$groupPanel = null;
				});
			} else {
				grid.$groupPanel.on('mousedown', self.onGroupMouseDown).on('dragover', self.dragOver).on('drop', self.onGroupDrop);
				grid.$topPanel.on('mousedown', '.ngHeaderScroller', self.onHeaderMouseDown).on('dragover', '.ngHeaderScroller', self.dragOver);

				grid.$groupPanel.on('$destroy', function() {
					if (grid.$groupPanel){
						grid.$groupPanel.off('mousedown');
					}

					grid.$groupPanel = null;
				});

				if (grid.config.enableColumnReordering) {
					grid.$topPanel.on('drop', '.ngHeaderScroller', self.onHeaderDrop);
				}

				grid.$topPanel.on('$destroy', function() {
					if (grid.$topPanel){
						grid.$topPanel.off('mousedown');
					}

					if (grid.config.enableColumnReordering && grid.$topPanel) {
						grid.$topPanel.off('drop');
					}

					grid.$topPanel = null;
				});
			}

			$scope.$on('$destroy', $scope.$watch('renderedColumns', function() {
				$timeout(self.setDraggables);
			}));
		};
		self.dragStart = function(evt){
			//FireFox requires there to be dataTransfer if you want to drag and drop.
			evt.dataTransfer.setData('text', ''); //cannot be empty string
		};
		self.dragOver = function(evt) {
			evt.preventDefault();
		};
		//For JQueryUI
		self.setDraggables = function() {
			if (!grid.config.jqueryUIDraggable) {
				//Fix for FireFox. Instead of using jQuery on('dragstart', function) on find, we have to use addEventListeners for each column.
				var columns = grid.$root.find('.ngHeaderSortColumn'); //have to iterate if using addEventListener
				angular.forEach(columns, function(col){
					if(col.className && col.className.indexOf("ngHeaderSortColumn") !== -1){
						col.setAttribute('draggable', 'true');
						//jQuery 'on' function doesn't have  dataTransfer as part of event in handler unless added to event props, which is not recommended
						//See more here: http://api.jquery.com/category/events/event-object/
						if (col.addEventListener) { //IE8 doesn't have drag drop or event listeners
							col.addEventListener('dragstart', self.dragStart);

							angular.element(col).on('$destroy', function() {
								angular.element(col).off('dragstart', self.dragStart);
								col.removeEventListener('dragstart', self.dragStart);
							});
						}
					}
				});
				if (navigator.userAgent.indexOf("MSIE") !== -1){
					//call native IE dragDrop() to start dragging
					var sortColumn = grid.$root.find('.ngHeaderSortColumn');
					sortColumn.bind('selectstart', function () {
						this.dragDrop();
						return false;
					});
					angular.element(sortColumn).on('$destroy', function() {
						sortColumn.off('selectstart');
					});
				}
			} else {
				if (grid.$root) {
					grid.$root.find('.ngHeaderSortColumn').draggable({
						helper: 'clone',
						appendTo: 'body',
						stack: 'div',
						addClasses: false,
						start: function(event) {
							self.onHeaderMouseDown(event);
						}
					}).droppable({
						drop: function(event) {
							self.onHeaderDrop(event);
						}
					});
				}
			}
		};
		self.onGroupMouseDown = function(event) {
			var groupItem = $(event.target);
			// Get the scope from the header container
			if (groupItem[0].className !== 'ngRemoveGroup') {
				var groupItemScope = angular.element(groupItem).scope();
				if (groupItemScope) {
					// set draggable events
					if (!grid.config.jqueryUIDraggable) {
						groupItem.attr('draggable', 'true');
						if(this.addEventListener){//IE8 doesn't have drag drop or event listeners
							this.addEventListener('dragstart', self.dragStart);

							angular.element(this).on('$destroy', function() {
								this.removeEventListener('dragstart', self.dragStart);
							});
						}
						if (navigator.userAgent.indexOf("MSIE") !== -1){
							//call native IE dragDrop() to start dragging
							groupItem.bind('selectstart', function () {
								this.dragDrop();
								return false;
							});

							groupItem.on('$destroy', function() {
								groupItem.off('selectstart');
							});
						}
					}
					// Save the column for later.
					self.groupToMove = { header: groupItem, groupName: groupItemScope.group, index: groupItemScope.$index };
				}
			} else {
				self.groupToMove = undefined;
			}
		};
		self.onGroupDrop = function(event) {
			event.stopPropagation();
			// clear out the colToMove object
			var groupContainer;
			var groupScope;
			if (self.groupToMove) {
				// Get the closest header to where we dropped
				groupContainer = $(event.target).closest('.ngGroupElement'); // Get the scope from the header.
				if (groupContainer.context.className === 'ngGroupPanel') {
					$scope.configGroups.splice(self.groupToMove.index, 1);
					$scope.configGroups.push(self.groupToMove.groupName);
				} else {
					groupScope = angular.element(groupContainer).scope();
					if (groupScope) {
						// If we have the same column, do nothing.
						if (self.groupToMove.index !== groupScope.$index) {
							// Splice the columns
							$scope.configGroups.splice(self.groupToMove.index, 1);
							$scope.configGroups.splice(groupScope.$index, 0, self.groupToMove.groupName);
						}
					}
				}
				self.groupToMove = undefined;
				grid.fixGroupIndexes();
			} else if (self.colToMove) {
				if ($scope.configGroups.indexOf(self.colToMove.col) === -1) {
					groupContainer = $(event.target).closest('.ngGroupElement'); // Get the scope from the header.
					if (groupContainer.context.className === 'ngGroupPanel' || groupContainer.context.className === 'ngGroupPanelDescription ng-binding') {
						$scope.groupBy(self.colToMove.col);
					} else {
						groupScope = angular.element(groupContainer).scope();
						if (groupScope) {
							// Splice the columns
							$scope.removeGroup(groupScope.$index);
						}
					}
				}
				self.colToMove = undefined;
			}
			if (!$scope.$$phase) {
				$scope.$apply();
			}
		};
		//Header functions
		self.onHeaderMouseDown = function(event) {
			// Get the closest header container from where we clicked.
			var headerContainer = $(event.target).closest('.ngHeaderSortColumn');
			// Get the scope from the header container
			var headerScope = angular.element(headerContainer).scope();
			if (headerScope) {
				// Save the column for later.
				self.colToMove = { header: headerContainer, col: headerScope.col };
			}
		};
		self.onHeaderDrop = function(event) {
			if (!self.colToMove || self.colToMove.col.pinned) {
				return;
			}
			// Get the closest header to where we dropped
			var headerContainer = $(event.target).closest('.ngHeaderSortColumn');
			// Get the scope from the header.
			var headerScope = angular.element(headerContainer).scope();
			if (headerScope) {
				// If we have the same column or the target column is pinned, do nothing.
				if (self.colToMove.col === headerScope.col || headerScope.col.pinned) {
					return;
				}
				// Splice the columns
				$scope.columns.splice(self.colToMove.col.index, 1);
				$scope.columns.splice(headerScope.col.index, 0, self.colToMove.col);
				grid.fixColumnIndexes();
				// clear out the colToMove object
				self.colToMove = undefined;
				domUtilityService.digest($scope);
			}
		};

		self.assignGridEventHandlers = function() {
			//Chrome and firefox both need a tab index so the grid can recieve focus.
			//need to give the grid a tabindex if it doesn't already have one so
			//we'll just give it a tab index of the corresponding gridcache index
			//that way we'll get the same result every time it is run.
			//configurable within the options.
			if (grid.config.tabIndex === -1) {
				grid.$viewport.attr('tabIndex', domUtilityService.numberOfGrids);
				domUtilityService.numberOfGrids++;
			} else {
				grid.$viewport.attr('tabIndex', grid.config.tabIndex);
			}
			// resize on window resize
			var windowThrottle;
			var windowResize = function(){
				clearTimeout(windowThrottle);
				windowThrottle = setTimeout(function() {
					//in function for IE8 compatibility
					domUtilityService.RebuildGrid($scope,grid);
				}, 100);
			};
			$(window).on('resize.nggrid', windowResize);
			// resize on parent resize as well.
			var parentThrottle;
			var parentResize = function() {
				clearTimeout(parentThrottle);
				parentThrottle = setTimeout(function() {
					//in function for IE8 compatibility
					domUtilityService.RebuildGrid($scope,grid);
				}, 100);
			};
			$(grid.$root.parent()).on('resize.nggrid', parentResize);

			$scope.$on('$destroy', function(){
				$(window).off('resize.nggrid', windowResize);
				// $(grid.$root.parent()).off('resize.nggrid', parentResize);
			});
		};
		// In this example we want to assign grid events.
		self.assignGridEventHandlers();
		self.assignEvents();
	};

	var ngFooter = function ($scope, grid) {
		$scope.maxRows = function () {
			var ret = Math.max($scope.totalServerItems, grid.data.length);
			return ret;
		};

		$scope.$on('$destroy', $scope.$watch('totalServerItems',function(n,o){
			$scope.currentMaxPages = $scope.maxPages();
		}));

		$scope.multiSelect = (grid.config.enableRowSelection && grid.config.multiSelect);
		$scope.selectedItemCount = grid.selectedItemCount;

		$scope.maxPages = function () {
			if($scope.maxRows() === 0) {
				return 1;
			}
			return Math.ceil($scope.maxRows() / $scope.pagingOptions.pageSize);
		};

		$scope.pageForward = function() {
			var page = $scope.pagingOptions.currentPage;
			if ($scope.totalServerItems > 0) {
				$scope.pagingOptions.currentPage = Math.min(page + 1, $scope.maxPages());
			} else {
				$scope.pagingOptions.currentPage++;
			}
		};

		$scope.pageBackward = function() {
			var page = $scope.pagingOptions.currentPage;
			$scope.pagingOptions.currentPage = Math.max(page - 1, 1);
		};

		$scope.pageToFirst = function() {
			$scope.pagingOptions.currentPage = 1;
		};

		$scope.pageToLast = function() {
			var maxPages = $scope.maxPages();
			$scope.pagingOptions.currentPage = maxPages;
		};

		$scope.cantPageForward = function() {
			var curPage = $scope.pagingOptions.currentPage;
			var maxPages = $scope.maxPages();
			if ($scope.totalServerItems > 0) {
				return curPage >= maxPages;
			} else {
				return grid.data.length < 1;
			}

		};
		$scope.cantPageToLast = function() {
			if ($scope.totalServerItems > 0) {
				return $scope.cantPageForward();
			} else {
				return true;
			}
		};

		$scope.cantPageBackward = function() {
			var curPage = $scope.pagingOptions.currentPage;
			return curPage <= 1;
		};
	};
	/// <reference path="footer.js" />
	/// <reference path="../services/SortService.js" />
	/// <reference path="../../lib/jquery-1.8.2.min" />
	var ngGrid = function ($scope, options, sortService, domUtilityService, $filter, $templateCache, $utils, $timeout, $parse, $http, $q) {
		var defaults = {
				//Define an aggregate template to customize the rows when grouped. See github wiki for more details.
				aggregateTemplate: undefined,

				//Callback for when you want to validate something after selection.
				afterSelectionChange: function() {
				},

				/* Callback if you want to inspect something before selection,
				 return false if you want to cancel the selection. return true otherwise.
				 If you need to wait for an async call to proceed with selection you can
				 use rowItem.changeSelection(event) method after returning false initially.
				 Note: when shift+ Selecting multiple items in the grid this will only get called
				 once and the rowItem will be an array of items that are queued to be selected. */
				beforeSelectionChange: function() {
					return true;
				},

				//checkbox templates.
				checkboxCellTemplate: undefined,
				checkboxHeaderTemplate: undefined,

				//definitions of columns as an array [], if not defines columns are auto-generated. See github wiki for more details.
				columnDefs: undefined,

				//*Data being displayed in the grid. Each item in the array is mapped to a row being displayed.
				data: [],

				//Data updated callback, fires every time the data is modified from outside the grid.
				dataUpdated: function() {
				},

				//Enables cell editing.
				enableCellEdit: false,

				//Enables cell editing on focus
				enableCellEditOnFocus: false,

				//Enables cell selection.
				enableCellSelection: false,

				//Enable or disable resizing of columns
				enableColumnResize: false,

				//Enable or disable reordering of columns
				enableColumnReordering: false,

				//Enable or disable HEAVY column virtualization. This turns off selection checkboxes and column pinning and is designed for spreadsheet-like data.
				enableColumnHeavyVirt: false,

				//Enables the server-side paging feature
				enablePaging: false,

				//Enable column pinning
				enablePinning: false,

				//To be able to have selectable rows in grid.
				enableRowSelection: true,

				//Enables or disables sorting in grid.
				enableSorting: true,

				//Enables or disables text highlighting in grid by adding the "unselectable" class (See CSS file)
				enableHighlighting: false,

				// string list of properties to exclude when auto-generating columns.
				excludeProperties: [],

				/* filterOptions -
				 filterText: The text bound to the built-in search box.
				 useExternalFilter: Bypass internal filtering if you want to roll your own filtering mechanism but want to use builtin search box.
				 */
				filterOptions: {
					filterText: "",
					useExternalFilter: false
				},

				//Defining the height of the footer in pixels.
				footerRowHeight: 55,

				// the template for the column menu and filter, including the button.
				footerTemplate: undefined,

				// Enables a trade off between refreshing the contents of the grid continuously while scrolling (behaviour when true)
				// and keeping the scroll bar button responsive at the expense of refreshing grid contents (behaviour when false)
				forceSyncScrolling: true,

				//Initial fields to group data by. Array of field names, not displayName.
				groups: [],

				// set the initial state of aggreagate grouping. "true" means they will be collapsed when grouping changes, "false" means they will be expanded by default.
				groupsCollapsedByDefault: true,

				//The height of the header row in pixels.
				headerRowHeight: 30,

				//Define a header row template for further customization. See github wiki for more details.
				headerRowTemplate: undefined,

				/*Enables the use of jquery UI reaggable/droppable plugin. requires jqueryUI to work if enabled.
				 Useful if you want drag + drop but your users insist on crappy browsers. */
				jqueryUIDraggable: false,

				//Enable the use jqueryUIThemes
				jqueryUITheme: false,

				//Prevent unselections when in single selection mode.
				keepLastSelected: true,

				/*Maintains the column widths while resizing.
				 Defaults to true when using *'s or undefined widths. Can be ovverriden by setting to false.*/
				maintainColumnRatios: undefined,

				// the template for the column menu and filter, including the button.
				menuTemplate: undefined,

				//Set this to false if you only want one item selected at a time
				multiSelect: true,

				// pagingOptions -
				pagingOptions: {
					// pageSizes: list of available page sizes.
					pageSizes: [250, 500, 1000],
					//pageSize: currently selected page size.
					pageSize: 250,
					//currentPage: the uhm... current page.
					currentPage: 1
				},

				//the selection checkbox is pinned to the left side of the viewport or not.
				pinSelectionCheckbox: false,

				//Array of plugin functions to register in ng-grid
				plugins: [],

				//User defined unique ID field that allows for better handling of selections and for server-side paging
				primaryKey: undefined,

				//Row height of rows in grid.
				rowHeight: 30,

				//Define a row template to customize output. See github wiki for more details.
				rowTemplate: undefined,

				//all of the items selected in the grid. In single select mode there will only be one item in the array.
				selectedItems: [],

				//Disable row selections by clicking on the row and only when the checkbox is clicked.
				selectWithCheckboxOnly: false,

				/*Enables menu to choose which columns to display and group by.
				 If both showColumnMenu and showFilter are false the menu button will not display.*/
				showColumnMenu: false,

				/*Enables display of the filterbox in the column menu.
				 If both showColumnMenu and showFilter are false the menu button will not display.*/
				showFilter: false,

				//Show or hide the footer alltogether the footer is enabled by default
				showFooter: false,

				//Show the dropzone for drag and drop grouping
				showGroupPanel: false,

				//Row selection check boxes appear as the first column.
				showSelectionCheckbox: false,

				/*Define a sortInfo object to specify a default sorting state.
				 You can also observe this variable to utilize server-side sorting (see useExternalSorting).
				 Syntax is sortinfo: { fields: ['fieldName1',' fieldName2'], direction: 'ASC'/'asc' || 'desc'/'DESC'}*/
				sortInfo: {fields: [], columns: [], directions: [] },

				//Set the tab index of the Vieport.
				tabIndex: -1,

				//totalServerItems: Total items are on the server.
				totalServerItems: 0,

				/*Prevents the internal sorting from executing.
				 The sortInfo object will be updated with the sorting information so you can handle sorting (see sortInfo)*/
				useExternalSorting: false,

				/*i18n language support. choose from the installed or included languages, en, fr, sp, etc...*/
				i18n: 'en',

				//the threshold in rows to force virtualization on
				virtualizationThreshold: 50,

				// Don't handle tabs, so they can be used to navigate between controls.
				noTabInterference: false
			},
			self = this;
		self.maxCanvasHt = 0;
		//self vars
		self.config = $.extend(defaults, window.ngGrid.config, options);

		// override conflicting settings
		self.config.showSelectionCheckbox = (self.config.showSelectionCheckbox && self.config.enableColumnHeavyVirt === false);
		self.config.enablePinning = (self.config.enablePinning && self.config.enableColumnHeavyVirt === false);
		self.config.selectWithCheckboxOnly = (self.config.selectWithCheckboxOnly && self.config.showSelectionCheckbox !== false);
		self.config.pinSelectionCheckbox = self.config.enablePinning;

		if (typeof options.columnDefs === "string") {
			self.config.columnDefs = $scope.$eval(options.columnDefs);
		}
		self.rowCache = [];
		self.rowMap = [];
		self.gridId = "ng" + $utils.newId();
		self.$root = null; //this is the root element that is passed in with the binding handler
		self.$groupPanel = null;
		self.$topPanel = null;
		self.$headerContainer = null;
		self.$headerScroller = null;
		self.$headers = null;
		self.$viewport = null;
		self.$canvas = null;
		self.rootDim = self.config.gridDim;
		self.data = [];
		self.lateBindColumns = false;
		self.filteredRows = [];

		self.initTemplates = function() {
			var templates = ['rowTemplate', 'aggregateTemplate', 'headerRowTemplate', 'checkboxCellTemplate', 'checkboxHeaderTemplate', 'menuTemplate', 'footerTemplate'];

			var promises = [];
			angular.forEach(templates, function(template) {
				promises.push( self.getTemplate(template) );
			});

			return $q.all(promises);
		};

		//Templates
		// test templates for urls and get the tempaltes via synchronous ajax calls
		self.getTemplate = function (key) {
			var t = self.config[key];
			var uKey = self.gridId + key + ".html";
			var p = $q.defer();
			if (t && !TEMPLATE_REGEXP.test(t)) {
				$http.get(t, {
					cache: $templateCache
				})
					.success(function(data){
						$templateCache.put(uKey, data);
						p.resolve();
					})
					.error(function(err){
						p.reject("Could not load template: " + t);
					});
			} else if (t) {
				$templateCache.put(uKey, t);
				p.resolve();
			} else {
				var dKey = key + ".html";
				$templateCache.put(uKey, $templateCache.get(dKey));
				p.resolve();
			}

			return p.promise;
		};

		if (typeof self.config.data === "object") {
			self.data = self.config.data; // we cannot watch for updates if you don't pass the string name
		}
		self.calcMaxCanvasHeight = function() {
			var calculatedHeight;
			if(self.config.groups.length > 0){
				calculatedHeight = self.rowFactory.parsedData.filter(function(e) {
					return !e[NG_HIDDEN];
				}).length * self.config.rowHeight;
			} else {
				calculatedHeight = self.filteredRows.length * self.config.rowHeight;
			}
			return calculatedHeight;
		};
		self.elementDims = {
			scrollW: 0,
			scrollH: 0,
			rowIndexCellW: 25,
			rowSelectedCellW: 25,
			rootMaxW: 0,
			rootMaxH: 0
		};
		//self funcs
		self.setRenderedRows = function (newRows) {
			$scope.renderedRows.length = newRows.length;
			for (var i = 0; i < newRows.length; i++) {
				if (!$scope.renderedRows[i] || (newRows[i].isAggRow || $scope.renderedRows[i].isAggRow)) {
					$scope.renderedRows[i] = newRows[i].copy();
					$scope.renderedRows[i].collapsed = newRows[i].collapsed;
					if (!newRows[i].isAggRow) {
						$scope.renderedRows[i].setVars(newRows[i]);
					}
				} else {
					$scope.renderedRows[i].setVars(newRows[i]);
				}
				$scope.renderedRows[i].rowIndex = newRows[i].rowIndex;
				$scope.renderedRows[i].offsetTop = newRows[i].offsetTop;
				$scope.renderedRows[i].selected = newRows[i].selected;
				newRows[i].renderedRowIndex = i;
			}
			self.refreshDomSizes();
			$scope.$emit('ngGridEventRows', newRows);
		};
		self.minRowsToRender = function() {
			var viewportH = $scope.viewportDimHeight() || 1;
			return Math.floor(viewportH / self.config.rowHeight);
		};
		self.refreshDomSizes = function() {
			var dim = new ngDimension();
			dim.outerWidth = self.elementDims.rootMaxW;
			dim.outerHeight = self.elementDims.rootMaxH;
			self.rootDim = dim;
			self.maxCanvasHt = self.calcMaxCanvasHeight();
		};
		self.buildColumnDefsFromData = function () {
			self.config.columnDefs = [];
			var item = self.data[0];
			if (!item) {
				self.lateBoundColumns = true;
				return;
			}
			$utils.forIn(item, function (prop, propName) {
				if (self.config.excludeProperties.indexOf(propName) === -1) {
					self.config.columnDefs.push({
						field: propName
					});
				}
			});
		};
		self.buildColumns = function() {
			var columnDefs = self.config.columnDefs,
				cols = [];
			if (!columnDefs) {
				self.buildColumnDefsFromData();
				columnDefs = self.config.columnDefs;
			}
			if (self.config.showSelectionCheckbox) {
				cols.push(new ngColumn({
					colDef: {
						field: '\u2714',
						width: self.elementDims.rowSelectedCellW,
						sortable: false,
						resizable: false,
						groupable: false,
						headerCellTemplate: $templateCache.get($scope.gridId + 'checkboxHeaderTemplate.html'),
						cellTemplate: $templateCache.get($scope.gridId + 'checkboxCellTemplate.html'),
						pinned: self.config.pinSelectionCheckbox
					},
					index: 0,
					headerRowHeight: self.config.headerRowHeight,
					sortCallback: self.sortData,
					resizeOnDataCallback: self.resizeOnData,
					enableResize: self.config.enableColumnResize,
					enableSort: self.config.enableSorting,
					enablePinning: self.config.enablePinning
				}, $scope, self, domUtilityService, $templateCache, $utils));
			}
			if (columnDefs.length > 0) {
				var checkboxOffset = self.config.showSelectionCheckbox ? 1 : 0;
				var groupOffset = $scope.configGroups.length;
				$scope.configGroups.length = 0;
				angular.forEach(columnDefs, function(colDef, i) {
					i += checkboxOffset;
					var column = new ngColumn({
						colDef: colDef,
						index: i + groupOffset,
						originalIndex: i,
						headerRowHeight: self.config.headerRowHeight,
						sortCallback: self.sortData,
						resizeOnDataCallback: self.resizeOnData,
						enableResize: self.config.enableColumnResize,
						enableSort: self.config.enableSorting,
						enablePinning: self.config.enablePinning,
						enableCellEdit: self.config.enableCellEdit || self.config.enableCellEditOnFocus,
						cellEditableCondition: self.config.cellEditableCondition
					}, $scope, self, domUtilityService, $templateCache, $utils);
					var indx = self.config.groups.indexOf(colDef.field);
					if (indx !== -1) {
						column.isGroupedBy = true;
						$scope.configGroups.splice(indx, 0, column);
						column.groupIndex = $scope.configGroups.length;
					}
					cols.push(column);
				});
				$scope.columns = cols;
				if (self.config.groups.length > 0) {
					self.rowFactory.getGrouping(self.config.groups);
				}
			}
		};
		self.configureColumnWidths = function() {
			var asterisksArray = [],
				percentArray = [],
				asteriskNum = 0,
				totalWidth = 0;

			// When rearranging columns, their index in $scope.columns will no longer match the original column order from columnDefs causing
			// their width config to be out of sync. We can use "originalIndex" on the ngColumns to get hold of the correct setup from columnDefs, but to
			// avoid O(n) lookups in $scope.columns per column we setup a map.
			var indexMap = {};
			// Build a map of columnDefs column indices -> ngColumn indices (via the "originalIndex" property on ngColumns).
			angular.forEach($scope.columns, function(ngCol, i) {
				// Disregard columns created by grouping (the grouping columns don't match a column from columnDefs)
				if (!$utils.isNullOrUndefined(ngCol.originalIndex)) {
					var origIndex = ngCol.originalIndex;
					if (self.config.showSelectionCheckbox) {
						//if visible, takes up 25 pixels
						if(ngCol.originalIndex === 0 && ngCol.visible){
							totalWidth += 25;
						}
						// The originalIndex will be offset 1 when including the selection column
						origIndex--;
					}
					indexMap[origIndex] = i;
				}
			});

			angular.forEach(self.config.columnDefs, function(colDef, i) {
				// Get the ngColumn that matches the current column from columnDefs
				var ngColumn = $scope.columns[indexMap[i]];

				colDef.index = i;

				var isPercent = false, t;
				//if width is not defined, set it to a single star
				if ($utils.isNullOrUndefined(colDef.width)) {
					colDef.width = "*";
				} else { // get column width
					isPercent = isNaN(colDef.width) ? $utils.endsWith(colDef.width, "%") : false;
					t = isPercent ? colDef.width : parseInt(colDef.width, 10);
				}

				// check if it is a number
				if (isNaN(t) && !$scope.hasUserChangedGridColumnWidths) {
					t = colDef.width;
					// figure out if the width is defined or if we need to calculate it
					if (t === 'auto') { // set it for now until we have data and subscribe when it changes so we can set the width.
						ngColumn.width = ngColumn.minWidth;
						totalWidth += ngColumn.width;
						var temp = ngColumn;

						$scope.$on('$destroy', $scope.$on("ngGridEventData", function () {
							self.resizeOnData(temp);
						}));

						return;
					} else if (t.indexOf("*") !== -1) { //  we need to save it until the end to do the calulations on the remaining width.
						if (ngColumn.visible !== false) {
							asteriskNum += t.length;
						}
						asterisksArray.push(colDef);
						return;
					} else if (isPercent) { // If the width is a percentage, save it until the very last.
						percentArray.push(colDef);
						return;
					} else { // we can't parse the width so lets throw an error.
						throw "unable to parse column width, use percentage (\"10%\",\"20%\", etc...) or \"*\" to use remaining width of grid";
					}
				} else if (ngColumn.visible !== false) {
					totalWidth += ngColumn.width = parseInt(ngColumn.width, 10);
				}
			});

			// Now we check if we saved any percentage columns for calculating last
			if (percentArray.length > 0) {
				//If they specificy for maintain column ratios to be false in grid config, then it will remain false. If not specifiied or true, will be true.
				self.config.maintainColumnRatios = self.config.maintainColumnRatios !== false;
				// If any columns with % widths have been hidden, then let other % based columns use their width
				var percentWidth = 0; // The total % value for all columns setting their width using % (will e.g. be 40 for 2 columns with 20% each)
				var hiddenPercent = 0; // The total % value for all columns setting their width using %, but which have been hidden
				angular.forEach(percentArray, function(colDef) {
					// Get the ngColumn that matches the current column from columnDefs
					var ngColumn = $scope.columns[indexMap[colDef.index]];
					var percent = parseFloat(colDef.width) / 100;
					percentWidth += percent;

					if (!ngColumn.visible) {
						hiddenPercent += percent;
					}
				});
				var percentWidthUsed = percentWidth - hiddenPercent;

				// do the math
				angular.forEach(percentArray, function(colDef) {
					// Get the ngColumn that matches the current column from columnDefs
					var ngColumn = $scope.columns[indexMap[colDef.index]];

					// Calc the % relative to the amount of % reserved for the visible columns (that use % based widths)
					var percent = parseFloat(colDef.width) / 100;
					if (hiddenPercent > 0) {
						percent = percent / percentWidthUsed;
					}
					else {
						percent = percent / percentWidth;
					}

					var pixelsForPercentBasedWidth = self.rootDim.outerWidth * percentWidth;
					ngColumn.width = pixelsForPercentBasedWidth * percent;
					totalWidth += ngColumn.width;
				});
			}

			// check if we saved any asterisk columns for calculating later
			if (asterisksArray.length > 0) {
				//If they specificy for maintain column ratios to be false in grid config, then it will remain false. If not specifiied or true, will be true.
				self.config.maintainColumnRatios = self.config.maintainColumnRatios !== false;
				// get the remaining width
				var remainingWidth = self.rootDim.outerWidth - totalWidth;
				// are we overflowing vertically?
				if (self.maxCanvasHt > $scope.viewportDimHeight()) {
					//compensate for scrollbar
					remainingWidth -= domUtilityService.ScrollW;
				}
				// calculate the weight of each asterisk rounded down
				var asteriskVal = Math.floor(remainingWidth / asteriskNum);

				// set the width of each column based on the number of stars
				angular.forEach(asterisksArray, function(colDef, i) {
					// Get the ngColumn that matches the current column from columnDefs
					var ngColumn = $scope.columns[indexMap[colDef.index]];
					ngColumn.width = asteriskVal * colDef.width.length;
					if (ngColumn.visible !== false) {
						totalWidth += ngColumn.width;
					}

					var isLast = (i === (asterisksArray.length - 1));
					//if last asterisk and doesn't fill width of grid, add the difference
					if(isLast && totalWidth < self.rootDim.outerWidth){
						var gridWidthDifference = self.rootDim.outerWidth - totalWidth;
						if(self.maxCanvasHt > $scope.viewportDimHeight()){
							gridWidthDifference -= domUtilityService.ScrollW;
						}
						ngColumn.width += gridWidthDifference;
					}
				});
			}
		};
		self.init = function() {
			return self.initTemplates().then(function(){
				//factories and services
				$scope.selectionProvider = new ngSelectionProvider(self, $scope, $parse);
				$scope.domAccessProvider = new ngDomAccessProvider(self);
				self.rowFactory = new ngRowFactory(self, $scope, domUtilityService, $templateCache, $utils);
				self.searchProvider = new ngSearchProvider($scope, self, $filter);
				self.styleProvider = new ngStyleProvider($scope, self);
				$scope.$on('$destroy', $scope.$watch('configGroups', function(a) {
					var tempArr = [];
					angular.forEach(a, function(item) {
						tempArr.push(item.field || item);
					});
					self.config.groups = tempArr;
					self.rowFactory.filteredRowsChanged();
					$scope.$emit('ngGridEventGroups', a);
				}, true));
				$scope.$on('$destroy', $scope.$watch('columns', function (a) {
					if(!$scope.isColumnResizing){
						domUtilityService.RebuildGrid($scope, self);
					}
					$scope.$emit('ngGridEventColumns', a);
				}, true));
				$scope.$on('$destroy', $scope.$watch(function() {
					return options.i18n;
				}, function(newLang) {
					$utils.seti18n($scope, newLang);
				}));
				self.maxCanvasHt = self.calcMaxCanvasHeight();

				if (self.config.sortInfo.fields && self.config.sortInfo.fields.length > 0) {
					$scope.$on('$destroy', $scope.$watch(function() {
						return self.config.sortInfo;
					}, function(sortInfo){
						if (!sortService.isSorting) {
							self.sortColumnsInit();
							$scope.$emit('ngGridEventSorted', self.config.sortInfo);
						}
					}, true));
				}
			});

			// var p = $q.defer();
			// p.resolve();
			// return p.promise;
		};

		self.resizeOnData = function(col) {
			// we calculate the longest data.
			var longest = col.minWidth;
			var arr = $utils.getElementsByClassName('col' + col.index);
			angular.forEach(arr, function(elem, index) {
				var i;
				if (index === 0) {
					var kgHeaderText = $(elem).find('.ngHeaderText');
					i = $utils.visualLength(kgHeaderText) + 10; // +10 some margin
				} else {
					var ngCellText = $(elem).find('.ngCellText');
					i = $utils.visualLength(ngCellText) + 10; // +10 some margin
				}
				if (i > longest) {
					longest = i;
				}
			});
			col.width = col.longest = Math.min(col.maxWidth, longest + 7); // + 7 px to make it look decent.
			domUtilityService.BuildStyles($scope, self, true);
		};
		self.lastSortedColumns = [];
		self.sortData = function(col, evt) {
			if (evt && evt.shiftKey && self.config.sortInfo) {
				var indx = self.config.sortInfo.columns.indexOf(col);
				if (indx === -1) {
					if (self.config.sortInfo.columns.length === 1) {
						self.config.sortInfo.columns[0].sortPriority = 1;
					}
					self.config.sortInfo.columns.push(col);
					col.sortPriority = self.config.sortInfo.columns.length;
					self.config.sortInfo.fields.push(col.field);
					self.config.sortInfo.directions.push(col.sortDirection);
					self.lastSortedColumns.push(col);
				} else {
					self.config.sortInfo.directions[indx] = col.sortDirection;
				}
			} else if (!self.config.useExternalSorting || (self.config.useExternalSorting && self.config.sortInfo )) {
				var isArr = $.isArray(col);
				self.config.sortInfo.columns.length = 0;
				self.config.sortInfo.fields.length = 0;
				self.config.sortInfo.directions.length = 0;
				var push = function (c) {
					self.config.sortInfo.columns.push(c);
					self.config.sortInfo.fields.push(c.field);
					self.config.sortInfo.directions.push(c.sortDirection);
					self.lastSortedColumns.push(c);
				};
				if (isArr) {
					angular.forEach(col, function (c, i) {
						c.sortPriority = i + 1;
						push(c);
					});
				} else {
					self.clearSortingData(col);
					col.sortPriority = undefined;
					push(col);
				}

				self.sortActual();
				self.searchProvider.evalFilter();
				$scope.$emit('ngGridEventSorted', self.config.sortInfo);
			}
		};
		self.sortColumnsInit = function() {
			if (self.config.sortInfo.columns) {
				self.config.sortInfo.columns.length = 0;
			} else {
				self.config.sortInfo.columns = [];
			}

			var cols = [];
			angular.forEach($scope.columns, function(c) {
				var i = self.config.sortInfo.fields.indexOf(c.field);
				if (i !== -1) {
					c.sortDirection = self.config.sortInfo.directions[i] || 'asc';
					cols[i] = c;
				}
			});

			if(cols.length === 1){
				self.sortData(cols[0]);
			}else{
				self.sortData(cols);
			}
		};
		self.sortActual = function() {
			if (!self.config.useExternalSorting) {
				var tempData = self.data.slice(0);
				angular.forEach(tempData, function(item, i) {
					var e = self.rowMap[i];
					if (e !== undefined) {
						var v = self.rowCache[e];
						if (v !== undefined) {
							item.preSortSelected = v.selected;
							item.preSortIndex = i;
						}
					}
				});
				sortService.Sort(self.config.sortInfo, tempData);
				angular.forEach(tempData, function(item, i) {
					self.rowCache[i].entity = item;
					self.rowCache[i].selected = item.preSortSelected;
					self.rowMap[item.preSortIndex] = i;
					delete item.preSortSelected;
					delete item.preSortIndex;
				});
			}
		};

		self.clearSortingData = function (col) {
			if (!col) {
				angular.forEach(self.lastSortedColumns, function (c) {
					c.sortDirection = "";
					c.sortPriority = null;
				});
				self.lastSortedColumns = [];
			} else {
				angular.forEach(self.lastSortedColumns, function (c) {
					if (col.index !== c.index) {
						c.sortDirection = "";
						c.sortPriority = null;
					}
				});
				self.lastSortedColumns[0] = col;
				self.lastSortedColumns.length = 1;
			}
		};
		self.fixColumnIndexes = function() {
			//fix column indexes
			for (var i = 0; i < $scope.columns.length; i++) {
				$scope.columns[i].index = i;
			}
		};
		self.fixGroupIndexes = function() {
			angular.forEach($scope.configGroups, function(item, i) {
				item.groupIndex = i + 1;
			});
		};
		//$scope vars
		$scope.elementsNeedMeasuring = true;
		$scope.columns = [];
		$scope.renderedRows = [];
		$scope.renderedColumns = [];
		$scope.headerRow = null;
		$scope.rowHeight = self.config.rowHeight;
		$scope.jqueryUITheme = self.config.jqueryUITheme;
		$scope.showSelectionCheckbox = self.config.showSelectionCheckbox;
		$scope.enableCellSelection = self.config.enableCellSelection;
		$scope.enableCellEditOnFocus = self.config.enableCellEditOnFocus;
		$scope.footer = null;
		$scope.selectedItems = self.config.selectedItems;
		$scope.multiSelect = self.config.multiSelect;
		$scope.showFooter = self.config.showFooter;
		$scope.footerRowHeight = $scope.showFooter ? self.config.footerRowHeight : 0;
		$scope.showColumnMenu = self.config.showColumnMenu;
		$scope.forceSyncScrolling = self.config.forceSyncScrolling;
		$scope.showMenu = false;
		$scope.configGroups = [];
		$scope.gridId = self.gridId;
		//Paging
		$scope.enablePaging = self.config.enablePaging;
		$scope.pagingOptions = self.config.pagingOptions;

		//i18n support
		$scope.i18n = {};
		$utils.seti18n($scope, self.config.i18n);
		$scope.adjustScrollLeft = function (scrollLeft) {
			var colwidths = 0,
				totalLeft = 0,
				x = $scope.columns.length,
				newCols = [],
				dcv = !self.config.enableColumnHeavyVirt;
			var r = 0;
			var addCol = function (c) {
				if (dcv) {
					newCols.push(c);
				} else {
					if (!$scope.renderedColumns[r]) {
						$scope.renderedColumns[r] = c.copy();
					} else {
						$scope.renderedColumns[r].setVars(c);
					}
				}
				r++;
			};
			for (var i = 0; i < x; i++) {
				var col = $scope.columns[i];
				if (col.visible !== false) {
					var w = col.width + colwidths;
					if (col.pinned) {
						addCol(col);
						var newLeft = i > 0 ? (scrollLeft + totalLeft) : scrollLeft;
						domUtilityService.setColLeft(col, newLeft, self);
						totalLeft += col.width;
					} else {
						if (w >= scrollLeft) {
							if (colwidths <= scrollLeft + self.rootDim.outerWidth) {
								addCol(col);
							}
						}
					}
					colwidths += col.width;
				}
			}
			if (dcv) {
				$scope.renderedColumns = newCols;
			}
		};
		self.prevScrollTop = 0;
		self.prevScrollIndex = 0;
		$scope.adjustScrollTop = function(scrollTop, force) {
			if (self.prevScrollTop === scrollTop && !force) {
				return;
			}
			if (scrollTop > 0 && self.$viewport[0].scrollHeight - scrollTop <= self.$viewport.outerHeight()) {
				$scope.$emit('ngGridEventScroll');
			}
			var rowIndex = Math.floor(scrollTop / self.config.rowHeight);
			var newRange;
			if (self.filteredRows.length > self.config.virtualizationThreshold) {
				// Have we hit the threshold going down?
				if (self.prevScrollTop < scrollTop && rowIndex < self.prevScrollIndex + SCROLL_THRESHOLD) {
					return;
				}
				//Have we hit the threshold going up?
				if (self.prevScrollTop > scrollTop && rowIndex > self.prevScrollIndex - SCROLL_THRESHOLD) {
					return;
				}
				newRange = new ngRange(Math.max(0, rowIndex - EXCESS_ROWS), rowIndex + self.minRowsToRender() + EXCESS_ROWS);
			} else {
				var maxLen = $scope.configGroups.length > 0 ? self.rowFactory.parsedData.length : self.filteredRows.length;
				newRange = new ngRange(0, Math.max(maxLen, self.minRowsToRender() + EXCESS_ROWS));
			}
			self.prevScrollTop = scrollTop;
			self.rowFactory.UpdateViewableRange(newRange);
			self.prevScrollIndex = rowIndex;
		};

		//scope funcs
		$scope.toggleShowMenu = function() {
			$scope.showMenu = !$scope.showMenu;
		};
		$scope.toggleSelectAll = function(state, selectOnlyVisible) {
			$scope.selectionProvider.toggleSelectAll(state, false, selectOnlyVisible);
		};
		$scope.totalFilteredItemsLength = function() {
			return self.filteredRows.length;
		};
		$scope.showGroupPanel = function() {
			return self.config.showGroupPanel;
		};
		$scope.topPanelHeight = function() {
			return self.config.showGroupPanel === true ? self.config.headerRowHeight + 32 : self.config.headerRowHeight;
		};

		$scope.viewportDimHeight = function() {
			return Math.max(0, self.rootDim.outerHeight - $scope.topPanelHeight() - $scope.footerRowHeight - 2);
		};
		$scope.groupBy = function (col) {
			if (self.data.length < 1 || !col.groupable  || !col.field) {
				return;
			}
			//first sort the column
			if (!col.sortDirection) {
				col.sort({ shiftKey: $scope.configGroups.length > 0 ? true : false });
			}

			var indx = $scope.configGroups.indexOf(col);
			if (indx === -1) {
				col.isGroupedBy = true;
				$scope.configGroups.push(col);
				col.groupIndex = $scope.configGroups.length;
			} else {
				$scope.removeGroup(indx);
			}
			self.$viewport.scrollTop(0);
			domUtilityService.digest($scope);
		};
		$scope.removeGroup = function(index) {
			var col = $scope.columns.filter(function(item) {
				return item.groupIndex === (index + 1);
			})[0];
			col.isGroupedBy = false;
			col.groupIndex = 0;
			if ($scope.columns[index].isAggCol) {
				$scope.columns.splice(index, 1);
				$scope.configGroups.splice(index, 1);
				self.fixGroupIndexes();
			}
			if ($scope.configGroups.length === 0) {
				self.fixColumnIndexes();
				domUtilityService.digest($scope);
			}
			$scope.adjustScrollLeft(0);
		};
		$scope.togglePin = function (col) {
			var indexFrom = col.index;
			var indexTo = 0;
			for (var i = 0; i < $scope.columns.length; i++) {
				if (!$scope.columns[i].pinned) {
					break;
				}
				indexTo++;
			}
			if (col.pinned) {
				indexTo = Math.max(col.originalIndex, indexTo - 1);
			}
			col.pinned = !col.pinned;
			// Splice the columns
			$scope.columns.splice(indexFrom, 1);
			$scope.columns.splice(indexTo, 0, col);
			self.fixColumnIndexes();
			// Finally, rebuild the CSS styles.
			domUtilityService.BuildStyles($scope, self, true);
			self.$viewport.scrollLeft(self.$viewport.scrollLeft() - col.width);
		};
		$scope.totalRowWidth = function() {
			var totalWidth = 0,
				cols = $scope.columns;
			for (var i = 0; i < cols.length; i++) {
				if (cols[i].visible !== false) {
					totalWidth += cols[i].width;
				}
			}
			return totalWidth;
		};
		$scope.headerScrollerDim = function() {
			var viewportH = $scope.viewportDimHeight(),
				maxHeight = self.maxCanvasHt,
				vScrollBarIsOpen = (maxHeight > viewportH),
				newDim = new ngDimension();

			newDim.autoFitHeight = true;
			newDim.outerWidth = $scope.totalRowWidth();
			if (vScrollBarIsOpen) {
				newDim.outerWidth += self.elementDims.scrollW;
			} else if ((maxHeight - viewportH) <= self.elementDims.scrollH) { //if the horizontal scroll is open it forces the viewport to be smaller
				newDim.outerWidth += self.elementDims.scrollW;
			}
			return newDim;
		};
	};

	var ngRange = function (top, bottom) {
		this.topRow = top;
		this.bottomRow = bottom;
	};
	var ngRow = function (entity, config, selectionProvider, rowIndex, $utils) {
		this.entity = entity;
		this.config = config;
		this.selectionProvider = selectionProvider;
		this.rowIndex = rowIndex;
		this.utils = $utils;
		this.selected = selectionProvider.getSelection(entity);
		this.cursor = this.config.enableRowSelection && !this.config.selectWithCheckboxOnly ? 'pointer' : 'default';
		this.beforeSelectionChange = config.beforeSelectionChangeCallback;
		this.afterSelectionChange = config.afterSelectionChangeCallback;
		this.offsetTop = this.rowIndex * config.rowHeight;
		this.rowDisplayIndex = 0;
	};

	ngRow.prototype.setSelection = function (isSelected) {
		this.selectionProvider.setSelection(this, isSelected);
		this.selectionProvider.lastClickedRow = this;
	};
	ngRow.prototype.continueSelection = function (event) {
		this.selectionProvider.ChangeSelection(this, event);
	};
	ngRow.prototype.ensureEntity = function (expected) {
		if (this.entity !== expected) {
			// Update the entity and determine our selected property
			this.entity = expected;
			this.selected = this.selectionProvider.getSelection(this.entity);
		}
	};
	ngRow.prototype.toggleSelected = function (event) {
		if (!this.config.enableRowSelection && !this.config.enableCellSelection) {
			return true;
		}
		var element = event.target || event;
		//check and make sure its not the bubbling up of our checked 'click' event
		if (element.type === "checkbox" && element.parentElement.className !== "ngSelectionCell ng-scope") {
			return true;
		}
		if (this.config.selectWithCheckboxOnly && element.type !== "checkbox") {
			this.selectionProvider.lastClickedRow = this;
			return true;
		}
		if (this.beforeSelectionChange(this, event)) {
			this.continueSelection(event);
		}
		return false;
	};
	ngRow.prototype.alternatingRowClass = function () {
		var isEven = (this.rowIndex % 2) === 0;
		var classes = {
			'ngRow' : true,
			'selected': this.selected,
			'even': isEven,
			'odd': !isEven,
			'ui-state-default': this.config.jqueryUITheme && isEven,
			'ui-state-active': this.config.jqueryUITheme && !isEven
		};
		return classes;
	};
	ngRow.prototype.getProperty = function (path) {
		return this.utils.evalProperty(this.entity, path);
	};
	ngRow.prototype.copy = function () {
		this.clone = new ngRow(this.entity, this.config, this.selectionProvider, this.rowIndex, this.utils);
		this.clone.isClone = true;
		this.clone.elm = this.elm;
		this.clone.orig = this;
		return this.clone;
	};
	ngRow.prototype.setVars = function (fromRow) {
		fromRow.clone = this;
		this.entity = fromRow.entity;
		this.selected = fromRow.selected;
		this.orig = fromRow;
	};
	var ngRowFactory = function (grid, $scope, domUtilityService, $templateCache, $utils) {
		var self = this;
		// we cache rows when they are built, and then blow the cache away when sorting
		self.aggCache = {};
		self.parentCache = []; // Used for grouping and is cleared each time groups are calulated.
		self.dataChanged = true;
		self.parsedData = [];
		self.rowConfig = {};
		self.selectionProvider = $scope.selectionProvider;
		self.rowHeight = 30;
		self.numberOfAggregates = 0;
		self.groupedData = undefined;
		self.rowHeight = grid.config.rowHeight;
		self.rowConfig = {
			enableRowSelection: grid.config.enableRowSelection,
			rowClasses: grid.config.rowClasses,
			selectedItems: $scope.selectedItems,
			selectWithCheckboxOnly: grid.config.selectWithCheckboxOnly,
			beforeSelectionChangeCallback: grid.config.beforeSelectionChange,
			afterSelectionChangeCallback: grid.config.afterSelectionChange,
			jqueryUITheme: grid.config.jqueryUITheme,
			enableCellSelection: grid.config.enableCellSelection,
			rowHeight: grid.config.rowHeight
		};

		self.renderedRange = new ngRange(0, grid.minRowsToRender() + EXCESS_ROWS);

		// @entity - the data item
		// @rowIndex - the index of the row
		self.buildEntityRow = function(entity, rowIndex) {
			// build the row
			return new ngRow(entity, self.rowConfig, self.selectionProvider, rowIndex, $utils);
		};

		self.buildAggregateRow = function(aggEntity, rowIndex) {
			var agg = self.aggCache[aggEntity.aggIndex]; // first check to see if we've already built it
			if (!agg) {
				// build the row
				agg = new ngAggregate(aggEntity, self, self.rowConfig.rowHeight, grid.config.groupsCollapsedByDefault);
				self.aggCache[aggEntity.aggIndex] = agg;
			}
			agg.rowIndex = rowIndex;
			agg.offsetTop = rowIndex * self.rowConfig.rowHeight;
			return agg;
		};
		self.UpdateViewableRange = function(newRange) {
			self.renderedRange = newRange;
			self.renderedChange();
		};
		self.filteredRowsChanged = function() {
			// check for latebound autogenerated columns
			if (grid.lateBoundColumns && grid.filteredRows.length > 0) {
				grid.config.columnDefs = undefined;
				grid.buildColumns();
				grid.lateBoundColumns = false;
				$scope.$evalAsync(function() {
					$scope.adjustScrollLeft(0);
				});
			}
			self.dataChanged = true;
			if (grid.config.groups.length > 0) {
				self.getGrouping(grid.config.groups);
			}
			self.UpdateViewableRange(self.renderedRange);
		};

		self.renderedChange = function() {
			if (!self.groupedData || grid.config.groups.length < 1) {
				self.renderedChangeNoGroups();
				grid.refreshDomSizes();
				return;
			}
			self.wasGrouped = true;
			self.parentCache = [];
			var x = 0;
			var temp = self.parsedData.filter(function (e) {
				if (e.isAggRow) {
					if (e.parent && e.parent.collapsed) {
						return false;
					}
					return true;
				}
				if (!e[NG_HIDDEN]) {
					e.rowIndex = x++;
				}
				return !e[NG_HIDDEN];
			});
			self.totalRows = temp.length;
			var rowArr = [];
			for (var i = self.renderedRange.topRow; i < self.renderedRange.bottomRow; i++) {
				if (temp[i]) {
					temp[i].offsetTop = i * grid.config.rowHeight;
					rowArr.push(temp[i]);
				}
			}
			grid.setRenderedRows(rowArr);
		};

		self.renderedChangeNoGroups = function () {
			var rowArr = [];
			for (var i = self.renderedRange.topRow; i < self.renderedRange.bottomRow; i++) {
				if (grid.filteredRows[i]) {
					grid.filteredRows[i].rowIndex = i;
					grid.filteredRows[i].offsetTop = i * grid.config.rowHeight;
					rowArr.push(grid.filteredRows[i]);
				}
			}
			grid.setRenderedRows(rowArr);
		};

		self.fixRowCache = function () {
			var newLen = grid.data.length;
			var diff = newLen - grid.rowCache.length;
			if (diff < 0) {
				grid.rowCache.length = grid.rowMap.length = newLen;
			} else {
				for (var i = grid.rowCache.length; i < newLen; i++) {
					grid.rowCache[i] = grid.rowFactory.buildEntityRow(grid.data[i], i);
				}
			}
		};

		//magical recursion. it works. I swear it. I figured it out in the shower one day.
		self.parseGroupData = function(g) {
			if (g.values) {
				for (var x = 0; x < g.values.length; x++){
					// get the last parent in the array because that's where our children want to be
					self.parentCache[self.parentCache.length - 1].children.push(g.values[x]);
					//add the row to our return array
					self.parsedData.push(g.values[x]);
				}
			} else {
				for (var prop in g) {
					// exclude the meta properties.
					if (prop === NG_FIELD || prop === NG_DEPTH || prop === NG_COLUMN) {
						continue;
					} else if (g.hasOwnProperty(prop)) {
						//build the aggregate row
						var agg = self.buildAggregateRow({
							gField: g[NG_FIELD],
							gLabel: prop,
							gDepth: g[NG_DEPTH],
							isAggRow: true,
							'_ng_hidden_': false,
							children: [],
							aggChildren: [],
							aggIndex: self.numberOfAggregates,
							aggLabelFilter: g[NG_COLUMN].aggLabelFilter
						}, 0);
						self.numberOfAggregates++;
						//set the aggregate parent to the parent in the array that is one less deep.
						agg.parent = self.parentCache[agg.depth - 1];
						// if we have a parent, set the parent to not be collapsed and append the current agg to its children
						if (agg.parent) {
							agg.parent.collapsed = false;
							agg.parent.aggChildren.push(agg);
						}
						// add the aggregate row to the parsed data.
						self.parsedData.push(agg);
						// the current aggregate now the parent of the current depth
						self.parentCache[agg.depth] = agg;
						// dig deeper for more aggregates or children.
						self.parseGroupData(g[prop]);
					}
				}
			}
		};
		//Shuffle the data into their respective groupings.
		self.getGrouping = function(groups) {
			self.aggCache = [];
			self.numberOfAggregates = 0;
			self.groupedData = {};
			// Here we set the onmousedown event handler to the header container.
			var rows = grid.filteredRows,
				maxDepth = groups.length,
				cols = $scope.columns;

			function filterCols(cols, group) {
				return cols.filter(function(c) {
					return c.field === group;
				});
			}

			for (var x = 0; x < rows.length; x++) {
				var model = rows[x].entity;
				if (!model) {
					return;
				}
				rows[x][NG_HIDDEN] = grid.config.groupsCollapsedByDefault;
				var ptr = self.groupedData;

				for (var y = 0; y < groups.length; y++) {
					var group = groups[y];

					var col = filterCols(cols, group)[0];

					var val = $utils.evalProperty(model, group);
					val = val ? val.toString() : 'null';
					if (!ptr[val]) {
						ptr[val] = {};
					}
					if (!ptr[NG_FIELD]) {
						ptr[NG_FIELD] = group;
					}
					if (!ptr[NG_DEPTH]) {
						ptr[NG_DEPTH] = y;
					}
					if (!ptr[NG_COLUMN]) {
						ptr[NG_COLUMN] = col;
					}
					ptr = ptr[val];
				}
				if (!ptr.values) {
					ptr.values = [];
				}
				ptr.values.push(rows[x]);
			}

			//moved out of above loops due to if no data initially, but has initial grouping, columns won't be added
			if(cols.length > 0) {
				for (var z = 0; z < groups.length; z++) {
					if (!cols[z].isAggCol && z <= maxDepth) {
						cols.splice(0, 0, new ngColumn({
							colDef: {
								field: '',
								width: 25,
								sortable: false,
								resizable: false,
								headerCellTemplate: '<div class="ngAggHeader"></div>',
								pinned: grid.config.pinSelectionCheckbox

							},
							enablePinning: grid.config.enablePinning,
							isAggCol: true,
							headerRowHeight: grid.config.headerRowHeight

						}, $scope, grid, domUtilityService, $templateCache, $utils));
					}
				}
			}

			grid.fixColumnIndexes();
			$scope.adjustScrollLeft(0);
			self.parsedData.length = 0;
			self.parseGroupData(self.groupedData);
			self.fixRowCache();
		};

		if (grid.config.groups.length > 0 && grid.filteredRows.length > 0) {
			self.getGrouping(grid.config.groups);
		}
	};
	var ngSearchProvider = function ($scope, grid, $filter) {
		var self = this,
			searchConditions = [];

		self.extFilter = grid.config.filterOptions.useExternalFilter;
		$scope.showFilter = grid.config.showFilter;
		$scope.filterText = '';

		self.fieldMap = {};

		var convertToFieldMap = function(obj) {
			var fieldMap = {};
			for (var prop in obj) {
				if (obj.hasOwnProperty(prop)) {
					fieldMap[prop.toLowerCase()] = obj[prop];
				}
			}
			return fieldMap;
		};

		var searchEntireRow = function(condition, item, fieldMap){
			var result;
			for (var prop in item) {
				if (item.hasOwnProperty(prop)) {
					var c = fieldMap[prop.toLowerCase()];
					if (!c) {
						continue;
					}
					var pVal = item[prop];
					if(typeof pVal === 'object' && !(pVal instanceof Date)) {
						var objectFieldMap = convertToFieldMap(c);
						result = searchEntireRow(condition, pVal, objectFieldMap);
						if (result) {
							return true;
						}
					} else {
						var f = null,
							s = null;
						if (c && c.cellFilter) {
							s = c.cellFilter.split(':');
							f = $filter(s[0]);
						}
						if (pVal !== null && pVal !== undefined) {
							if (typeof f === "function") {
								// Have to slice off the quotes the parser would have removed
								var filterRes = f(pVal, s[1].slice(1,-1)).toString();
								result = condition.regex.test(filterRes);
							} else {
								result = condition.regex.test(pVal.toString());
							}
							if (result) {
								return true;
							}
						}
					}
				}
			}
			return false;
		};

		var searchColumn = function(condition, item){
			var result;
			var col = self.fieldMap[condition.columnDisplay];
			if (!col) {
				return false;
			}
			var sp = col.cellFilter.split(':');
			var filter = col.cellFilter ? $filter(sp[0]) : null;
			var value = item[condition.column] || item[col.field.split('.')[0]];
			if (value === null || value === undefined) {
				return false;
			}
			if (typeof filter === "function") {
				var filterResults = filter(typeof value === "object" ? evalObject(value, col.field) : value, sp[1]).toString();
				result = condition.regex.test(filterResults);
			}
			else {
				result = condition.regex.test(typeof value === "object" ? evalObject(value, col.field).toString() : value.toString());
			}
			if (result) {
				return true;
			}
			return false;
		};

		var filterFunc = function(item) {
			for (var x = 0, len = searchConditions.length; x < len; x++) {
				var condition = searchConditions[x];
				var result;
				if (!condition.column) {
					result = searchEntireRow(condition, item, self.fieldMap);
				} else {
					result = searchColumn(condition, item);
				}
				if(!result) {
					return false;
				}
			}
			return true;
		};

		self.evalFilter = function () {
			if (searchConditions.length === 0) {
				grid.filteredRows = grid.rowCache;
			} else {
				grid.filteredRows = grid.rowCache.filter(function(row) {
					return filterFunc(row.entity);
				});
			}
			for (var i = 0; i < grid.filteredRows.length; i++)
			{
				grid.filteredRows[i].rowIndex = i;

			}
			grid.rowFactory.filteredRowsChanged();
		};

		//Traversing through the object to find the value that we want. If fail, then return the original object.
		var evalObject = function (obj, columnName) {
			if (typeof obj !== "object" || typeof columnName !== "string") {
				return obj;
			}
			var args = columnName.split('.');
			var cObj = obj;
			if (args.length > 1) {
				for (var i = 1, len = args.length; i < len; i++) {
					cObj = cObj[args[i]];
					if (!cObj) {
						return obj;
					}
				}
				return cObj;
			}
			return obj;
		};
		var getRegExp = function (str, modifiers) {
			try {
				return new RegExp(str, modifiers);
			} catch (err) {
				//Escape all RegExp metacharacters.
				return new RegExp(str.replace(/(\^|\$|\(|\)|<|>|\[|\]|\{|\}|\\|\||\.|\*|\+|\?)/g, '\\$1'));
			}
		};
		var buildSearchConditions = function (a) {
			//reset.
			searchConditions = [];
			var qStr;
			if (!(qStr = $.trim(a))) {
				return;
			}
			var columnFilters = qStr.split(";");
			for (var i = 0; i < columnFilters.length; i++) {
				var args = columnFilters[i].split(':');
				if (args.length > 1) {
					var columnName = $.trim(args[0]);
					var columnValue = $.trim(args[1]);
					if (columnName && columnValue) {
						searchConditions.push({
							column: columnName,
							columnDisplay: columnName.replace(/\s+/g, '').toLowerCase(),
							regex: getRegExp(columnValue, 'i')
						});
					}
				} else {
					var val = $.trim(args[0]);
					if (val) {
						searchConditions.push({
							column: '',
							regex: getRegExp(val, 'i')
						});
					}
				}
			}
		};

		if (!self.extFilter) {
			$scope.$on('$destroy', $scope.$watch('columns', function (cs) {
				for (var i = 0; i < cs.length; i++) {
					var col = cs[i];
					if (col.field) {
						if(col.field.match(/\./g)){
							var properties = col.field.split('.');
							var currentProperty = self.fieldMap;
							for(var j = 0; j < properties.length - 1; j++) {
								currentProperty[ properties[j] ] =  currentProperty[ properties[j] ] || {};
								currentProperty = currentProperty[properties[j]];
							}
							currentProperty[ properties[properties.length - 1] ] = col;
						} else {
							self.fieldMap[col.field.toLowerCase()] = col;
						}
					}
					if (col.displayName) {
						self.fieldMap[col.displayName.toLowerCase().replace(/\s+/g, '')] = col;
					}
				}
			}));
		}

		$scope.$on('$destroy', $scope.$watch(
			function () {
				return grid.config.filterOptions.filterText;
			},
			function (a) {
				$scope.filterText = a;
			}
		));

		$scope.$on('$destroy', $scope.$watch('filterText', function(a){
			if (!self.extFilter) {
				$scope.$emit('ngGridEventFilter', a);
				buildSearchConditions(a);
				self.evalFilter();
			}
		}));
	};

	var ngSelectionProvider = function (grid, $scope, $parse) {
		var self = this;
		self.multi = grid.config.multiSelect;
		self.selectedItems = grid.config.selectedItems;
		self.selectedIndex = grid.config.selectedIndex;
		self.lastClickedRow = undefined;
		self.ignoreSelectedItemChanges = false; // flag to prevent circular event loops keeping single-select var in sync
		self.pKeyParser = $parse(grid.config.primaryKey);

		// function to manage the selection action of a data item (entity)
		self.ChangeSelection = function (rowItem, evt) {
			// ctrl-click + shift-click multi-selections
			// up/down key navigation in multi-selections
			var charCode = evt.which || evt.keyCode;
			var isUpDownKeyPress = (charCode === 40 || charCode === 38);

			if (evt && evt.shiftKey && !evt.keyCode && self.multi && grid.config.enableRowSelection) {
				if (self.lastClickedRow) {
					var rowsArr;
					if ($scope.configGroups.length > 0) {
						rowsArr = grid.rowFactory.parsedData.filter(function(row) {
							return !row.isAggRow;
						});
					}
					else {
						rowsArr = grid.filteredRows;
					}

					var thisIndx = rowItem.rowIndex;
					var prevIndx = self.lastClickedRowIndex;

					if (thisIndx === prevIndx) {
						return false;
					}

					if (thisIndx < prevIndx) {
						thisIndx = thisIndx ^ prevIndx;
						prevIndx = thisIndx ^ prevIndx;
						thisIndx = thisIndx ^ prevIndx;
						thisIndx--;
					}
					else {
						prevIndx++;
					}

					var rows = [];
					for (; prevIndx <= thisIndx; prevIndx++) {
						rows.push(rowsArr[prevIndx]);
					}

					if (rows[rows.length - 1].beforeSelectionChange(rows, evt)) {
						for (var i = 0; i < rows.length; i++) {
							var ri = rows[i];
							var selectionState = ri.selected;
							ri.selected = !selectionState;
							if (ri.clone) {
								ri.clone.selected = ri.selected;
							}
							var index = self.selectedItems.indexOf(ri.entity);
							if (index === -1) {
								self.selectedItems.push(ri.entity);
							}
							else {
								self.selectedItems.splice(index, 1);
							}
						}
						rows[rows.length - 1].afterSelectionChange(rows, evt);
					}
					self.lastClickedRow = rowItem;
					self.lastClickedRowIndex = rowItem.rowIndex;

					return true;
				}
			}
			else if (!self.multi) {
				if (self.lastClickedRow === rowItem) {
					self.setSelection(self.lastClickedRow, grid.config.keepLastSelected ? true : !rowItem.selected);
				} else {
					if (self.lastClickedRow) {
						self.setSelection(self.lastClickedRow, false);
					}
					self.setSelection(rowItem, !rowItem.selected);
				}
			}
			else if (!evt.keyCode || isUpDownKeyPress && !grid.config.selectWithCheckboxOnly) {
				self.setSelection(rowItem, !rowItem.selected);
			}
			self.lastClickedRow = rowItem;
			self.lastClickedRowIndex = rowItem.rowIndex;
			return true;
		};

		self.getSelection = function (entity) {
			return self.getSelectionIndex(entity) !== -1;
		};

		self.getSelectionIndex = function (entity) {
			var index = -1;
			if (grid.config.primaryKey) {
				var val = self.pKeyParser(entity);
				angular.forEach(self.selectedItems, function (c, k) {
					if (val === self.pKeyParser(c)) {
						index = k;
					}
				});
			}
			else {
				index = self.selectedItems.indexOf(entity);
			}
			return index;
		};

		// just call this func and hand it the rowItem you want to select (or de-select)
		self.setSelection = function (rowItem, isSelected) {
			if(grid.config.enableRowSelection){
				if (!isSelected) {
					var indx = self.getSelectionIndex(rowItem.entity);
					if (indx !== -1) {
						self.selectedItems.splice(indx, 1);
					}
				}
				else {
					if (self.getSelectionIndex(rowItem.entity) === -1) {
						if (!self.multi && self.selectedItems.length > 0) {
							self.toggleSelectAll(false, true);
						}
						self.selectedItems.push(rowItem.entity);
					}
				}
				rowItem.selected = isSelected;
				if (rowItem.orig) {
					rowItem.orig.selected = isSelected;
				}
				if (rowItem.clone) {
					rowItem.clone.selected = isSelected;
				}
				rowItem.afterSelectionChange(rowItem);
			}
		};

		// @return - boolean indicating if all items are selected or not
		// @val - boolean indicating whether to select all/de-select all
		self.toggleSelectAll = function (checkAll, bypass, selectFiltered) {
			var rows = selectFiltered ? grid.filteredRows : grid.rowCache;
			if (bypass || grid.config.beforeSelectionChange(rows, checkAll)) {
				var selectedlength = self.selectedItems.length;
				if (selectedlength > 0) {
					self.selectedItems.length = 0;
				}
				for (var i = 0; i < rows.length; i++) {
					rows[i].selected = checkAll;
					if (rows[i].clone) {
						rows[i].clone.selected = checkAll;
					}
					if (checkAll) {
						self.selectedItems.push(rows[i].entity);
					}
				}
				if (!bypass) {
					grid.config.afterSelectionChange(rows, checkAll);
				}
			}
		};
	};

	var ngStyleProvider = function($scope, grid) {
		$scope.headerCellStyle = function(col) {
			return { "height": col.headerRowHeight + "px" };
		};
		$scope.rowStyle = function (row) {
			var ret = { "top": row.offsetTop + "px", "height": $scope.rowHeight + "px" };
			if (row.isAggRow) {
				ret.left = row.offsetLeft;
			}
			return ret;
		};
		$scope.canvasStyle = function() {
			return { "height": grid.maxCanvasHt + "px" };
		};
		$scope.headerScrollerStyle = function() {
			return { "height": grid.config.headerRowHeight + "px" };
		};
		$scope.topPanelStyle = function() {
			return { "width": grid.rootDim.outerWidth + "px", "height": $scope.topPanelHeight() + "px" };
		};
		$scope.headerStyle = function() {
			return { "width": grid.rootDim.outerWidth + "px", "height": grid.config.headerRowHeight + "px" };
		};
		$scope.groupPanelStyle = function () {
			return { "width": grid.rootDim.outerWidth + "px", "height": "32px" };
		};
		$scope.viewportStyle = function() {
			return { "width": grid.rootDim.outerWidth + "px", "height": $scope.viewportDimHeight() + "px" };
		};
		$scope.footerStyle = function() {
			return { "width": grid.rootDim.outerWidth + "px", "height": $scope.footerRowHeight + "px" };
		};
	};
	ngGridDirectives.directive('ngCellHasFocus', ['$domUtilityService',
		function (domUtilityService) {
			var focusOnInputElement = function($scope, elm) {
				$scope.isFocused = true;
				domUtilityService.digest($scope);

				$scope.$broadcast('ngGridEventStartCellEdit');
				$scope.$emit('ngGridEventStartCellEdit');

				$scope.$on('$destroy', $scope.$on('ngGridEventEndCellEdit', function() {
					$scope.isFocused = false;
					domUtilityService.digest($scope);
				}));
			};

			return function($scope, elm) {
				var isFocused = false;
				var isCellEditableOnMouseDown = false;

				$scope.editCell = function() {
					if(!$scope.enableCellEditOnFocus) {
						setTimeout(function() {
							focusOnInputElement($scope,elm);
						}, 0);
					}
				};

				function mousedown (evt) {
					if($scope.enableCellEditOnFocus) {
						isCellEditableOnMouseDown = true;
					} else {
						elm.focus();
					}
					return true;
				}

				function click (evt) {
					if($scope.enableCellEditOnFocus) {
						evt.preventDefault();
						isCellEditableOnMouseDown = false;
						focusOnInputElement($scope,elm);
					}
				}

				elm.bind('mousedown', mousedown);

				elm.bind('click', click);

				function focus (evt) {
					isFocused = true;
					if($scope.enableCellEditOnFocus && !isCellEditableOnMouseDown) {
						focusOnInputElement($scope,elm);
					}
					return true;
				}

				elm.bind('focus', focus);

				function blur() {
					isFocused = false;
					return true;
				}

				elm.bind('blur', blur);

				function keydown (evt) {
					if(!$scope.enableCellEditOnFocus) {
						if (isFocused && evt.keyCode !== 37 && evt.keyCode !== 38 && evt.keyCode !== 39 && evt.keyCode !== 40 && evt.keyCode !== 9 && !evt.shiftKey && evt.keyCode !== 13) {
							focusOnInputElement($scope,elm);
						}
						if (isFocused && evt.shiftKey && (evt.keyCode >= 65 && evt.keyCode <= 90)) {
							focusOnInputElement($scope, elm);
						}
						if (evt.keyCode === 27) {
							elm.focus();
						}
					}
					return true;
				}

				elm.bind('keydown', keydown);

				elm.on('$destroy', function() {
					elm.off('mousedown', mousedown);
					elm.off('click', click);
					elm.off('focus', focus);
					elm.off('blur', blur);
					elm.off('keydown', keydown);
				});
			};
		}]);

	ngGridDirectives.directive('ngCellText',
		function () {
			return function(scope, elm) {
				function mouseover (evt) {
					evt.preventDefault();
				}
				elm.bind('mouseover', mouseover);

				function mouseleave(evt) {
					evt.preventDefault();
				}
				elm.bind('mouseleave', mouseleave);

				elm.on('$destroy', function() {
					elm.off('mouseover', mouseover);
					elm.off('mouseleave', mouseleave);
				});
			};
		});
	ngGridDirectives.directive('ngCell', ['$compile', '$domUtilityService', function ($compile, domUtilityService) {
		var ngCell = {
			scope: false,
			compile: function() {
				return {
					pre: function($scope, iElement) {
						var html;
						var cellTemplate = $scope.col.cellTemplate.replace(COL_FIELD, 'row.entity.' + $scope.col.field);

						if ($scope.col.enableCellEdit) {
							html =  $scope.col.cellEditTemplate;
							html = html.replace(CELL_EDITABLE_CONDITION, $scope.col.cellEditableCondition);
							html = html.replace(DISPLAY_CELL_TEMPLATE, cellTemplate);
							html = html.replace(EDITABLE_CELL_TEMPLATE, $scope.col.editableCellTemplate.replace(COL_FIELD, 'row.entity.' + $scope.col.field));
						} else {
							html = cellTemplate;
						}

						var cellElement = $(html);
						iElement.append(cellElement);
						$compile(cellElement)($scope);

						if ($scope.enableCellSelection && cellElement[0].className.indexOf('ngSelectionCell') === -1) {
							cellElement[0].setAttribute('tabindex', 0);
							cellElement.addClass('ngCellElement');
						}
					},
					post: function($scope, iElement) {
						if ($scope.enableCellSelection) {
							$scope.domAccessProvider.selectionHandlers($scope, iElement);
						}

						$scope.$on('$destroy', $scope.$on('ngGridEventDigestCell', function() {
							domUtilityService.digest($scope);
						}));
					}
				};
			}
		};

		return ngCell;
	}]);
	/*
	 * Defines the ui-if tag. This removes/adds an element from the dom depending on a condition
	 * Originally created by @tigbro, for the @jquery-mobile-angular-adapter
	 * https://github.com/tigbro/jquery-mobile-angular-adapter
	 */
	ngGridDirectives.directive('ngEditCellIf', [function () {
		return {
			transclude: 'element',
			priority: 1000,
			terminal: true,
			restrict: 'A',
			compile: function (e, a, transclude) {
				return function (scope, element, attr) {

					var childElement;
					var childScope;

					scope.$on('$destroy', scope.$watch(attr['ngEditCellIf'], function (newValue) {
						if (childElement) {
							childElement.remove();
							childElement = undefined;
						}
						if (childScope) {
							childScope.$destroy();
							childScope = undefined;
						}

						if (newValue) {
							childScope = scope.$new();
							transclude(childScope, function (clone) {
								childElement = clone;
								element.after(clone);
							});
						}
					}));
				};
			}
		};
	}]);
	ngGridDirectives.directive('ngGridFooter', ['$compile', '$templateCache', function ($compile, $templateCache) {
		var ngGridFooter = {
			scope: false,
			compile: function () {
				return {
					pre: function ($scope, iElement) {
						if (iElement.children().length === 0) {
							iElement.append($compile($templateCache.get($scope.gridId + 'footerTemplate.html'))($scope));
						}
					}
				};
			}
		};
		return ngGridFooter;
	}]);
	ngGridDirectives.directive('ngGridMenu', ['$compile', '$templateCache', function ($compile, $templateCache) {
		var ngGridMenu = {
			scope: false,
			compile: function () {
				return {
					pre: function ($scope, iElement) {
						if (iElement.children().length === 0) {
							iElement.append($compile($templateCache.get($scope.gridId + 'menuTemplate.html'))($scope));
						}
					}
				};
			}
		};
		return ngGridMenu;
	}]);
	ngGridDirectives.directive('ngGrid', ['$compile', '$filter', '$templateCache', '$sortService', '$domUtilityService', '$utilityService', '$timeout', '$parse', '$http', '$q', function ($compile, $filter, $templateCache, sortService, domUtilityService, $utils, $timeout, $parse, $http, $q) {
		var ngGridDirective = {
			scope: true,
			compile: function() {
				return {
					pre: function($scope, iElement, iAttrs) {
						var $element = $(iElement);
						var options = $scope.$eval(iAttrs.ngGrid);
						options.gridDim = new ngDimension({ outerHeight: $($element).height(), outerWidth: $($element).width() });

						var grid = new ngGrid($scope, options, sortService, domUtilityService, $filter, $templateCache, $utils, $timeout, $parse, $http, $q);

						// Set up cleanup now in case something fails
						$scope.$on('$destroy', function cleanOptions() {
							options.gridDim = null;
							options.selectRow = null;
							options.selectItem = null;
							options.selectAll = null;
							options.selectVisible = null;
							options.groupBy = null;
							options.sortBy = null;
							options.gridId = null;
							options.ngGrid = null;
							options.$gridScope = null;
							options.$gridServices = null;

							$scope.domAccessProvider.grid = null;

							// Plugins should already have been killed as they are children of $scope

							// Remove the grid's stylesheet from dom
							angular.element(grid.styleSheet).remove();
							grid.styleSheet = null;
						});

						return grid.init().then(function() {
							// if columndefs are a string of a property ont he scope watch for changes and rebuild columns.
							if (typeof options.columnDefs === "string") {
								$scope.$on('$destroy', $scope.$parent.$watch(options.columnDefs, function (a) {
									if (!a) {
										grid.refreshDomSizes();
										grid.buildColumns();
										return;
									}
									// we have to set this to false in case we want to autogenerate columns with no initial data.
									grid.lateBoundColumns = false;
									$scope.columns = [];
									grid.config.columnDefs = a;
									grid.buildColumns();
									grid.eventProvider.assignEvents();
									domUtilityService.RebuildGrid($scope, grid);
								}, true));
							}
							else {
								grid.buildColumns();
							}

							// Watch totalServerItems if it's a string
							if (typeof options.totalServerItems === "string") {
								$scope.$on('$destroy', $scope.$parent.$watch(options.totalServerItems, function (newTotal, oldTotal) {
									// If the newTotal is not defined (like during init, set the value to 0)
									if (!angular.isDefined(newTotal)) {
										$scope.totalServerItems = 0;
									}
									// Otherwise set the value to the new total
									else {
										$scope.totalServerItems = newTotal;
									}
								}));
							}
							// If it's NOT a string, then just set totalServerItems to 0 since they should only be setting this if using a string
							else {
								$scope.totalServerItems = 0;
							}

							// if it is a string we can watch for data changes. otherwise you won't be able to update the grid data
							if (typeof options.data === "string") {
								var dataWatcher = function (a) {
									// make a temporary copy of the data
									grid.data = $.extend([], a);
									grid.rowFactory.fixRowCache();
									angular.forEach(grid.data, function (item, j) {
										var indx = grid.rowMap[j] || j;
										if (grid.rowCache[indx]) {
											grid.rowCache[indx].ensureEntity(item);
										}
										grid.rowMap[indx] = j;
									});
									grid.searchProvider.evalFilter();
									grid.configureColumnWidths();
									grid.refreshDomSizes();
									if (grid.config.sortInfo.fields.length > 0) {
										grid.sortColumnsInit();
										$scope.$emit('ngGridEventSorted', grid.config.sortInfo);
									}
									$scope.$emit("ngGridEventData", grid.gridId);
								};
								$scope.$on('$destroy', $scope.$parent.$watch(options.data, dataWatcher));
								$scope.$on('$destroy', $scope.$parent.$watch(options.data + '.length', function() {
									dataWatcher($scope.$eval(options.data));
									$scope.adjustScrollTop(grid.$viewport.scrollTop(), true);
								}));
							}

							grid.footerController = new ngFooter($scope, grid);
							//set the right styling on the container
							iElement.addClass("ngGrid").addClass(grid.gridId.toString());
							if (!options.enableHighlighting) {
								iElement.addClass("unselectable");
							}
							if (options.jqueryUITheme) {
								iElement.addClass('ui-widget');
							}
							iElement.append($compile($templateCache.get('gridTemplate.html'))($scope)); // make sure that if any of these change, we re-fire the calc logic
							//walk the element's graph and the correct properties on the grid
							domUtilityService.AssignGridContainers($scope, iElement, grid);
							//now use the manager to assign the event handlers
							grid.eventProvider = new ngEventProvider(grid, $scope, domUtilityService, $timeout);

							// method for user to select a specific row programatically
							options.selectRow = function (rowIndex, state) {
								if (grid.rowCache[rowIndex]) {
									if (grid.rowCache[rowIndex].clone) {
										grid.rowCache[rowIndex].clone.setSelection(state ? true : false);
									}
									grid.rowCache[rowIndex].setSelection(state ? true : false);
								}
							};
							// method for user to select the row by data item programatically
							options.selectItem = function (itemIndex, state) {
								options.selectRow(grid.rowMap[itemIndex], state);
							};
							// method for user to set the select all state.
							options.selectAll = function (state) {
								$scope.toggleSelectAll(state);
							};
							// method for user to set the select all state on visible items.
							options.selectVisible = function (state) {
								$scope.toggleSelectAll(state, true);
							};
							// method for user to set the groups programatically
							options.groupBy = function (field) {
								if (field) {
									$scope.groupBy($scope.columns.filter(function(c) {
										return c.field === field;
									})[0]);
								} else {
									var arr = $.extend(true, [], $scope.configGroups);
									angular.forEach(arr, $scope.groupBy);
								}
							};
							// method for user to set the sort field programatically
							options.sortBy = function (field) {
								var col = $scope.columns.filter(function (c) {
									return c.field === field;
								})[0];
								if (col) {
									col.sort();
								}
							};
							// the grid Id, entity, scope for convenience
							options.gridId = grid.gridId;
							options.ngGrid = grid;
							options.$gridScope = $scope;
							options.$gridServices = { SortService: sortService, DomUtilityService: domUtilityService, UtilityService: $utils };

							$scope.$on('$destroy', $scope.$on('ngGridEventDigestGrid', function(){
								domUtilityService.digest($scope.$parent);
							}));

							$scope.$on('$destroy', $scope.$on('ngGridEventDigestGridParent', function(){
								domUtilityService.digest($scope.$parent);
							}));
							// set up the columns
							$scope.$evalAsync(function() {
								$scope.adjustScrollLeft(0);
							});
							//initialize plugins.
							angular.forEach(options.plugins, function (p) {
								if (typeof p === "function") {
									p = new p(); //If p is a function, then we assume it is a class.
								}
								var newScope = $scope.$new();
								p.init(newScope, grid, options.$gridServices);
								options.plugins[$utils.getInstanceType(p)] = p;

								$scope.$on('$destroy', function() {
									newScope.$destroy();
								});
							});
							//send initi finalize notification.
							if (typeof options.init === "function") {
								options.init(grid, $scope);
							}
							return null;
						});
					}
				};
			}
		};
		return ngGridDirective;
	}]);

	ngGridDirectives.directive('ngHeaderCell', ['$compile', function($compile) {
		var ngHeaderCell = {
			scope: false,
			compile: function() {
				return {
					pre: function($scope, iElement) {
						iElement.append($compile($scope.col.headerCellTemplate)($scope));
					}
				};
			}
		};
		return ngHeaderCell;
	}]);
	ngGridDirectives.directive('ngHeaderRow', ['$compile', '$templateCache', function ($compile, $templateCache) {
		var ngHeaderRow = {
			scope: false,
			compile: function () {
				return {
					pre: function ($scope, iElement) {
						if (iElement.children().length === 0) {
							iElement.append($compile($templateCache.get($scope.gridId + 'headerRowTemplate.html'))($scope));
						}
					}
				};
			}
		};
		return ngHeaderRow;
	}]);
	ngGridDirectives.directive('ngInput', [function() {
		return {
			require: 'ngModel',
			link: function (scope, elm, attrs, ngModel) {
				// Store the initial cell value so we can reset to it if need be
				var oldCellValue;
				var dereg = scope.$watch('ngModel', function() {
					oldCellValue = ngModel.$modelValue;
					dereg(); // only run this watch once, we don't want to overwrite our stored value when the input changes
				});

				function keydown (evt) {
					switch (evt.keyCode) {
						case 37: // Left arrow
						case 38: // Up arrow
						case 39: // Right arrow
						case 40: // Down arrow
							evt.stopPropagation();
							break;
						case 27: // Esc (reset to old value)
							if (!scope.$$phase) {
								scope.$apply(function() {
									ngModel.$setViewValue(oldCellValue);
									elm.blur();
								});
							}
							break;
						case 13: // Enter (Leave Field)
							if(scope.enableCellEditOnFocus && scope.totalFilteredItemsLength() - 1 > scope.row.rowIndex && scope.row.rowIndex > 0  || scope.col.enableCellEdit) {
								elm.blur();
							}
							break;
					}

					return true;
				}

				elm.bind('keydown', keydown);

				function click (evt) {
					evt.stopPropagation();
				}

				elm.bind('click', click);

				function mousedown (evt) {
					evt.stopPropagation();
				}

				elm.bind('mousedown', mousedown);

				elm.on('$destroy', function() {
					elm.off('keydown', keydown);
					elm.off('click', click);
					elm.off('mousedown', mousedown);
				});

				scope.$on('$destroy', scope.$on('ngGridEventStartCellEdit', function () {
					elm.focus();
					elm.select();
				}));

				angular.element(elm).bind('blur', function () {
					scope.$emit('ngGridEventEndCellEdit');
				});
			}
		};
	}]);

	ngGridDirectives.directive('ngRow', ['$compile', '$domUtilityService', '$templateCache', function ($compile, domUtilityService, $templateCache) {
		var ngRow = {
			scope: false,
			compile: function() {
				return {
					pre: function($scope, iElement) {
						$scope.row.elm = iElement;
						if ($scope.row.clone) {
							$scope.row.clone.elm = iElement;
						}
						if ($scope.row.isAggRow) {
							var html = $templateCache.get($scope.gridId + 'aggregateTemplate.html');
							if ($scope.row.aggLabelFilter) {
								html = html.replace(CUSTOM_FILTERS, '| ' + $scope.row.aggLabelFilter);
							} else {
								html = html.replace(CUSTOM_FILTERS, "");
							}
							iElement.append($compile(html)($scope));
						} else {
							iElement.append($compile($templateCache.get($scope.gridId + 'rowTemplate.html'))($scope));
						}
						$scope.$on('$destroy', $scope.$on('ngGridEventDigestRow', function(){
							domUtilityService.digest($scope);
						}));
					}
				};
			}
		};
		return ngRow;
	}]);
	ngGridDirectives.directive('ngViewport', [function() {
		return function($scope, elm) {
			var isMouseWheelActive;
			var prevScollLeft;
			var prevScollTop = 0;
			var ensureDigest = function() {
				if (!$scope.$root.$$phase) {
					$scope.$digest();
				}
			};
			var scrollTimer;

			function scroll (evt) {
				var scrollLeft = evt.target.scrollLeft,
					scrollTop = evt.target.scrollTop;
				if ($scope.$headerContainer) {
					$scope.$headerContainer.scrollLeft(scrollLeft);
				}
				$scope.adjustScrollLeft(scrollLeft);
				$scope.adjustScrollTop(scrollTop);
				if ($scope.forceSyncScrolling) {
					ensureDigest();
				} else {
					clearTimeout(scrollTimer);
					scrollTimer = setTimeout(ensureDigest, 150);
				}
				prevScollLeft = scrollLeft;
				prevScollTop = scrollTop;
				isMouseWheelActive = false;
				return true;
			}

			elm.bind('scroll', scroll);

			function mousewheel() {
				isMouseWheelActive = true;
				if (elm.focus) { elm.focus(); }
				return true;
			}

			elm.bind("mousewheel DOMMouseScroll", mousewheel);

			elm.on('$destroy', function() {
				elm.off('scroll', scroll);
				elm.off('mousewheel DOMMouseScroll', mousewheel);
			});

			if (!$scope.enableCellSelection) {
				$scope.domAccessProvider.selectionHandlers($scope, elm);
			}
		};
	}]);
	window.ngGrid.i18n['da'] = {
		ngAggregateLabel: 'artikler',
		ngGroupPanelDescription: 'Grupér rækker udfra en kolonne ved at trække dens overskift hertil.',
		ngSearchPlaceHolder: 'Søg...',
		ngMenuText: 'Vælg kolonner:',
		ngShowingItemsLabel: 'Viste rækker:',
		ngTotalItemsLabel: 'Rækker totalt:',
		ngSelectedItemsLabel: 'Valgte rækker:',
		ngPageSizeLabel: 'Side størrelse:',
		ngPagerFirstTitle: 'Første side',
		ngPagerNextTitle: 'Næste side',
		ngPagerPrevTitle: 'Forrige side',
		ngPagerLastTitle: 'Sidste side'
	};
	window.ngGrid.i18n['de'] = {
		ngAggregateLabel: 'eintrag',
		ngGroupPanelDescription: 'Ziehen Sie eine Spaltenüberschrift hierhin um nach dieser Spalte zu gruppieren.',
		ngSearchPlaceHolder: 'Suche...',
		ngMenuText: 'Spalten auswählen:',
		ngShowingItemsLabel: 'Zeige Einträge:',
		ngTotalItemsLabel: 'Einträge gesamt:',
		ngSelectedItemsLabel: 'Ausgewählte Einträge:',
		ngPageSizeLabel: 'Einträge pro Seite:',
		ngPagerFirstTitle: 'Erste Seite',
		ngPagerNextTitle: 'Nächste Seite',
		ngPagerPrevTitle: 'Vorherige Seite',
		ngPagerLastTitle: 'Letzte Seite'
	};
	window.ngGrid.i18n['en'] = {
		ngAggregateLabel: 'items',
		ngGroupPanelDescription: 'Drag a column header here and drop it to group by that column.',
		ngSearchPlaceHolder: 'Search...',
		ngMenuText: 'Choose Columns:',
		ngShowingItemsLabel: 'Showing Items:',
		ngTotalItemsLabel: 'Total Items:',
		ngSelectedItemsLabel: 'Selected Items:',
		ngPageSizeLabel: 'Page Size:',
		ngPagerFirstTitle: 'First Page',
		ngPagerNextTitle: 'Next Page',
		ngPagerPrevTitle: 'Previous Page',
		ngPagerLastTitle: 'Last Page'
	};
	window.ngGrid.i18n['es'] = {
		ngAggregateLabel: 'Artículos',
		ngGroupPanelDescription: 'Arrastre un encabezado de columna aquí y soltarlo para agrupar por esa columna.',
		ngSearchPlaceHolder: 'Buscar...',
		ngMenuText: 'Elegir columnas:',
		ngShowingItemsLabel: 'Artículos Mostrando:',
		ngTotalItemsLabel: 'Artículos Totales:',
		ngSelectedItemsLabel: 'Artículos Seleccionados:',
		ngPageSizeLabel: 'Tamaño de Página:',
		ngPagerFirstTitle: 'Primera Página',
		ngPagerNextTitle: 'Página Siguiente',
		ngPagerPrevTitle: 'Página Anterior',
		ngPagerLastTitle: 'Última Página'
	};
	window.ngGrid.i18n['fa'] = {
		ngAggregateLabel: 'موردها',
		ngGroupPanelDescription: 'یک عنوان ستون اینجا را بردار و به گروهی از آن ستون بیانداز.',
		ngSearchPlaceHolder: 'جستجو...',
		ngMenuText: 'انتخاب ستون\u200cها:',
		ngShowingItemsLabel: 'نمایش موردها:',
		ngTotalItemsLabel: 'همهٔ موردها:',
		ngSelectedItemsLabel: 'موردهای انتخاب\u200cشده:',
		ngPageSizeLabel: 'اندازهٔ صفحه:',
		ngPagerFirstTitle: 'صفحهٔ اول',
		ngPagerNextTitle: 'صفحهٔ بعد',
		ngPagerPrevTitle: 'صفحهٔ قبل',
		ngPagerLastTitle: 'آخرین صفحه'
	};

	window.ngGrid.i18n['fr'] = {
		ngAggregateLabel: 'articles',
		ngGroupPanelDescription: 'Faites glisser un en-tête de colonne ici et déposez-le vers un groupe par cette colonne.',
		ngSearchPlaceHolder: 'Recherche...',
		ngMenuText: 'Choisir des colonnes:',
		ngShowingItemsLabel: 'Articles Affichage des:',
		ngTotalItemsLabel: 'Nombre total d\'articles:',
		ngSelectedItemsLabel: 'Éléments Articles:',
		ngPageSizeLabel: 'Taille de page:',
		ngPagerFirstTitle: 'Première page',
		ngPagerNextTitle: 'Page Suivante',
		ngPagerPrevTitle: 'Page précédente',
		ngPagerLastTitle: 'Dernière page'
	};
	window.ngGrid.i18n['nl'] = {
		ngAggregateLabel: 'items',
		ngGroupPanelDescription: 'Sleep hier een kolomkop om op te groeperen.',
		ngSearchPlaceHolder: 'Zoeken...',
		ngMenuText: 'Kies kolommen:',
		ngShowingItemsLabel: 'Toon items:',
		ngTotalItemsLabel: 'Totaal items:',
		ngSelectedItemsLabel: 'Geselecteerde items:',
		ngPageSizeLabel: 'Pagina grootte:, ',
		ngPagerFirstTitle: 'Eerste pagina',
		ngPagerNextTitle: 'Volgende pagina',
		ngPagerPrevTitle: 'Vorige pagina',
		ngPagerLastTitle: 'Laatste pagina'
	};

	window.ngGrid.i18n['pt-br'] = {
		ngAggregateLabel: 'itens',
		ngGroupPanelDescription: 'Arraste e solte uma coluna aqui para agrupar por essa coluna',
		ngSearchPlaceHolder: 'Procurar...',
		ngMenuText: 'Selecione as colunas:',
		ngShowingItemsLabel: 'Mostrando os Itens:',
		ngTotalItemsLabel: 'Total de Itens:',
		ngSelectedItemsLabel: 'Items Selecionados:',
		ngPageSizeLabel: 'Tamanho da Página:',
		ngPagerFirstTitle: 'Primeira Página',
		ngPagerNextTitle: 'Próxima Página',
		ngPagerPrevTitle: 'Página Anterior',
		ngPagerLastTitle: 'Última Página'
	};

	window.ngGrid.i18n['zh-cn'] = {
		ngAggregateLabel: '条目',
		ngGroupPanelDescription: '拖曳表头到此处以进行分组',
		ngSearchPlaceHolder: '搜索...',
		ngMenuText: '数据分组与选择列：',
		ngShowingItemsLabel: '当前显示条目：',
		ngTotalItemsLabel: '条目总数：',
		ngSelectedItemsLabel: '选中条目：',
		ngPageSizeLabel: '每页显示数：',
		ngPagerFirstTitle: '回到首页',
		ngPagerNextTitle: '下一页',
		ngPagerPrevTitle: '上一页',
		ngPagerLastTitle: '前往尾页'
	};

	window.ngGrid.i18n['zh-tw'] = {
		ngAggregateLabel: '筆',
		ngGroupPanelDescription: '拖拉表頭到此處以進行分組',
		ngSearchPlaceHolder: '搜尋...',
		ngMenuText: '選擇欄位：',
		ngShowingItemsLabel: '目前顯示筆數：',
		ngTotalItemsLabel: '總筆數：',
		ngSelectedItemsLabel: '選取筆數：',
		ngPageSizeLabel: '每頁顯示：',
		ngPagerFirstTitle: '第一頁',
		ngPagerNextTitle: '下一頁',
		ngPagerPrevTitle: '上一頁',
		ngPagerLastTitle: '最後頁'
	};

	angular.module('ngGrid').run(['$templateCache', function($templateCache) {
		'use strict';

		$templateCache.put('aggregateTemplate.html',
			"<div ng-click=\"row.toggleExpand()\" ng-style=\"rowStyle(row)\" class=\"ngAggregate\">\r" +
			"\n" +
			"    <span class=\"ngAggregateText\">{{row.label CUSTOM_FILTERS}} ({{row.totalChildren()}} {{AggItemsLabel}})</span>\r" +
			"\n" +
			"    <div class=\"{{row.aggClass()}}\"></div>\r" +
			"\n" +
			"</div>\r" +
			"\n"
		);


		$templateCache.put('cellEditTemplate.html',
			"<div ng-cell-has-focus ng-dblclick=\"CELL_EDITABLE_CONDITION && editCell()\">\r" +
			"\n" +
			"\t<div ng-edit-cell-if=\"!(isFocused && CELL_EDITABLE_CONDITION)\">\t\r" +
			"\n" +
			"\t\tDISPLAY_CELL_TEMPLATE\r" +
			"\n" +
			"\t</div>\r" +
			"\n" +
			"\t<div ng-edit-cell-if=\"isFocused && CELL_EDITABLE_CONDITION\">\r" +
			"\n" +
			"\t\tEDITABLE_CELL_TEMPLATE\r" +
			"\n" +
			"\t</div>\r" +
			"\n" +
			"</div>\r" +
			"\n"
		);


		$templateCache.put('cellTemplate.html',
			"<div class=\"ngCellText\" ng-class=\"col.colIndex()\"><span ng-cell-text>{{COL_FIELD CUSTOM_FILTERS}}</span></div>"
		);


		$templateCache.put('checkboxCellTemplate.html',
			"<div class=\"ngSelectionCell\"><input tabindex=\"-1\" class=\"ngSelectionCheckbox\" type=\"checkbox\" ng-checked=\"row.selected\" /></div>"
		);


		$templateCache.put('checkboxHeaderTemplate.html',
			"<input class=\"ngSelectionHeader\" type=\"checkbox\" ng-show=\"multiSelect\" ng-model=\"allSelected\" ng-change=\"toggleSelectAll(allSelected, true)\"/>"
		);


		$templateCache.put('editableCellTemplate.html',
			"<input ng-class=\"'colt' + col.index\" ng-input=\"COL_FIELD\" ng-model=\"COL_FIELD\" />"
		);


		$templateCache.put('footerTemplate.html',
			"<div ng-show=\"showFooter\" class=\"ngFooterPanel\" ng-class=\"{'ui-widget-content': jqueryUITheme, 'ui-corner-bottom': jqueryUITheme}\" ng-style=\"footerStyle()\">\r" +
			"\n" +
			"    <div class=\"ngTotalSelectContainer\" >\r" +
			"\n" +
			"        <div class=\"ngFooterTotalItems\" ng-class=\"{'ngNoMultiSelect': !multiSelect}\" >\r" +
			"\n" +
			"            <span class=\"ngLabel\">{{i18n.ngTotalItemsLabel}} {{maxRows()}}</span><span ng-show=\"filterText.length > 0\" class=\"ngLabel\">({{i18n.ngShowingItemsLabel}} {{totalFilteredItemsLength()}})</span>\r" +
			"\n" +
			"        </div>\r" +
			"\n" +
			"        <div class=\"ngFooterSelectedItems\" ng-show=\"multiSelect\">\r" +
			"\n" +
			"            <span class=\"ngLabel\">{{i18n.ngSelectedItemsLabel}} {{selectedItems.length}}</span>\r" +
			"\n" +
			"        </div>\r" +
			"\n" +
			"    </div>\r" +
			"\n" +
			"    <div class=\"ngPagerContainer\" style=\"float: right; margin-top: 10px;\" ng-show=\"enablePaging\" ng-class=\"{'ngNoMultiSelect': !multiSelect}\">\r" +
			"\n" +
			"        <div style=\"float:left; margin-right: 10px;\" class=\"ngRowCountPicker\">\r" +
			"\n" +
			"            <span style=\"float: left; margin-top: 3px;\" class=\"ngLabel\">{{i18n.ngPageSizeLabel}}</span>\r" +
			"\n" +
			"            <select style=\"float: left;height: 27px; width: 100px\" ng-model=\"pagingOptions.pageSize\" >\r" +
			"\n" +
			"                <option ng-repeat=\"size in pagingOptions.pageSizes\">{{size}}</option>\r" +
			"\n" +
			"            </select>\r" +
			"\n" +
			"        </div>\r" +
			"\n" +
			"        <div style=\"float:left; margin-right: 10px; line-height:25px;\" class=\"ngPagerControl\" style=\"float: left; min-width: 135px;\">\r" +
			"\n" +
			"            <button type=\"button\" class=\"ngPagerButton\" ng-click=\"pageToFirst()\" ng-disabled=\"cantPageBackward()\" title=\"{{i18n.ngPagerFirstTitle}}\"><div class=\"ngPagerFirstTriangle\"><div class=\"ngPagerFirstBar\"></div></div></button>\r" +
			"\n" +
			"            <button type=\"button\" class=\"ngPagerButton\" ng-click=\"pageBackward()\" ng-disabled=\"cantPageBackward()\" title=\"{{i18n.ngPagerPrevTitle}}\"><div class=\"ngPagerFirstTriangle ngPagerPrevTriangle\"></div></button>\r" +
			"\n" +
			"            <input class=\"ngPagerCurrent\" min=\"1\" max=\"{{currentMaxPages}}\" type=\"number\" style=\"width:50px; height: 24px; margin-top: 1px; padding: 0 4px;\" ng-model=\"pagingOptions.currentPage\"/>\r" +
			"\n" +
			"            <span class=\"ngGridMaxPagesNumber\" ng-show=\"maxPages() > 0\">/ {{maxPages()}}</span>\r" +
			"\n" +
			"            <button type=\"button\" class=\"ngPagerButton\" ng-click=\"pageForward()\" ng-disabled=\"cantPageForward()\" title=\"{{i18n.ngPagerNextTitle}}\"><div class=\"ngPagerLastTriangle ngPagerNextTriangle\"></div></button>\r" +
			"\n" +
			"            <button type=\"button\" class=\"ngPagerButton\" ng-click=\"pageToLast()\" ng-disabled=\"cantPageToLast()\" title=\"{{i18n.ngPagerLastTitle}}\"><div class=\"ngPagerLastTriangle\"><div class=\"ngPagerLastBar\"></div></div></button>\r" +
			"\n" +
			"        </div>\r" +
			"\n" +
			"    </div>\r" +
			"\n" +
			"</div>\r" +
			"\n"
		);


		$templateCache.put('gridTemplate.html',
			"<div class=\"ngTopPanel\" ng-class=\"{'ui-widget-header':jqueryUITheme, 'ui-corner-top': jqueryUITheme}\" ng-style=\"topPanelStyle()\">\r" +
			"\n" +
			"    <div class=\"ngGroupPanel\" ng-show=\"showGroupPanel()\" ng-style=\"groupPanelStyle()\">\r" +
			"\n" +
			"        <div class=\"ngGroupPanelDescription\" ng-show=\"configGroups.length == 0\">{{i18n.ngGroupPanelDescription}}</div>\r" +
			"\n" +
			"        <ul ng-show=\"configGroups.length > 0\" class=\"ngGroupList\">\r" +
			"\n" +
			"            <li class=\"ngGroupItem\" ng-repeat=\"group in configGroups\">\r" +
			"\n" +
			"                <span class=\"ngGroupElement\">\r" +
			"\n" +
			"                    <span class=\"ngGroupName\">{{group.displayName}}\r" +
			"\n" +
			"                        <span ng-click=\"removeGroup($index)\" class=\"ngRemoveGroup\">x</span>\r" +
			"\n" +
			"                    </span>\r" +
			"\n" +
			"                    <span ng-hide=\"$last\" class=\"ngGroupArrow\"></span>\r" +
			"\n" +
			"                </span>\r" +
			"\n" +
			"            </li>\r" +
			"\n" +
			"        </ul>\r" +
			"\n" +
			"    </div>\r" +
			"\n" +
			"    <div class=\"ngHeaderContainer\" ng-style=\"headerStyle()\">\r" +
			"\n" +
			"        <div ng-header-row class=\"ngHeaderScroller\" ng-style=\"headerScrollerStyle()\"></div>\r" +
			"\n" +
			"    </div>\r" +
			"\n" +
			"    <div ng-grid-menu></div>\r" +
			"\n" +
			"</div>\r" +
			"\n" +
			"<div class=\"ngViewport\" unselectable=\"on\" ng-viewport ng-class=\"{'ui-widget-content': jqueryUITheme}\" ng-style=\"viewportStyle()\">\r" +
			"\n" +
			"    <div class=\"ngCanvas\" ng-style=\"canvasStyle()\">\r" +
			"\n" +
			"        <div ng-style=\"rowStyle(row)\" ng-repeat=\"row in renderedRows\" ng-click=\"row.toggleSelected($event)\" ng-class=\"row.alternatingRowClass()\" ng-row></div>\r" +
			"\n" +
			"    </div>\r" +
			"\n" +
			"</div>\r" +
			"\n" +
			"<div ng-grid-footer></div>\r" +
			"\n"
		);


		$templateCache.put('headerCellTemplate.html',
			"<div class=\"ngHeaderSortColumn {{col.headerClass}}\" ng-style=\"{'cursor': col.cursor}\" ng-class=\"{ 'ngSorted': !col.noSortVisible() }\">\r" +
			"\n" +
			"    <div ng-click=\"col.sort($event)\" ng-class=\"'colt' + col.index\" class=\"ngHeaderText\">{{col.displayName}}</div>\r" +
			"\n" +
			"    <div class=\"ngSortButtonDown\" ng-click=\"col.sort($event)\" ng-show=\"col.showSortButtonDown()\"></div>\r" +
			"\n" +
			"    <div class=\"ngSortButtonUp\" ng-click=\"col.sort($event)\" ng-show=\"col.showSortButtonUp()\"></div>\r" +
			"\n" +
			"    <div class=\"ngSortPriority\">{{col.sortPriority}}</div>\r" +
			"\n" +
			"    <div ng-class=\"{ ngPinnedIcon: col.pinned, ngUnPinnedIcon: !col.pinned }\" ng-click=\"togglePin(col)\" ng-show=\"col.pinnable\"></div>\r" +
			"\n" +
			"</div>\r" +
			"\n" +
			"<div ng-show=\"col.resizable\" class=\"ngHeaderGrip\" ng-click=\"col.gripClick($event)\" ng-mousedown=\"col.gripOnMouseDown($event)\"></div>\r" +
			"\n"
		);


		$templateCache.put('headerRowTemplate.html',
			"<div ng-style=\"{ height: col.headerRowHeight }\" ng-repeat=\"col in renderedColumns\" ng-class=\"col.colIndex()\" class=\"ngHeaderCell\">\r" +
			"\n" +
			"\t<div class=\"ngVerticalBar\" ng-style=\"{height: col.headerRowHeight}\" ng-class=\"{ ngVerticalBarVisible: !$last }\">&nbsp;</div>\r" +
			"\n" +
			"\t<div ng-header-cell></div>\r" +
			"\n" +
			"</div>"
		);


		$templateCache.put('menuTemplate.html',
			"<div ng-show=\"showColumnMenu || showFilter\"  class=\"ngHeaderButton\" ng-click=\"toggleShowMenu()\">\r" +
			"\n" +
			"    <div class=\"ngHeaderButtonArrow\"></div>\r" +
			"\n" +
			"</div>\r" +
			"\n" +
			"<div ng-show=\"showMenu\" class=\"ngColMenu\">\r" +
			"\n" +
			"    <div ng-show=\"showFilter\">\r" +
			"\n" +
			"        <input placeholder=\"{{i18n.ngSearchPlaceHolder}}\" type=\"text\" ng-model=\"filterText\"/>\r" +
			"\n" +
			"    </div>\r" +
			"\n" +
			"    <div ng-show=\"showColumnMenu\">\r" +
			"\n" +
			"        <span class=\"ngMenuText\">{{i18n.ngMenuText}}</span>\r" +
			"\n" +
			"        <ul class=\"ngColList\">\r" +
			"\n" +
			"            <li class=\"ngColListItem\" ng-repeat=\"col in columns | ngColumns\">\r" +
			"\n" +
			"                <label><input ng-disabled=\"col.pinned\" type=\"checkbox\" class=\"ngColListCheckbox\" ng-model=\"col.visible\"/>{{col.displayName}}</label>\r" +
			"\n" +
			"\t\t\t\t<a title=\"Group By\" ng-class=\"col.groupedByClass()\" ng-show=\"col.groupable && col.visible\" ng-click=\"groupBy(col)\"></a>\r" +
			"\n" +
			"\t\t\t\t<span class=\"ngGroupingNumber\" ng-show=\"col.groupIndex > 0\">{{col.groupIndex}}</span>          \r" +
			"\n" +
			"            </li>\r" +
			"\n" +
			"        </ul>\r" +
			"\n" +
			"    </div>\r" +
			"\n" +
			"</div>"
		);


		$templateCache.put('rowTemplate.html',
			"<div ng-style=\"{ 'cursor': row.cursor }\" ng-repeat=\"col in renderedColumns\" ng-class=\"col.colIndex()\" class=\"ngCell {{col.cellClass}}\">\r" +
			"\n" +
			"\t<div class=\"ngVerticalBar\" ng-style=\"{height: rowHeight}\" ng-class=\"{ ngVerticalBarVisible: !$last }\">&nbsp;</div>\r" +
			"\n" +
			"\t<div ng-cell></div>\r" +
			"\n" +
			"</div>"
		);

	}]);

}(window, jQuery));