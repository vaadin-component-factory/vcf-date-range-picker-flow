import { TextFieldElement } from '@vaadin/vaadin-text-field/src/vaadin-text-field.js';
import { registerStyles, css } from '@vaadin/vaadin-themable-mixin/register-styles.js';

registerStyles(
  'vcf-date-range-picker-text-field',
  css`
      :host([dir="rtl"]) [part="input-field"] {
        direction: ltr;
      }

      :host([dir="rtl"]) [part="value"]::placeholder {
        direction: rtl;
        text-align: left;
      }

      :host([dir="rtl"]) [part="input-field"] ::slotted(input)::placeholder {
        direction: rtl;
        text-align: left;
      }

      :host([dir="rtl"]) [part="value"]:-ms-input-placeholder,
      :host([dir="rtl"]) [part="input-field"] ::slotted(input):-ms-input-placeholder {
        direction: rtl;
        text-align: left;
      }

      :host(.endDate) [part="input-field"] {
        border-top-left-radius: 0px;
        border-bottom-left-radius: 0px;
      }
      :host(.startDate) [part="input-field"] {
        border-top-right-radius: 0px;
        border-bottom-right-radius: 0px;
      }
      `,
  { moduleId: 'vcf-date-range-picker-text-field-styles' }
);

/**
 * An element used internally by `<vcf-date-range-picker>`. Not intended to be used separately.
 *
 * @extends OverlayElement
 * @private
 */
class DateRangePickerTextFieldElement extends TextFieldElement {
  static get is() {
    return 'vcf-date-range-picker-text-field';
  }
}

customElements.define(DateRangePickerTextFieldElement.is, DateRangePickerTextFieldElement);

