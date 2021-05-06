import { IronA11yKeysBehavior } from '@polymer/iron-a11y-keys-behavior/iron-a11y-keys-behavior.js';
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import { dateAllowed, dateEquals, extractDateParts, getClosestDate } from './vcf-date-range-picker-helper.js';
import { addListener } from '@polymer/polymer/lib/utils/gestures.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

/**
 * @polymerMixin
 */
export const DateRangePickerMixin = (subclass) =>
  class VaadinDatePickerMixin extends mixinBehaviors([IronResizableBehavior], subclass) {
  static get properties() {
    return {
      /**
       * The current selected start date.
       * @type {Date | undefined}
       * @protected
       */
      _selectedStartDate: {
        type: Date
      },

      /**
       * The current selected end date.
       * @type {Date | undefined}
       * @protected
       */
        _selectedEndDate: {
        type: Date
      },

      /**
       * True if currently selecting the 
       * StartDate, false if selecting EndDate
       * @type {Boolean | undefined}
       * @protected
       */
        _selectingStartDate: {
        type: Boolean
      },

      /**
       * @type {Date | undefined}
       * @protected
       */
      _focusedDate: Date,

      /**
       * The value for this element.
       *
       * Supported date formats:
       * - ISO 8601 `"YYYY-MM-DD"` (default)
       * - 6-digit extended ISO 8601 `"+YYYYYY-MM-DD"`, `"-YYYYYY-MM-DD"`
       *
       * @type {string}
       */
      value: {
        type: String,
        observer: '_valueChanged',
        notify: true,
        value: ''
      },

      /**
       * Set to true to mark the input as required.
       * @type {boolean}
       */
      required: {
        type: Boolean,
        value: false
      },

      /**
       * The name of this element.
       */
      name: {
        type: String
      },

      /**
       * Date which should be visible when there is no value selected.
       *
       * The same date formats as for the `value` property are supported.
       * @attr {string} initial-position
       */
      initialPosition: String,

      /**
       * The label for this element.
       */
      label: String,

      /**
       * The label for this element.
       */
      endLabel: String,

      /**
       * Set true to open the date selector overlay.
       */
      opened: {
        type: Boolean,
        reflectToAttribute: true,
        notify: true,
        observer: '_openedChanged'
      },

      /**
       * Set true to prevent the overlay from opening automatically.
       * @attr {boolean} auto-open-disabled
       */
      autoOpenDisabled: Boolean,

      /**
       * Set true to display ISO-8601 week numbers in the calendar. Notice that
       * displaying week numbers is only supported when `i18n.firstDayOfWeek`
       * is 1 (Monday).
       * @attr {boolean} show-week-numbers
       */
      showWeekNumbers: {
        type: Boolean
      },

      /**
       * @type {boolean}
       * @protected
       */
      _fullscreen: {
        value: false,
        observer: '_fullscreenChanged'
      },

      /**
       * @type {string}
       * @protected
       */
      _fullscreenMediaQuery: {
        value: '(max-width: 420px), (max-height: 420px)'
      },

      /**
       * An array of ancestor elements whose -webkit-overflow-scrolling is forced from value
       * 'touch' to value 'auto' in order to prevent them from clipping the dropdown. iOS only.
       * @private
       */
      _touchPrevented: Array,

      /**
       * The object used to localize this component.
       * To change the default localization, replace the entire
       * _i18n_ object or just the property you want to modify.
       *
       * The object has the following JSON structure and default values:

          {
            // An array with the full names of months starting
            // with January.
            monthNames: [
              'January', 'February', 'March', 'April', 'May',
              'June', 'July', 'August', 'September',
              'October', 'November', 'December'
            ],

            // An array of weekday names starting with Sunday. Used
            // in screen reader announcements.
            weekdays: [
              'Sunday', 'Monday', 'Tuesday', 'Wednesday',
              'Thursday', 'Friday', 'Saturday'
            ],

            // An array of short weekday names starting with Sunday.
            // Displayed in the calendar.
            weekdaysShort: [
              'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
            ],

            // An integer indicating the first day of the week
            // (0 = Sunday, 1 = Monday, etc.).
            firstDayOfWeek: 0,

            // Used in screen reader announcements along with week
            // numbers, if they are displayed.
            week: 'Week',

            // Translation of the Calendar icon button title.
            calendar: 'Calendar',

            // Translation of the Clear icon button title.
            clear: 'Clear',

            // Translation of the Today shortcut button text.
            today: 'Today',

            // Translation of the Cancel button text.
            cancel: 'Cancel',

            // A function to format given `Object` as
            // date string. Object is in the format `{ day: ..., month: ..., year: ... }`
            // Note: The argument month is 0-based. This means that January = 0 and December = 11.
            formatDate: d => {
              // returns a string representation of the given
              // object in 'MM/DD/YYYY' -format
            },

            // A function to parse the given text to an `Object` in the format `{ day: ..., month: ..., year: ... }`.
            // Must properly parse (at least) text formatted by `formatDate`.
            // Setting the property to null will disable keyboard input feature.
            // Note: The argument month is 0-based. This means that January = 0 and December = 11.
            parseDate: text => {
              // Parses a string in 'MM/DD/YY', 'MM/DD' or 'DD' -format to
              // an `Object` in the format `{ day: ..., month: ..., year: ... }`.
            }

            // A function to format given `monthName` and
            // `fullYear` integer as calendar title string.
            formatTitle: (monthName, fullYear) => {
              return monthName + ' ' + fullYear;
            }
          }

        * @type {!DatePickerI18n}
        * @default {English/US}
        */
      i18n: {
        type: Object,
        value: () => {
          return {
            monthNames: [
              'January', 'February', 'March', 'April', 'May',
              'June', 'July', 'August', 'September', 'October', 'November', 'December'
            ],
            weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            firstDayOfWeek: 0,
            week: 'Week',
            calendar: 'Calendar',
            clear: 'Clear',
            today: 'Today',
            yesterday: 'Yesterday',
            thisWeek: 'This week',
            lastWeek: 'Last week',
            thisMonth: 'This month',
            lastMonth: 'Last month',
            thisYear: 'This Year',
            lastYear: 'Last Year',
            cancel: 'Cancel',
            formatDate: d => {
              const yearStr = String(d.year).replace(/\d+/, y => '0000'.substr(y.length) + y);
              return [d.month + 1, d.day, yearStr].join('/');
            },
            parseDate: text => {
              const parts = text.split('/');
              const today = new Date();
              let date, month = today.getMonth(), year = today.getFullYear();

              if (parts.length === 3) {
                year = parseInt(parts[2]);
                if (parts[2].length < 3 && year >= 0) {
                  year += year < 50 ? 2000 : 1900;
                }
                month = parseInt(parts[0]) - 1;
                date = parseInt(parts[1]);
              } else if (parts.length === 2) {
                month = parseInt(parts[0]) - 1;
                date = parseInt(parts[1]);
              } else if (parts.length === 1) {
                date = parseInt(parts[0]);
              }

              if (date !== undefined) {
                return {day: date, month, year};
              }
            },
            formatTitle: (monthName, fullYear) => {
              return monthName + ' ' + fullYear;
            }
          };
        }
      },

      /**
       * The earliest date that can be selected. All earlier dates will be disabled.
       *
       * Supported date formats:
       * - ISO 8601 `"YYYY-MM-DD"` (default)
       * - 6-digit extended ISO 8601 `"+YYYYYY-MM-DD"`, `"-YYYYYY-MM-DD"`
       *
       * @type {string | undefined}
       */
      min: {
        type: String,
        observer: '_minChanged'
      },

      /**
       * The latest date that can be selected. All later dates will be disabled.
       *
       * Supported date formats:
       * - ISO 8601 `"YYYY-MM-DD"` (default)
       * - 6-digit extended ISO 8601 `"+YYYYYY-MM-DD"`, `"-YYYYYY-MM-DD"`
       *
       * @type {string | undefined}
       */
      max: {
        type: String,
        observer: '_maxChanged'
      },

      /**
       * The earliest date that can be selected. All earlier dates will be disabled.
       * @type {Date | string}
       * @protected
       */
      _minDate: {
        type: Date,
        // null does not work here because minimizer passes undefined to overlay (#351)
        value: ''
      },

      /**
       * The latest date that can be selected. All later dates will be disabled.
       * @type {Date | string}
       * @protected
       */
      _maxDate: {
        type: Date,
        value: ''
      },

      /** @private */
      _noInput: {
        type: Boolean,
        computed: '_isNoInput(_fullscreen, _ios, i18n, i18n.*)'
      },

      /** @private */
      _ios: {
        type: Boolean,
        value: navigator.userAgent.match(/iP(?:hone|ad;(?: U;)? CPU) OS (\d+)/)
      },

      /** @private */
      _webkitOverflowScroll: {
        type: Boolean,
        value: document.createElement('div').style.webkitOverflowScrolling === ''
      },

      /** @private */
      _ignoreAnnounce: {
        value: true
      },

      /** @private */
      _focusOverlayOnOpen: Boolean,

      /** @protected */
      _overlayInitialized: Boolean
    };
  }

  static get observers() {
    return [
      '_updateHasValue(value)',
      '_selectedStartDateChanged(_selectedStartDate, i18n.formatDate)',
      '_selectedEndDateChanged(_selectedEndDate, i18n.formatDate)',
      '_focusedDateChanged(_focusedDate, i18n.formatDate)',
      '_announceFocusedDate(_focusedDate, opened, _ignoreAnnounce)'
    ];
  }

  /** @protected */
  ready() {
    super.ready();
    this._boundOnScroll = this._onScroll.bind(this);
    this._boundFocus = this._focus.bind(this);
    this._boundUpdateAlignmentAndPosition = this._updateAlignmentAndPosition.bind(this);

    const isClearButton = e => {
      const path = e.composedPath();
      // FIX: Just using inputStartElement, but don't know what to do
      const inputIndex = path.indexOf(this._inputStartElement);
      return path.slice(0, inputIndex)
        .filter(el => el.getAttribute && el.getAttribute('part') === 'clear-button')
        .length === 1;
    };

    addListener(this, 'tap', e => {
      // FIXME(platosha): use preventDefault in the text field clear button,
      // then the following composedPath check could be simplified down
      // to `if (!e.defaultPrevented)`.
      // https://github.com/vaadin/vaadin-text-field/issues/352
      if (!isClearButton(e) && (!this.autoOpenDisabled || this._noInput)) {
        this.open();
      }
    });

    this.addEventListener('touchend', e => {
      if (!isClearButton(e)) {
        e.preventDefault();
      }
    });
    this.addEventListener('keydown', this._onKeydown.bind(this));
    this._inputStartElement.addEventListener('input', this._onUserInputStart.bind(this));
    this._inputEndElement.addEventListener('input', this._onUserInputEnd.bind(this));
    this.addEventListener('focus', e => this._noInput && e.target.blur());
    this.addEventListener('blur', e => {
      if (!this.opened) {
        if (this.autoOpenDisabled) {
          const startParsedDate = this._getParsedDate(this._inputStartValue);
          if (this._isValidDate(startParsedDate)) {
            this._selectedStartDate = startParsedDate;
          }
          const endParsedDate = this._getParsedDate(this._inputEndValue);
          if (this._isValidDate(endParsedDate)) {
            this._selectedEndDate = endParsedDate;
          }
        }

        // FIX: Just using inputStartElement, but don't know what to do
        if (this._inputStartElement.value === '' && this.__dispatchChange) {
          this.validateStart();
          this.value = ';';
          this.__dispatchChange = false;
        } else {
          this.validateStart();
        }
      }
    });
  }

  /** @private */
  _initOverlay() {
    this.$.overlay.removeAttribute('disable-upgrade');
    this._overlayInitialized = true;

    this.$.overlay.addEventListener('opened-changed', e => this.opened = e.detail.value);

    this._overlayContent.addEventListener('close', this._close.bind(this));
    this._overlayContent.addEventListener('focus-input', this._focusAndSelect.bind(this));
    this.$.overlay.addEventListener('vaadin-overlay-escape-press', this._boundFocus);

    // Keep focus attribute in focusElement for styling
    this._overlayContent.addEventListener('focus', () => this.focusElement._setFocused(true));

    this.$.overlay.addEventListener('vaadin-overlay-close', this._onVaadinOverlayClose.bind(this));

    const bringToFrontListener = (e) => {
      if (this.$.overlay.bringToFront) {
        requestAnimationFrame(() => {
          this.$.overlay.bringToFront();
        });
      }
    };

    this.addEventListener('mousedown', bringToFrontListener);
    this.addEventListener('touchstart', bringToFrontListener);
  }

  /** @protected */
  disconnectedCallback() {
    super.disconnectedCallback();

    if (this._overlayInitialized) {
      this.$.overlay.removeEventListener('vaadin-overlay-escape-press', this._boundFocus);
    }

    this.opened = false;
  }

  /**
    * Opens the dropdown.
    */
  open() {
    if (!this.disabled && !this.readonly) {
      this.opened = true;
    }
  }

  /** @private */
  _closeOnTap(e) {
    if (this._selectingStartDate) {
      this._selectingStartDate = false;
    } else {
      this._selectingStartDate = true;
      if (e) {
      e.stopPropagation();
      }
      this._focus();
      this.close();
    }
  }

    /** @private */
  _close(e) {
    if (e) {
      e.stopPropagation();
    }
    this._focus();
    this.close();
  }

  /**
    * Closes the dropdown.
    */
  close() {
    if (this._overlayInitialized || this.autoOpenDisabled) {
      this.$.overlay.close();
    }
  }

  /**
    * @return {HTMLElement}
    * @protected
    */
  get _inputStartElement() {
    return this._inputStart();
  }

  /**
    * @return {HTMLElement}
    * @protected
    */
  get _inputEndElement() {
    return this._inputEnd();
  }

  /** @private */
  /** FIX: Just replaced with inputStartElement, don't know what to do */
  get _nativeInput() {
    if (this._inputStartElement) {
      // vaadin-text-field's input is focusElement
      // iron-input's input is inputElement
      return this._inputStartElement.focusElement ? this._inputStartElement.focusElement :
        this._inputStartElement.inputElement ? this._inputStartElement.inputElement :
          window.unwrap ? window.unwrap(this._inputStartElement) : this._inputStartElement;
    }
  }

  /** @private */
  _parseDate(str) {
    // Parsing with RegExp to ensure correct format
    var parts = /^([-+]\d{1}|\d{2,4}|[-+]\d{6})-(\d{1,2})-(\d{1,2})$/.exec(str);
    if (!parts) {
      return;
    }

    var date = new Date(0, 0); // Wrong date (1900-01-01), but with midnight in local time
    date.setFullYear(parseInt(parts[1], 10));
    date.setMonth(parseInt(parts[2], 10) - 1);
    date.setDate(parseInt(parts[3], 10));
    return date;
  }

  /** @private */
  _isNoInput(fullscreen, ios, i18n) {
    return !this._inputStartElement || !this._inputEndElement || fullscreen || ios || !i18n.parseDate;
  }

  /** @private */
  _formatISO(date) {
    if (!(date instanceof Date)) {
      return '';
    }

    const pad = (num, fmt = '00') => (fmt + num).substr((fmt + num).length - fmt.length);

    let yearSign = '';
    let yearFmt = '0000';
    let yearAbs = date.getFullYear();
    if (yearAbs < 0) {
      yearAbs = -yearAbs;
      yearSign = '-';
      yearFmt = '000000';
    } else if (date.getFullYear() >= 10000) {
      yearSign = '+';
      yearFmt = '000000';
    }

    const year = yearSign + pad(yearAbs, yearFmt);
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    return [year, month, day].join('-');
  }

  /** @private */
  _openedChanged(opened) {
    if (opened && !this._overlayInitialized) {
      this._initOverlay();
    }
    if (this._overlayInitialized) {
      this.$.overlay.opened = opened;
    }
    if (opened) {
      this._updateAlignmentAndPosition();
    }
  }

  /** @private */
  _selectedStartDateChanged(selectedDate, formatDate) {
    if (selectedDate === undefined || formatDate === undefined) {
      return;
    }
    if (this.__userInputOccurred) {
      this.__dispatchChange = true;
    }
    const value = this._formatISO(selectedDate);

    this.__keepInputValue || this._applyStartInputValue(selectedDate);

    var startDate = this._extractStartDate(this.value);
    if (value !== startDate) {
      this.validateStart();
      this.value = value + ";" + this._extractEndDate(this.value);
    }
    this.__userInputOccurred = false;
    this.__dispatchChange = false;
    this._ignoreFocusedDateChange = true;
    this._focusedDate = selectedDate;
    this._ignoreFocusedDateChange = false;
  }

  /** @private */
  _selectedEndDateChanged(selectedDate, formatDate) {
    if (selectedDate === undefined || formatDate === undefined) {
      return;
    }
    if (this.__userInputOccurred) {
      this.__dispatchChange = true;
    }
    const value = this._formatISO(selectedDate);

    this.__keepInputValue || this._applyEndInputValue(selectedDate);

    var endDate = this._extractEndDate(this.value);
    if (value !== endDate) {
      this.validateEnd();
      this.value = this._extractStartDate(this.value) + ";" + value;
    }
    this.__userInputOccurred = false;
    this.__dispatchChange = false;
    this._ignoreFocusedDateChange = true;
    this._focusedDate = selectedDate;
    this._ignoreFocusedDateChange = false;
  }

  /** @private */
  _focusedDateChanged(focusedDate, formatDate) {
    if (focusedDate === undefined || formatDate === undefined) {
      return;
    }
    this.__userInputOccurred = true;
    if (!this._ignoreFocusedDateChange && !this._noInput) {
      // FIX: Just using start value, don't know what to do
      this._applyStartInputValue(focusedDate);
    }
  }

  /** @private */
  _updateHasValue(value) {
    if (value) {
      this.setAttribute('has-value', '');
    } else {
      this.removeAttribute('has-value');
    }
  }

  /** @private */
  __getOverlayTheme(theme, overlayInitialized) {
    if (overlayInitialized) {
      return theme;
    }
  }

  /** @private */
  _handleDateChange(property, value, oldValue) {
    if (!value) {
      this[property] = '';
      return;
    }

    var date = this._parseDate(value);
    if (!date) {
      return false;
    }
    if (!dateEquals(this[property], date)) {
      this[property] = date;
      this.value && this.validateStart() && this.validateEnd();
    }
    return true;
  }

  /** @private */
  _valueChanged(value, oldValue) {
    if (this.__dispatchChange) {
      this.dispatchEvent(new CustomEvent('change', {bubbles: true}));
    }
    var startDate = this._extractStartDate(value);
    var endDate = this._extractEndDate(value);
    if (startDate && !this._handleDateChange('_selectedStartDate', startDate, oldValue)) {
      startDate="";
    }
    if (endDate && !this._handleDateChange('_selectedEndDate', endDate, oldValue)) {
      endDate="";
    }    
    value = startDate + ";" + (endDate==undefined?"":endDate);  
  }

  _extractStartDate(value) {
    var extracted = value.split(";")[0];
    return (extracted==undefined?"":extracted);
  }

  _extractEndDate(value) {
    var extracted = value.split(";")[1];
    return (extracted==undefined?"":extracted);
  }

  /** @private */
  _minChanged(value, oldValue) {
    if (!this._handleDateChange('_minDate', value, oldValue)) {
      this.min = oldValue;
    }
  }

  /** @private */
  _maxChanged(value, oldValue) {
    if (!this._handleDateChange('_maxDate', value, oldValue)) {
      this.max = oldValue;
    }
  }

  /** @private */
  _updateAlignmentAndPosition() {
    if (!this._overlayInitialized) {
      return;
    }
    if (!this._fullscreen) {
      // FIX: Just used _inputStartElement don't know what to do
      const inputRect = this._inputStartElement.getBoundingClientRect();

      const bottomAlign = inputRect.top > window.innerHeight / 2;
      const rightAlign = inputRect.left + this.clientWidth / 2 > window.innerWidth / 2;

      if (rightAlign) {
        const viewportWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);
        this.$.overlay.setAttribute('right-aligned', '');
        this.$.overlay.style.removeProperty('left');
        this.$.overlay.style.right = (viewportWidth - inputRect.right) + 'px';
      } else {
        this.$.overlay.removeAttribute('right-aligned');
        this.$.overlay.style.removeProperty('right');
        this.$.overlay.style.left = inputRect.left + 'px';
      }

      if (bottomAlign) {
        const viewportHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);
        this.$.overlay.setAttribute('bottom-aligned', '');
        this.$.overlay.style.removeProperty('top');
        this.$.overlay.style.bottom = (viewportHeight - inputRect.top) + 'px';
      } else {
        this.$.overlay.removeAttribute('bottom-aligned');
        this.$.overlay.style.removeProperty('bottom');
        this.$.overlay.style.top = inputRect.bottom + 'px';
      }
    }

    // FIX: Just used inputStartElement, don't know what to do
    this.$.overlay.setAttribute('dir',
      getComputedStyle(this._inputStartElement).getPropertyValue('direction')
    );
    this._overlayContent._repositionYearScroller();
  }

  /** @private */
  _fullscreenChanged() {
    if (this._overlayInitialized && this.$.overlay.opened) {
      this._updateAlignmentAndPosition();
    }
  }

  /** @protected */
  _onOverlayOpened() {
    this._openedWithFocusRing = this.hasAttribute('focus-ring') || (this.focusElement && this.focusElement.hasAttribute('focus-ring'));

    var parsedInitialPosition = this._parseDate(this.initialPosition);

    var initialPosition = this._selectedStartDate || this._overlayContent.initialPosition ||
      parsedInitialPosition || new Date();

    if (parsedInitialPosition ||
      dateAllowed(initialPosition, this._minDate, this._maxDate)) {
      this._overlayContent.initialPosition = initialPosition;
    } else {
      this._overlayContent.initialPosition =
        getClosestDate(initialPosition, [this._minDate, this._maxDate]);
    }

    this._overlayContent.scrollToDate(this._overlayContent.focusedDate || this._overlayContent.initialPosition);
    // Have a default focused date
    this._ignoreFocusedDateChange = true;
    this._overlayContent.focusedDate = this._overlayContent.focusedDate || this._overlayContent.initialPosition;
    this._ignoreFocusedDateChange = false;

    window.addEventListener('scroll', this._boundOnScroll, true);
    this.addEventListener('iron-resize', this._boundUpdateAlignmentAndPosition);

    if (this._webkitOverflowScroll) {
      this._touchPrevented = this._preventWebkitOverflowScrollingTouch(this.parentElement);
    }

    if (this._focusOverlayOnOpen) {
      this._overlayContent.focus();
      this._focusOverlayOnOpen = false;
    } else {
      this._focus();
    }

    if (this._noInput && this.focusElement) {
      this.focusElement.blur();
    }
    
    var slot = this.shadowRoot.querySelector("slot[name='presets']");
		var nodes = slot.assignedNodes();
    this._overlayContent.addToolbarContent(nodes);

    this.updateStyles();

    this._ignoreAnnounce = false;
  }

  // A hack needed for iOS to prevent dropdown from being clipped in an
  // ancestor container with -webkit-overflow-scrolling: touch;
  /** @private */
  _preventWebkitOverflowScrollingTouch(element) {
    var result = [];
    while (element) {
      if (window.getComputedStyle(element).webkitOverflowScrolling === 'touch') {
        var oldInlineValue = element.style.webkitOverflowScrolling;
        element.style.webkitOverflowScrolling = 'auto';
        result.push({
          element: element,
          oldInlineValue: oldInlineValue
        });
      }
      element = element.parentElement;
    }
    return result;
  }

  /** @private */
  _selectParsedOrFocusedDate() {
    // Select the parsed input or focused date
    this._ignoreFocusedDateChange = true;
    // for start date
    if (this.i18n.parseDate) {
      const inputValue = this._inputStartValue || '';
      const parsedDate = this._getParsedDate(inputValue);

      if (this._isValidDate(parsedDate)) {
        this._selectedStartDate = parsedDate;
      } else {
        this.__keepInputValue = true;
        this._selectedStartDate = null;
        this.__keepInputValue = false;
      }
    } else if (this._focusedDate) {
      this._selectedStartDate = this._focusedDate;
    }
    // for end date
    if (this.i18n.parseDate) {
      const inputValue = this._inputEndValue || '';
      const parsedDate = this._getParsedDate(inputValue);

      if (this._isValidDate(parsedDate)) {
        this._selectedEndDate = parsedDate;
      } else {
        this.__keepInputValue = true;
        this._selectedEndDate = null;
        this.__keepInputValue = false;
      }
    } else if (this._focusedDate) {
      this._selectedEndDate = this._focusedDate;
    }

    this._ignoreFocusedDateChange = false;
  }

  /** @protected */
  _onOverlayClosed() {
    this._ignoreAnnounce = true;

    window.removeEventListener('scroll', this._boundOnScroll, true);
    this.removeEventListener('iron-resize', this._boundUpdateAlignmentAndPosition);

    if (this._touchPrevented) {
      this._touchPrevented.forEach(prevented =>
        prevented.element.style.webkitOverflowScrolling = prevented.oldInlineValue);
      this._touchPrevented = [];
    }

    this.updateStyles();

    this._selectParsedOrFocusedDate();

    if (this._nativeInput && this._nativeInput.selectionStart) {
      this._nativeInput.selectionStart = this._nativeInput.selectionEnd;
    }
    // No need to revalidate the value after `_selectedDateChanged`
    // Needed in case the value was not changed: open and close dropdown.
    if (!this.value) {
      this.validateStart();
      this.validateEnd();
    }
  }

  /**
    * Returns true if `value` is valid, and sets the `invalid` flag appropriately.
    *
    * @param {string=} value Value to validate. Optional, defaults to user's input value.
    * @return {boolean} True if the value is valid and sets the `invalid` flag appropriately
    */
    validateStart() {
    // Note (Yuriy): Workaround `this._inputValue` is used in order
    // to avoid breaking change on custom `checkValidity`.
    // Can be removed with next major.
    return !(this.invalid = !this.checkStartValidity(this._inputValue));
  }

  /**
    * Returns true if `value` is valid, and sets the `invalid` flag appropriately.
    *
    * @param {string=} value Value to validate. Optional, defaults to user's input value.
    * @return {boolean} True if the value is valid and sets the `invalid` flag appropriately
    */
    validateEnd() {
    // Note (Yuriy): Workaround `this._inputValue` is used in order
    // to avoid breaking change on custom `checkValidity`.
    // Can be removed with next major.
    return !(this.invalid = !this.checkEndValidity(this._inputValue));
  }

  /**
    * Returns true if the current input value satisfies all constraints (if any)
    *
    * Override the `checkValidity` method for custom validations.
    *
    * @param {string=} value Value to validate. Optional, defaults to the selected date.
    * @return {boolean} True if the value is valid
    */
  checkStartValidity() {
    //for start date
    const startInputValid = !this._inputStartValue ||
      (this._selectedStartDate && this._inputStartValue === this._getFormattedDate(this.i18n.formatDate, this._selectedStartDate));
    const startMinMaxValid = !this._selectedStartDate ||
      dateAllowed(this._selectedStartDate, this._minDate, this._maxDate);

    let startInputValidity = true;
    if (this._inputStartElement) {
      if (this._inputStartElement.checkValidity) {
        // vaadin native input elements have the checkValidity method
        this._inputStartElement.__forceCheckValidity = true;
        startInputValidity = this._inputStartElement.checkValidity();
        this._inputStartElement.__forceCheckValidity = false;
      } else if (this._inputStartElement.validate) {
        // iron-form-elements have the validate API
        startInputValidity = this._inputStartElement.validate();
      }
    }
    return startInputValid && startMinMaxValid && startInputValidity;
  }

  checkEndValidity() {
    //for end date
    const endInputValid = !this._inputEndValue ||
      (this._selectedEndDate && this._inputEndValue === this._getFormattedDate(this.i18n.formatDate, this._selectedEndDate));
    const endMinMaxValid = !this._selectedEndDate ||
      dateAllowed(this._selectedEndDate, this._minDate, this._maxDate);

    let endInputValidity = true;
    if (this._inputEndElement) {
      if (this._inputEndElement.checkValidity) {
        // vaadin native input elements have the checkValidity method
        this._inputEndElement.__forceCheckValidity = true;
        endInputValidity = this._inputEndElement.checkValidity();
        this._inputEndElement.__forceCheckValidity = false;
      } else if (this._inputEndElement.validate) {
        // iron-form-elements have the validate API
        endInputValidity = this._inputEndElement.validate();
      }
    }

    return endInputValid && endMinMaxValid && endInputValidity;
  }

  removePreselectionById(id) {
    var handler = e => {
      if (e.detail.value) {
        this._overlayContent.removePreselectionById(id);
      }
      this.$.overlay.removeEventListener('opened-changed',handler);
    }
    this.$.overlay.addEventListener('opened-changed', handler);
  }

  /** @private */
  _onScroll(e) {
    if (e.target === window || !this._overlayContent.contains(e.target)) {
      this._updateAlignmentAndPosition();
    }
  }

  /** @protected */
  _focusStart() {
    if (this._noInput) {
      this._overlayInitialized && this._overlayContent.focus();
    } else {
      this._inputStartElement.focus();
    }
  }

  /** @protected */
  _focusEnd() {
    if (this._noInput) {
      this._overlayInitialized && this._overlayContent.focus();
    } else {
      this._inputEndElement.focus();
    }
  }

  /** @private */
  _focusAndSelect() {
    this._focus();
    this._setSelectionRange(0, this._inputValue.length);
  }

  /** @private */
  _applyStartInputValue(date) {
    this._inputStartValue = date ? this._getFormattedDate(this.i18n.formatDate, date) : '';
  }

  /** @private */
  _applyEndInputValue(date) {
    this._inputEndValue = date ? this._getFormattedDate(this.i18n.formatDate, date) : '';
  }

  /** @private */
  _getFormattedDate(formatDate, date) {
    return formatDate(extractDateParts(date));
  }

  /** @private */
  _setSelectionRange(a, b) {
    if (this._nativeInput && this._nativeInput.setSelectionRange) {
      this._nativeInput.setSelectionRange(a, b);
    }
  }

  /**
    * Keyboard Navigation
    * @private
    */
  _eventKey(e) {
    var keys = ['down', 'up', 'enter', 'esc', 'tab'];

    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (IronA11yKeysBehavior.keyboardEventMatchesKeys(e, k)) {
        return k;
      }
    }
  }

  /** @private */
  _isValidDate(d) {
    return d && !isNaN(d.getTime());
  }

  /** @private */
  _onKeydown(e) {
    if (this._noInput) {
      // The input element cannot be readonly as it would conflict with
      // the required attribute. Both are not allowed on an input element.
      // Therefore we prevent default on most keydown events.
      var allowedKeys = [
        9 // tab
      ];
      if (allowedKeys.indexOf(e.keyCode) === -1) {
        e.preventDefault();
      }
    }

    switch (this._eventKey(e)) {
      case 'down':
      case 'up':
        // prevent scrolling the page with arrows
        e.preventDefault();

        if (this.opened) {
          this._overlayContent.focus();
          this._overlayContent._onKeydown(e);
        } else {
          this._focusOverlayOnOpen = true;
          this.open();
        }

        break;
      case 'enter': {

        if (this._selectingStartDate) {
          const parsedStartDate = this._getParsedDate(this._inputStartValue);
          const isValidStartDate = this._isValidDate(parsedStartDate);
          if (this.opened) {
            if (this._overlayInitialized && this._overlayContent.focusedDate && isValidStartDate) {
              this._selectedStartDate = this._overlayContent.focusedDate;
            }
            this.close();
          } else {
            if (!isValidStartDate && this._inputStartElement.value !== '') {
              this.validateStart();
            } else {
              const oldValue = this.value;
              this._selectParsedOrFocusedDate();
              if (oldValue === this.value) {
                this.validateStart();
              }
            }
          }
        } else {
          const parsedEndDate = this._getParsedDate(this._inputEndValue);
          const isValidEndDate = this._isValidDate(parsedEndDate);
          if (this.opened) {
            if (this._overlayInitialized && this._overlayContent.focusedDate && isValidEndDate) {
              this._selectedEndDate = this._overlayContent.focusedDate;
            }
            this.close();
          } else {
            if (!isValidEndDate && this._inputEndElement.value !== '') {
              this.validateEnd();
            } else {
              const oldValue = this.value;
              this._selectParsedOrFocusedDate();
              if (oldValue === this.value) {
                this.validateEnd();
              }
            }
          }
        }


        break;
      }
      case 'esc':
        if (this.opened) {
          // FIX: for now will just affect the start date
          this._focusedDate = this._selectedStartDate;
          this._close();
        } else if (this.autoOpenDisabled) {
          // Do not restore selected date if Esc was pressed after clearing input field
          if (this._inputStartElement.value === '') {
            this._selectedStartDate = null;
          }
          this._applyStartInputValue(this._selectedStartDate);
          if (this._inputEndElement.value === '') {
            this._selectedEndDate = null;
          }
          this._applyInputEndValue(this._selectedEndDate);
        } else {
          this._focusedDate = this._selectedStartDate;
          this._selectParsedOrFocusedDate();
        }
        break;
      case 'tab':
        if (this.opened) {
          e.preventDefault();
          // Clear the selection range (remains visible on IE)
          this._setSelectionRange(0, 0);
          if (e.shiftKey) {
            this._overlayContent.focusCancel();
          } else {
            this._overlayContent.focus();
            this._overlayContent.revealDate(this._focusedDate);
          }

        }
        break;
    }
  }

  /** @private */
  _getParsedDate(inputValue = this._inputStartValue) {
    const dateObject = this.i18n.parseDate && this.i18n.parseDate(inputValue);
    const parsedDate = dateObject &&
      this._parseDate(dateObject.year + '-' + (dateObject.month + 1) + '-' + dateObject.day);
    return parsedDate;
  }

  /** @private */
  _onUserInputStart(e) {
    if (!this.opened && this._inputStartElement.value && !this.autoOpenDisabled) {
      this.open();
    }
    this._userInputStartValueChanged();

    if (e.__fromClearButton) {
      this.validateStart();
      this.__dispatchChange = true;
      this.value = ';';
      this.__dispatchChange = false;
    }
  }

  /** @private */
  _onUserInputEnd(e) {
    if (!this.opened && this._inputEndElement.value && !this.autoOpenDisabled) {
      this.open();
    }
    this._userInputEndValueChanged();

    if (e.__fromClearButton) {
      this.validateEnd();
      this.__dispatchChange = true;
      this.value = ';';
      this.__dispatchChange = false;
    }
  }

  /** @private */
  _userInputStartValueChanged(value) {
    if (this.opened && this._inputStartValue) {
      const parsedDate = this._getParsedDate(this._inputStartValue);

      if (this._isValidDate(parsedDate)) {
        this._ignoreFocusedDateChange = true;
        if (!dateEquals(parsedDate, this._focusedDate)) {
          this._focusedDate = parsedDate;
        }
        this._ignoreFocusedDateChange = false;
      }
    }
  }

  /** @private */
  _userInputEndValueChanged(value) {
    if (this.opened && this._inputEndValue) {
      const parsedDate = this._getParsedDate(this._inputEndValue);

      if (this._isValidDate(parsedDate)) {
        this._ignoreFocusedDateChange = true;
        if (!dateEquals(parsedDate, this._focusedDate)) {
          this._focusedDate = parsedDate;
        }
        this._ignoreFocusedDateChange = false;
      }
    }
  }

  /** @private */
  _announceFocusedDate(_focusedDate, opened, _ignoreAnnounce) {
    if (opened && !_ignoreAnnounce) {
      this._overlayContent.announceFocusedDate();
    }
  }

  /** @private */
  get _overlayContent() {
    return this.$.overlay.content.querySelector('#overlay-content');
  }

  /**
    * Fired when the user commits a value change.
    *
    * @event change
    */
};
