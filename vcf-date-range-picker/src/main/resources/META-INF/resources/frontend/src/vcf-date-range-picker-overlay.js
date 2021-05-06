import { OverlayElement } from '@vaadin/vaadin-overlay/src/vaadin-overlay.js';
import { DisableUpgradeMixin } from '@polymer/polymer/lib/mixins/disable-upgrade-mixin.js';

/**
 * The overlay element.
 *
 * ### Styling
 *
 * See [`<vaadin-overlay>` documentation](https://github.com/vaadin/vaadin-overlay/blob/master/src/vaadin-overlay.html)
 * for `<vcf-date-range-picker-overlay>` parts.
 *
 * See [ThemableMixin – how to apply styles for shadow parts](https://github.com/vaadin/vaadin-themable-mixin/wiki)
 *
 * @extends Vaadin.OverlayElement
 * @memberof Vaadin
 * @private
 */
class DateRangePickerOverlayElement extends DisableUpgradeMixin(OverlayElement) {
  static get is() {
    return 'vcf-date-range-picker-overlay';
  }
}

customElements.define(DateRangePickerOverlayElement.is, DateRangePickerOverlayElement);
