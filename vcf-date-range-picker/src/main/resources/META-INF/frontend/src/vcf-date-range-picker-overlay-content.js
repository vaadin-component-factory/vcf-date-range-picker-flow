import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import { addListener, setTouchAction } from '@polymer/polymer/lib/utils/gestures.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { IronA11yKeysBehavior } from '@polymer/iron-a11y-keys-behavior/iron-a11y-keys-behavior.js';
import { IronA11yAnnouncer } from '@polymer/iron-a11y-announcer/iron-a11y-announcer.js';
import '@polymer/iron-media-query/iron-media-query.js';
import '@vaadin/vaadin-button/src/vaadin-button.js';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import { DirMixin } from '@vaadin/vaadin-element-mixin/vaadin-dir-mixin.js';
import './vcf-date-range-month-calendar.js';
import './vcf-date-range-infinite-scroller.js';
import { dateEquals, getClosestDate, getISOWeekNumber, extractDateParts } from './vcf-date-range-picker-helper.js';
import './vcf-date-range-picker-styles.js';

/**
 * @extends HTMLElement
 * @private
 */
class DatePickerOverlayContentElement extends ThemableMixin(DirMixin(GestureEventListeners(PolymerElement))) {
  static get template() {
    return html`
    <style>
      :host {
        display: flex;
        flex-direction: row;
        height: 100%;
        width: 100%;
        outline: none;
        background: #fff;
      }

      [part="overlay-header"] {
        display: flex;
        flex-shrink: 0;
        flex-wrap: nowrap;
        align-items: center;
      }

      :host(:not([fullscreen])) [part="overlay-header"] {
        display: none;
      }

      [part="label"] {
        flex-grow: 1;
      }

      [part="clear-button"]:not([showclear]) {
        display: none;
      }

      [part="years-toggle-button"] {
        display: flex;
      }

      [part="years-toggle-button"][desktop] {
        display: none;
      }

      :host(:not([years-visible])) [part="years-toggle-button"]::before {
        transform: rotate(180deg);
      }

      #scrollers {
        display: flex;
        height: 100%;
        width: 100%;
        position: relative;
        overflow: hidden;
      }

      [part="months"],
      [part="years"] {
        height: 100%;
      }

      [part="months"] {
        --vaadin-infinite-scroller-item-height: 270px;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }

      #scrollers[desktop] [part="months"] {
        right: 50px;
        transform: none !important;
      }

      [part="years"] {
        --vaadin-infinite-scroller-item-height: 80px;
        width: 50px;
        position: absolute;
        right: 0;
        transform: translateX(100%);
        -webkit-tap-highlight-color: transparent;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        /* Center the year scroller position. */
        --vaadin-infinite-scroller-buffer-offset: 50%;
      }

      #scrollers[desktop] [part="years"] {
        position: absolute;
        transform: none !important;
      }

      [part="years"]::before {
        content: '';
        display: block;
        background: transparent;
        width: 0;
        height: 0;
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        border-width: 6px;
        border-style: solid;
        border-color: transparent;
        border-left-color: #000;
      }

      :host(.animate) [part="months"],
      :host(.animate) [part="years"] {
        transition: all 200ms;
      }

      [part="toolbar"] {
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        z-index: 2;
        flex-shrink: 0;
        flex-direction: column;
        margin-right: 0px;
      }

      [part~="overlay-header"]:not([desktop]) {
        padding-bottom: 40px;
      }

      [part~="years-toggle-button"] {
        position: absolute;
        top: auto;
        right: 8px;
        bottom: 0;
        z-index: 1;
        padding: 8px;
      }

      #announcer {
        display: inline-block;
        position: fixed;
        clip: rect(0, 0, 0, 0);
        clip-path: inset(100%);
      }
    </style>

    <div id="announcer" role="alert" aria-live="polite">
      [[i18n.calendar]]
    </div>

    <div part="overlay-header" on-touchend="_preventDefault" desktop$="[[_desktopMode]]" aria-hidden="true">
      <div part="label">[[_formatDisplayed(selectedStartDate, i18n.formatDate, label)]]</div>
      <div part="clear-button" on-tap="_clear" showclear$="[[_showClear(selectedStartDate, selectedEndDate)]]"></div>
      <div part="toggle-button" on-tap="_cancel"></div>

      <div part="years-toggle-button" desktop$="[[_desktopMode]]" on-tap="_toggleYearScroller" aria-hidden="true">
        [[_yearAfterXMonths(_visibleMonthIndex)]]
      </div>
    </div>
    <div on-touchend="_preventDefault" role="toolbar" part="toolbar">
      <vaadin-button id="todayButton" theme="tertiary" part="today-button" disabled="[[!_isTodayAllowed(minDate, maxDate)]]" on-tap="_onTodayTap">
        [[i18n.today]]
      </vaadin-button>
      <vaadin-button id="yesterdayButton" theme="tertiary" part="preset-button" on-tap="_onYesterdayTap">
        [[i18n.yesterday]]
      </vaadin-button>
      <vaadin-button id="thisWeekButton" theme="tertiary" part="preset-button" on-tap="_onThisWeekTap">
        [[i18n.thisWeek]]
      </vaadin-button>
      <vaadin-button id="lastWeekButton" theme="tertiary" part="preset-button" on-tap="_onLastWeekTap">
        [[i18n.lastWeek]]
      </vaadin-button>
      <vaadin-button id="thisMonthButton" theme="tertiary" part="preset-button" on-tap="_onThisMonthTap">
        [[i18n.thisMonth]]
      </vaadin-button>
      <vaadin-button id="lastMonthButton" theme="tertiary" part="preset-button" on-tap="_onLastMonthTap">
        [[i18n.lastMonth]]
      </vaadin-button>
      <vaadin-button id="thisYearButton" theme="tertiary" part="preset-button" on-tap="_onThisYearTap">
        [[i18n.thisYear]]
      </vaadin-button>
      <vaadin-button id="lastYearButton" theme="tertiary" part="preset-button" on-tap="_onLastYearTap">
        [[i18n.lastYear]]
      </vaadin-button>
      <vaadin-button id="cancelButton" theme="tertiary" part="cancel-button" on-tap="_cancel">
        [[i18n.cancel]]
      </vaadin-button>
    </div>

    <div id="scrollers" desktop$="[[_desktopMode]]" on-track="_track">
      <vcf-date-range-infinite-scroller id="monthScroller" on-custom-scroll="_onMonthScroll" on-touchstart="_onMonthScrollTouchStart" buffer-size="3" active="[[initialPosition]]" part="months">
        <template>
          <vcf-date-range-month-calendar
            i18n="[[i18n]]"
            month="[[_dateAfterXMonths(index)]]"
            selected-start-date="{{selectedStartDate}}"
            selected-end-date="{{selectedEndDate}}"
            selecting-start-date="{{selectingStartDate}}"
            focused-date="[[focusedDate]]"
            ignore-taps="[[_ignoreTaps]]"
            show-week-numbers="[[showWeekNumbers]]"
            min-date="[[minDate]]"
            max-date="[[maxDate]]"
            focused$="[[_focused]]"
            part="month"
            theme$="[[theme]]">
          </vcf-date-range-month-calendar>
        </template>
      </vcf-date-range-infinite-scroller>
      <vcf-date-range-infinite-scroller id="yearScroller" on-tap="_onYearTap" on-custom-scroll="_onYearScroll" on-touchstart="_onYearScrollTouchStart" buffer-size="12" active="[[initialPosition]]" part="years">
        <template>
          <div part="year-number" role="button" current$="[[_isCurrentYear(index)]]" selected$="[[_isSelectedYear(index, selectedStartDate)]]">
            [[_yearAfterXYears(index)]]
          </div>
          <div part="year-separator" aria-hidden="true"></div>
        </template>
      </vcf-date-range-infinite-scroller>
    </div>


    <iron-media-query query="(min-width: 375px)" query-matches="{{_desktopMode}}"></iron-media-query>
    `;
  }

  static get is() {
    return 'vcf-date-range-picker-overlay-content';
  }

  static get properties() {
    return {
      /**
       * The value for this element.
       */
      selectedStartDate: {
        type: Date,
        notify: true
      },

      /**
       * The value for this element.
       */
      selectedEndDate: {
        type: Date,
        notify: true
      },

      /**
       * Boolean to control which date we're currently selecting
       */
      selectingStartDate: {
        type: Boolean,
        value: true,
        notify: true
      },

      /**
       * Date value which is focused using keyboard.
       */
      focusedDate: {
        type: Date,
        notify: true,
        observer: '_focusedDateChanged'
      },

      _focusedMonthDate: Number,

      /**
       * Date which should be visible when there is no value selected.
       */
      initialPosition: {
        type: Date,
        observer: '_initialPositionChanged'
      },

      _originDate: {
        value: new Date()
      },

      _visibleMonthIndex: Number,

      _desktopMode: Boolean,

      _translateX: {
        observer: '_translateXChanged'
      },

      _yearScrollerWidth: {
        value: 50
      },

      i18n: {
        type: Object
      },

      showWeekNumbers: {
        type: Boolean
      },

      _ignoreTaps: Boolean,

      _notTapping: Boolean,

      /**
       * The earliest date that can be selected. All earlier dates will be disabled.
       */
      minDate: Date,

      /**
       * The latest date that can be selected. All later dates will be disabled.
       */
      maxDate: Date,

      _focused: Boolean,

      /**
       * Input label
       */
      label: String
    };
  }

  get __isRTL() {
    return this.getAttribute('dir') === 'rtl';
  }

  ready() {
    super.ready();
    this.setAttribute('tabindex', 0);
    this.addEventListener('keydown', this._onKeydown.bind(this));
    addListener(this, 'tap', this._stopPropagation);
    this.addEventListener('focus', this._onOverlayFocus.bind(this));
    this.addEventListener('blur', this._onOverlayBlur.bind(this));
  }

  /**
   * Fired when the scroller reaches the target scrolling position.
   * @event scroll-animation-finished
   * @param {Number} detail.position new position
   * @param {Number} detail.oldPosition old position
   */

  connectedCallback() {
    super.connectedCallback();
    this._closeYearScroller();
    this._toggleAnimateClass(true);
    setTouchAction(this.$.scrollers, 'pan-y');
    IronA11yAnnouncer.requestAvailability();
  }

  announceFocusedDate() {
    var focusedDate = this._currentlyFocusedDate();
    var announce = [];
    if (dateEquals(focusedDate, new Date())) {
      announce.push(this.i18n.today);
    }
    announce = announce.concat([
      this.i18n.weekdays[focusedDate.getDay()],
      focusedDate.getDate(),
      this.i18n.monthNames[focusedDate.getMonth()],
      focusedDate.getFullYear()
    ]);
    if (this.showWeekNumbers && this.i18n.firstDayOfWeek === 1) {
      announce.push(this.i18n.week);
      announce.push(getISOWeekNumber(focusedDate));
    }
    this.dispatchEvent(new CustomEvent('iron-announce', {
      bubbles: true,
      composed: true,
      detail: {
        text: announce.join(' ')
      }
    }));
    return;
  }

  /**
   * Focuses the cancel button
   */
  focusCancel() {
    this.$.cancelButton.focus();
  }

  /**
   * Scrolls the list to the given Date.
   */
  scrollToDate(date, animate) {
    this._scrollToPosition(this._differenceInMonths(date, this._originDate), animate);
  }

  _focusedDateChanged(focusedDate) {
    this.revealDate(focusedDate);
  }

  _isCurrentYear(yearsFromNow) {
    return yearsFromNow === 0;
  }

  _isSelectedYear(yearsFromNow, selectedDate) {
    if (selectedDate) {
      return selectedDate.getFullYear() === this._originDate.getFullYear() + yearsFromNow;
    }
  }

  /**
   * Scrolls the month and year scrollers enough to reveal the given date.
   */
  revealDate(date) {
    if (date) {
      var diff = this._differenceInMonths(date, this._originDate);
      var scrolledAboveViewport = this.$.monthScroller.position > diff;

      var visibleItems = this.$.monthScroller.clientHeight / this.$.monthScroller.itemHeight;
      var scrolledBelowViewport = this.$.monthScroller.position + visibleItems - 1 < diff;

      if (scrolledAboveViewport) {
        this._scrollToPosition(diff, true);
      } else if (scrolledBelowViewport) {
        this._scrollToPosition(diff - visibleItems + 1, true);
      }
    }
  }

  _onOverlayFocus() {
    this._focused = true;
  }

  _onOverlayBlur() {
    this._focused = false;
  }

  _initialPositionChanged(initialPosition) {
    this.scrollToDate(initialPosition);
  }

  _repositionYearScroller() {
    this._visibleMonthIndex = Math.floor(this.$.monthScroller.position);
    this.$.yearScroller.position = (this.$.monthScroller.position + this._originDate.getMonth()) / 12;
  }

  _repositionMonthScroller() {
    this.$.monthScroller.position = this.$.yearScroller.position * 12 - this._originDate.getMonth();
    this._visibleMonthIndex = Math.floor(this.$.monthScroller.position);
  }

  _onMonthScroll() {
    this._repositionYearScroller();
    this._doIgnoreTaps();
  }

  _onYearScroll() {
    this._repositionMonthScroller();
    this._doIgnoreTaps();
  }

  _onYearScrollTouchStart() {
    this._notTapping = false;
    setTimeout(() => this._notTapping = true, 300);

    this._repositionMonthScroller();
  }

  _onMonthScrollTouchStart() {
    this._repositionYearScroller();
  }

  _doIgnoreTaps() {
    this._ignoreTaps = true;
    this._debouncer = Debouncer.debounce(this._debouncer,
      timeOut.after(300), () => this._ignoreTaps = false);
  }

  _formatDisplayed(date, formatDate, label) {
    if (date) {
      return formatDate(extractDateParts(date));
    } else {
      return label;
    }
  }

  _onTodayTap() {
    var today = new Date();

    if (Math.abs(this.$.monthScroller.position - this._differenceInMonths(today, this._originDate)) < 0.001) {
      // Select today only if the month scroller is positioned approximately
      // at the beginning of the current month
      this.selectedStartDate = today;
      this.selectedEndDate = today;
      this._close();
    } else {
      this._scrollToCurrentMonth();
    }
  }

  _onYesterdayTap() {
    const yesterday = new Date(new Date())
    yesterday.setDate(yesterday.getDate() - 1)

    if (Math.abs(this.$.monthScroller.position - this._differenceInMonths(yesterday, this._originDate)) < 0.001) {
      // Select yesterday only if the month scroller is positioned approximately
      // at the beginning of the current month
      this.selectedStartDate = yesterday;
      this.selectedEndDate = yesterday;
      this._close();
    } else {
      this._scrollToCurrentMonth();
    }
  }

  _onThisWeekTap() {
    var lastSunday = this._getLastSunday(new Date());
    this.selectedStartDate = lastSunday;
    var nextSunday = new Date();
    nextSunday.setDate(lastSunday.getDate() + 6);
    this.selectedEndDate = nextSunday;
    this._close();
  }

  _onLastWeekTap() {
    var lastSunday = this._getLastSunday(new Date());
    lastSunday.setDate(lastSunday.getDate() - 7);
    this.selectedStartDate = lastSunday;
    var nextSunday = new Date();
    nextSunday.setDate(lastSunday.getDate() + 6);
    this.selectedEndDate = nextSunday;
    this._close();
  }

  _onThisMonthTap() {
    var firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    this.selectedStartDate = firstDay;
    var lastDay = new Date(new Date().getFullYear(), new Date().getMonth()+1, 0);
    this.selectedEndDate = lastDay;
    this._close();
  }

  _onLastMonthTap() {
    var firstDay = new Date(new Date().getFullYear(), new Date().getMonth()-1, 1);
    this.selectedStartDate = firstDay;
    var lastDay = new Date(new Date().getFullYear(), new Date().getMonth(), 0);
    this.selectedEndDate = lastDay;
    this._close();
  }

  _onThisYearTap() {
    var firstDay = new Date(new Date().getFullYear(), 0, 1);
    this.selectedStartDate = firstDay;
    var lastDay = new Date(new Date().getFullYear()+1, 0, 0);
    this.selectedEndDate = lastDay;
    this._close();
  }

  _onLastYearTap() {
    var firstDay = new Date(new Date().getFullYear()-1, 0, 1);
    this.selectedStartDate = firstDay;
    var lastDay = new Date(new Date().getFullYear(), 0, 0);
    this.selectedEndDate = lastDay;
    this._close();
  }

  _getLastSunday(d) {
    var t = new Date(d);
    t.setDate(t.getDate() - t.getDay());
    return t;
  }

  _scrollToCurrentMonth() {
    if (this.focusedDate) {
      this.focusedDate = new Date();
    }

    this.scrollToDate(new Date(), true);
  }

  _showClear(selectedStartDate, selectedEndDate) {
    return !!(selectedStartDate | selectedEndDate);
  }

  _onYearTap(e) {
    if (!this._ignoreTaps && !this._notTapping) {
      var scrollDelta = e.detail.y - (this.$.yearScroller.getBoundingClientRect().top + this.$.yearScroller.clientHeight / 2);
      var yearDelta = scrollDelta / this.$.yearScroller.itemHeight;
      this._scrollToPosition(this.$.monthScroller.position + yearDelta * 12, true);
    }
  }

  _scrollToPosition(targetPosition, animate) {
    if (this._targetPosition !== undefined) {
      this._targetPosition = targetPosition;
      return;
    }

    if (!animate) {
      this.$.monthScroller.position = targetPosition;
      this._targetPosition = undefined;
      this._repositionYearScroller();
      return;
    }

    this._targetPosition = targetPosition;

    // http://gizma.com/easing/
    var easingFunction = (t, b, c, d) => {
      t /= d / 2;
      if (t < 1) {
        return c / 2 * t * t + b;
      }
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    };

    var duration = animate ? 300 : 0;
    var start = 0;
    var initialPosition = this.$.monthScroller.position;

    var smoothScroll = timestamp => {
      start = start || timestamp;
      var currentTime = timestamp - start;

      if (currentTime < duration) {
        var currentPos = easingFunction(currentTime, initialPosition, this._targetPosition - initialPosition, duration);
        this.$.monthScroller.position = currentPos;
        window.requestAnimationFrame(smoothScroll);
      } else {
        this.dispatchEvent(new CustomEvent('scroll-animation-finished', {
          bubbles: true,
          composed: true,
          detail: {
            position: this._targetPosition,
            oldPosition: initialPosition
          }
        }));

        this.$.monthScroller.position = this._targetPosition;
        this._targetPosition = undefined;
      }

      setTimeout(this._repositionYearScroller.bind(this), 1);
    };

    // Start the animation.
    window.requestAnimationFrame(smoothScroll);
  }

  _limit(value, range) {
    return Math.min(range.max, Math.max(range.min, value));
  }

  _handleTrack(e) {
    // Check if horizontal movement threshold (dx) not exceeded or
    // scrolling fast vertically (ddy).
    if (Math.abs(e.detail.dx) < 10 || Math.abs(e.detail.ddy) > 10) {
      return;
    }

    // If we're flinging quickly -> start animating already.
    if (Math.abs(e.detail.ddx) > this._yearScrollerWidth / 3) {
      this._toggleAnimateClass(true);
    }

    var newTranslateX = this._translateX + e.detail.ddx;
    this._translateX = this._limit(newTranslateX, {
      min: 0,
      max: this._yearScrollerWidth
    });
  }

  _track(e) {
    if (this._desktopMode) {
      // No need to track for swipe gestures on desktop.
      return;
    }

    switch (e.detail.state) {
      case 'start':
        this._toggleAnimateClass(false);
        break;

      case 'track':
        this._handleTrack(e);
        break;

      case 'end':
        this._toggleAnimateClass(true);
        if (this._translateX >= this._yearScrollerWidth / 2) {
          this._closeYearScroller();
        } else {
          this._openYearScroller();
        }
        break;
    }
  }

  _toggleAnimateClass(enable) {
    if (enable) {
      this.classList.add('animate');
    } else {
      this.classList.remove('animate');
    }
  }

  _toggleYearScroller() {
    this._isYearScrollerVisible() ? this._closeYearScroller() : this._openYearScroller();
  }

  _openYearScroller() {
    this._translateX = 0;
    this.setAttribute('years-visible', '');
  }

  _closeYearScroller() {
    this.removeAttribute('years-visible');
    this._translateX = this._yearScrollerWidth;
  }

  _isYearScrollerVisible() {
    return this._translateX < this._yearScrollerWidth / 2;
  }

  _translateXChanged(x) {
    if (!this._desktopMode) {
      this.$.monthScroller.style.transform = 'translateX(' + (x - this._yearScrollerWidth) + 'px)';
      this.$.yearScroller.style.transform = 'translateX(' + x + 'px)';
    }
  }

  _yearAfterXYears(index) {
    var result = new Date(this._originDate);
    result.setFullYear(parseInt(index) + this._originDate.getFullYear());
    return result.getFullYear();
  }

  _yearAfterXMonths(months) {
    return this._dateAfterXMonths(months).getFullYear();
  }

  _dateAfterXMonths(months) {
    var result = new Date(this._originDate);
    result.setDate(1);
    result.setMonth(parseInt(months) + this._originDate.getMonth());
    return result;
  }

  _differenceInMonths(date1, date2) {
    var months = (date1.getFullYear() - date2.getFullYear()) * 12;
    return months - date2.getMonth() + date1.getMonth();
  }

  _differenceInYears(date1, date2) {
    return this._differenceInMonths(date1, date2) / 12;
  }

  _clear() {
    this.selectedStartDate = '';
    this.selectedEndDate = '';
  }

  _close() {
    const overlayContent = this.getRootNode().host;
    const overlay = overlayContent ? overlayContent.getRootNode().host : null;
    if (overlay) {
      overlay.opened = false;
    }

    this.dispatchEvent(new CustomEvent('close', {bubbles: true, composed: true}));
  }

  _cancel() {
    this.focusedDate = this.selectedStartDate;
    this._close();
  }

  _preventDefault(e) {
    e.preventDefault();
  }

  /**
   * Keyboard Navigation
   */
  _eventKey(e) {
    var keys = ['down', 'up', 'right', 'left', 'enter', 'space', 'home', 'end', 'pageup', 'pagedown', 'tab', 'esc'];

    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (IronA11yKeysBehavior.keyboardEventMatchesKeys(e, k)) {
        return k;
      }
    }
  }

  _onKeydown(e) {
    var focus = this._currentlyFocusedDate();

    // Cannot use (today/cancel).focused flag because vaadin-text-field removes it
    // previously in the keydown event.
    const isToday = e.composedPath().indexOf(this.$.todayButton) >= 0;
    const isCancel = e.composedPath().indexOf(this.$.cancelButton) >= 0;
    const isScroller = !isToday && !isCancel;

    var eventKey = this._eventKey(e);
    if (eventKey === 'tab') {
      // We handle tabs here and don't want to bubble up.
      e.stopPropagation();

      const isFullscreen = this.hasAttribute('fullscreen');
      const isShift = e.shiftKey;

      if (isFullscreen) {
        e.preventDefault();
      } else if (isShift && isScroller || !isShift && isCancel) {
        // Return focus back to the input field
        e.preventDefault();
        this.dispatchEvent(new CustomEvent('focus-input', {bubbles: true, composed: true}));
      } else if (isShift && isToday) {
        // Browser returns focus back to the scrollable area. We need to set
        // the focused flag, and move the scroll to focused date.
        this._focused = true;
        setTimeout(() => this.revealDate(this.focusedDate), 1);
      } else {
        // Browser moves the focus out of the scroller, hence focused flag must
        // set to false.
        this._focused = false;
      }
    } else if (eventKey) {
      e.preventDefault();
      e.stopPropagation();
      switch (eventKey) {
        case 'down':
          this._moveFocusByDays(7);
          this.focus();
          break;
        case 'up':
          this._moveFocusByDays(-7);
          this.focus();
          break;
        case 'right':
          if (isScroller) {
            this._moveFocusByDays(this.__isRTL ? -1 : 1);
          }
          break;
        case 'left':
          if (isScroller) {
            this._moveFocusByDays(this.__isRTL ? 1 : -1);
          }
          break;
        case 'enter':
          if (isScroller || isCancel) {
            this._close();
          } else if (isToday) {
            this._onTodayTap();
          }
          break;
        case 'space':
          if (isCancel) {
            this._close();
          } else if (isToday) {
            this._onTodayTap();
          } else {
            var focusedDate = this.focusedDate;
            if (dateEquals(focusedDate, this.selectedStartDate)) {
              this.selectedStartDate = '';
              this.focusedDate = focusedDate;
            } else {
              this.selectedStartDate = focusedDate;
            }
          }
          break;
        case 'home':
          this._moveFocusInsideMonth(focus, 'minDate');
          break;
        case 'end':
          this._moveFocusInsideMonth(focus, 'maxDate');
          break;
        case 'pagedown':
          this._moveFocusByMonths(e.shiftKey ? 12 : 1);
          break;
        case 'pageup':
          this._moveFocusByMonths(e.shiftKey ? -12 : -1);
          break;
        case 'esc':
          this._cancel();
          break;
      }
    }
  }

  _currentlyFocusedDate() {
    return this.focusedDate || this.selectedStartDate || this.initialPosition || new Date();
  }

  _focusDate(dateToFocus) {
    this.focusedDate = dateToFocus;
    this._focusedMonthDate = dateToFocus.getDate();
  }

  _focusClosestDate(focus) {
    this._focusDate(getClosestDate(focus, [this.minDate, this.maxDate]));
  }

  _moveFocusByDays(days) {
    var focus = this._currentlyFocusedDate();
    var dateToFocus = new Date(0, 0);
    dateToFocus.setFullYear(focus.getFullYear());
    dateToFocus.setMonth(focus.getMonth());
    dateToFocus.setDate(focus.getDate() + days);

    if (this._dateAllowed(dateToFocus, this.minDate, this.maxDate)) {
      this._focusDate(dateToFocus);
    } else {
      if (this._dateAllowed(focus, this.minDate, this.maxDate)) {
        // Move to min or max date
        if (days > 0) { // down or right
          this._focusDate(this.maxDate);
        } else { // up or left
          this._focusDate(this.minDate);
        }
      } else {
        // Move to closest allowed date
        this._focusClosestDate(focus);
      }
    }
  }

  _moveFocusByMonths(months) {
    var focus = this._currentlyFocusedDate();
    var dateToFocus = new Date(0, 0);
    dateToFocus.setFullYear(focus.getFullYear());
    dateToFocus.setMonth(focus.getMonth() + months);

    var targetMonth = dateToFocus.getMonth();

    dateToFocus.setDate(this._focusedMonthDate || (this._focusedMonthDate = focus.getDate()));
    if (dateToFocus.getMonth() !== targetMonth) {
      dateToFocus.setDate(0);
    }

    if (this._dateAllowed(dateToFocus, this.minDate, this.maxDate)) {
      this.focusedDate = dateToFocus;
    } else {
      if (this._dateAllowed(focus, this.minDate, this.maxDate)) {
        // Move to min or max date
        if (months > 0) { // pagedown
          this._focusDate(this.maxDate);
        } else { // pageup
          this._focusDate(this.minDate);
        }
      } else {
        // Move to closest allowed date
        this._focusClosestDate(focus);
      }
    }
  }

  _moveFocusInsideMonth(focusedDate, property) {
    var dateToFocus = new Date(0, 0);
    dateToFocus.setFullYear(focusedDate.getFullYear());

    if (property === 'minDate') {
      dateToFocus.setMonth(focusedDate.getMonth());
      dateToFocus.setDate(1);
    } else {
      dateToFocus.setMonth(focusedDate.getMonth() + 1);
      dateToFocus.setDate(0);
    }

    if (this._dateAllowed(dateToFocus, this.minDate, this.maxDate)) {
      this._focusDate(dateToFocus);
    } else {
      if (this._dateAllowed(focusedDate, this.minDate, this.maxDate)) {
        // Move to minDate or maxDate
        this._focusDate(this[property]);
      } else {
        // Move to closest allowed date
        this._focusClosestDate(focusedDate);
      }
    }
  }

  _dateAllowed(date, min, max) {
    return (!min || date >= min) && (!max || date <= max);
  }

  _isTodayAllowed(min, max) {
    var today = new Date();
    var todayMidnight = new Date(0, 0);
    todayMidnight.setFullYear(today.getFullYear());
    todayMidnight.setMonth(today.getMonth());
    todayMidnight.setDate(today.getDate());
    return this._dateAllowed(todayMidnight, min, max);
  }

  _stopPropagation(e) {
    e.stopPropagation();
  }
}

customElements.define(DatePickerOverlayContentElement.is, DatePickerOverlayContentElement);

