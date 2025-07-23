/*
 * Copyright 2000-2017 Vaadin Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */
package com.vaadin.componentfactory.demo;

import com.vaadin.componentfactory.DateTimeRange;
import com.vaadin.componentfactory.EnhancedDateTimeRangePicker;
import com.vaadin.componentfactory.EnhancedDateTimeRangePicker.DatePickerI18n;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.dependency.CssImport;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.NativeButton;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.demo.DemoView;
import com.vaadin.flow.router.Route;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Locale;

/**
 * View for {@link EnhancedDateTimeRangePicker} demo.
 *
 * @author Vaadin Ltd
 */
@SuppressWarnings("serial")
@Route("")
@CssImport(value = "./styles/date-time-range-picker-demo-styles.css", themeFor = "vcf-date-time-range-month-calendar")
public class EnhancedDateTimeRangePickerView extends DemoView {

  @Override
  public void initView() {
    createPatternDateTimeRangePicker();
    createPatternAndLocaleDateTimeRangePicker();
    createSimpleDateTimeRangePicker();
    createSimpleDateTimeRangePickerWithoutTextFields();
    createMinAndMaxDateTimeRangePicker();
    createDisabledDateTimeRangePicker();
    createFinnishDateTimeRangePicker();
    createWithClearButton();
    createLocaleChangeDateTimeRangePicker();

    addCard("Additional code used in the demo", new Span("These methods are used in the demo."));
  }

  private void createSimpleDateTimeRangePicker() {
    Div message = createMessageDiv("simple-picker-message");

    // begin-source-example
    // source-example-heading: Simple date time range picker
    EnhancedDateTimeRangePicker datePicker = new EnhancedDateTimeRangePicker();
    datePicker.setClassNameForDates("publicHolidayRed", LocalDate.now(),
        LocalDate.now().plusDays(10));
    datePicker.setClassNameForDates("publicHolidayGreen", LocalDate.now().plusDays(1),
        LocalDate.now().plusDays(11));
    datePicker.getElement().getThemeList().add("withHolidays");

    datePicker.addValueChangeListener(event -> updateMessage(message, datePicker));
    // end-source-example

    datePicker.setId("simple-picker");

    addCard("Simple date time range picker", datePicker, message);
  }

  private void createSimpleDateTimeRangePickerWithoutTextFields() {
    Div message = createMessageDiv("simple-picker-without-text-fields-message");

    // begin-source-example
    // source-example-heading: Simple date range picker without visible text fields
    EnhancedDateTimeRangePicker datePicker = new EnhancedDateTimeRangePicker();
    datePicker.setTextFieldsVisible(false);
    Button openDRP = new Button("Open Date Time Range Picker");
    openDRP.addClickListener(ev -> {
      datePicker.openOnPosition(ev.getClientX(), ev.getClientY());
    });

    datePicker.addValueChangeListener(event -> updateMessage(message, datePicker));
    // end-source-example

    datePicker.setId("simple-picker-without-text-fields");

    addCard("Simple date time range picker without visible text fields", datePicker, openDRP, message);
  }

  private void createPatternDateTimeRangePicker() {
    Div message = createMessageDiv("simple-picker-with-pattern-message");

    // begin-source-example
    // source-example-heading: Date time range picker with date pattern
    EnhancedDateTimeRangePicker datePicker = new EnhancedDateTimeRangePicker(
        new DateTimeRange(LocalDateTime.now(), LocalDateTime.now().plusDays(7)), "dd-MMM-yyyy");
    datePicker.setId("withCustomJSPreset");
    Button from1st = new Button("From 1st");
    from1st.setThemeName("tertiary");
    from1st.addClickListener(ev -> {
      datePicker
          .setValue(new DateTimeRange(LocalDateTime.now().withDayOfMonth(1), LocalDateTime.now()));
    });
    Button may2021MonthButton = new Button("May 2021");
    may2021MonthButton.setThemeName("tertiary");
    may2021MonthButton.setId("may2021MonthButton");
    datePicker.removePresetByIds(EnhancedDateTimeRangePicker.PRESET_LAST_MONTH,
        EnhancedDateTimeRangePicker.PRESET_THIS_MONTH);
    datePicker.add(from1st, may2021MonthButton);
    datePicker.getElement().addAttachListener(ev -> {
      UI.getCurrent().getPage()
          .executeJs("customElements.whenDefined('vcf-date-range-picker').then(function() {"
              + "const button = document.querySelector('#may2021MonthButton');"
              + "const dateRangePicker = document.querySelector('#Pattern-picker');"
              + "button.addEventListener('click', function() {"
              + "  dateRangePicker.value='2021-05-01;2021-05-31';" + "  dateRangePicker.close();"
              + "});" + "});");
    });

    updateMessage(message, datePicker);

    datePicker.addValueChangeListener(event -> updateMessage(message, datePicker));

    TextField patten = new TextField();
    patten.setLabel("Define a pattern  for the dates");
    patten.setValue("dd-MMM-yyyy");

    Button setPatternBtn = new Button("Set pattern from text field");
    setPatternBtn.addClickListener(e -> {
      datePicker.setPattern(patten.getValue());
      updateMessage(message, datePicker);
    });

    Button dropPatternBtn = new Button("Drop pattern");
    dropPatternBtn.addClickListener(e -> {
      datePicker.setPattern(null);
      updateMessage(message, datePicker);
    });

    // end-source-example

    datePicker.setId("picker-with-pattern");

    addCard("Date time range picker with date pattern", datePicker, message, patten, setPatternBtn,
        dropPatternBtn);
  }

  private void createPatternAndLocaleDateTimeRangePicker() {
    Div message = createMessageDiv("simple-picker-with-pattern-and-locale-message");

    // begin-source-example
    // source-example-heading: Date time range picker with pattern and locale
    EnhancedDateTimeRangePicker datePicker = new EnhancedDateTimeRangePicker(
        new DateTimeRange(LocalDateTime.now(), null), "dd-MMM-yyyy");
    // UI.getCurrent().setLocale(Locale.ITALIAN);
    updateMessage(message, datePicker);

    datePicker.addValueChangeListener(event -> updateMessage(message, datePicker));

    TextField patten = new TextField();
    patten.setLabel("Define a pattern");
    patten.setValue("dd-MMM-yyyy");

    Button setPatternBtn = new Button("Set pattern from text field");
    setPatternBtn.addClickListener(e -> {
      datePicker.setPattern(patten.getValue());
      updateMessage(message, datePicker);
    });

    Button dropPatternBtn = new Button("Drop pattern");
    dropPatternBtn.addClickListener(e -> {
      datePicker.setPattern(null);
      updateMessage(message, datePicker);
    });
    HorizontalLayout patterns = new HorizontalLayout();
    patterns.add(setPatternBtn, dropPatternBtn);


    Button setlocaleBtn = new Button("Set locale to German");
    setlocaleBtn.addClickListener(e -> {
      datePicker.setLocale(Locale.GERMAN);
      updateMessage(message, datePicker);
    });

    Button setlocaleEsBtn = new Button("Set locale to Spanish");
    setlocaleEsBtn.addClickListener(e -> {
      datePicker.setLocale(new Locale("es"));
      updateMessage(message, datePicker);
    });

    Button setLocaleEnBtn = new Button("Set locale to English");
    setLocaleEnBtn.addClickListener(e -> {
      datePicker.setLocale(Locale.ENGLISH);
      updateMessage(message, datePicker);
    });

    HorizontalLayout locales = new HorizontalLayout();
    locales.add(setlocaleBtn, setlocaleEsBtn, setLocaleEnBtn);
    // end-source-example

    datePicker.setId("picker-with-pattern-and-locale");

    addCard("Date time range picker with date pattern and locale", datePicker, message, patten, patterns,
        locales);
  }

  private void createMinAndMaxDateTimeRangePicker() {
    Div message = createMessageDiv("min-and-max-picker-message");

    // begin-source-example
    // source-example-heading: Date range picker with min and max dates and without side panel
    EnhancedDateTimeRangePicker datePicker = new EnhancedDateTimeRangePicker();
    datePicker.setLabel("Select a day within this month");
    datePicker.setStartDatePlaceholder("Date within this month");
    datePicker.setSidePanelVisible(false);

    LocalDate now = LocalDate.now();

    datePicker.setMin(now.withDayOfMonth(1));
    datePicker.setMax(now.withDayOfMonth(now.lengthOfMonth()));

    datePicker.addValueChangeListener(event -> updateMessage(message, datePicker));
    // end-source-example

    datePicker.setId("min-and-max-picker");
    addCard("Date range picker with min and max dates and without side panel", datePicker, message);
  }

  private void createDisabledDateTimeRangePicker() {
    Div message = createMessageDiv("disabled-picker-message");

    // begin-source-example
    // source-example-heading: Disabled date time range picker
    EnhancedDateTimeRangePicker datePicker = new EnhancedDateTimeRangePicker();
    datePicker.setEnabled(false);
    // end-source-example

    datePicker.addValueChangeListener(event -> {
      message.setText("This event should not have happened");
    });

    datePicker.setId("disabled-picker");
    addCard("Disabled date time range picker", datePicker, message);
  }

  private void createWithClearButton() {
    // begin-source-example
    // source-example-heading: Clear button
    EnhancedDateTimeRangePicker datePicker = new EnhancedDateTimeRangePicker();
    datePicker.setValue(new DateTimeRange(LocalDateTime.now(), null));

    // Display an icon which can be clicked to clear the value:
    datePicker.setClearButtonVisible(true);
    // end-source-example

    addCard("Clear button", datePicker);
  }

  private void createFinnishDateTimeRangePicker() {
    Div message = createMessageDiv("finnish-picker-message");

    // begin-source-example
    // source-example-heading: Internationalized date time range picker
    EnhancedDateTimeRangePicker datePicker = new EnhancedDateTimeRangePicker();
    datePicker.setLabel("Finnish date picker");
    datePicker.setStartDatePlaceholder("Syntymäpäivä");
    datePicker.setLocale(new Locale("fi"));

    datePicker.setI18n(
        new DatePickerI18n().setWeek("viikko").setCalendar("kalenteri").setClear("tyhjennä")
            .setToday("tänään").setCancel("peruuta").setFirstDayOfWeek(1).setYesterday("eilen")
            .setThisWeek("tämä viikko").setLastWeek("viime viikko").setThisMonth("tässä kuussa")
            .setLastMonth("viime kuukausi").setThisYear("tämä vuosi").setLastYear("viime vuonna")
            .setMonthNames(Arrays.asList("tammiku", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu",
                "kesäkuu", "heinäkuu", "elokuu", "syyskuu", "lokakuu", "marraskuu", "joulukuu"))
            .setWeekdays(Arrays.asList("sunnuntai", "maanantai", "tiistai", "keskiviikko",
                "torstai", "perjantai", "lauantai"))
            .setWeekdaysShort(Arrays.asList("su", "ma", "ti", "ke", "to", "pe", "la")));

    datePicker.addValueChangeListener(event -> {
      LocalDate selectedDate = event.getValue().getStartDateTime().toLocalDate();
      if (selectedDate != null) {
        int weekday = selectedDate.getDayOfWeek().getValue() % 7;
        String weekdayName = datePicker.getI18n().getWeekdays().get(weekday);

        int month = selectedDate.getMonthValue() - 1;
        String monthName = datePicker.getI18n().getMonthNames().get(month);

        message.setText("Day of week: " + weekdayName + "\nMonth: " + monthName);
      } else {
        message.setText("No date is selected");
      }
    });
    // end-source-example

    datePicker.setId("finnish-picker");
    addCard("Internationalized date time range picker", datePicker, message);
  }

  private void createLocaleChangeDateTimeRangePicker() {
    Div message = createMessageDiv("Customize-locale-picker-message");
    // begin-source-example
    // source-example-heading: Date range picker with customize locales
    // By default, the datePicker uses the current UI locale
    EnhancedDateTimeRangePicker datePicker = new EnhancedDateTimeRangePicker();
    NativeButton locale1 = new NativeButton("Locale: US");
    NativeButton locale2 = new NativeButton("Locale: UK");
    NativeButton locale3 = new NativeButton("Locale: CHINA");

    locale1.addClickListener(e -> {
      datePicker.setLocale(Locale.US);
      updateMessage(message, datePicker);
    });
    locale2.addClickListener(e -> {
      datePicker.setLocale(Locale.UK);
      updateMessage(message, datePicker);
    });
    locale3.addClickListener(e -> {
      datePicker.setLocale(Locale.CHINA);
      updateMessage(message, datePicker);
    });

    datePicker.addValueChangeListener(event -> updateMessage(message, datePicker));
    // end-source-example
    locale1.setId("Locale-US");
    locale2.setId("Locale-UK");
    datePicker.setId("locale-change-picker");
    addCard("Date range picker with customize locales", datePicker, locale1, locale2, locale3,
        message);
  }

  // begin-source-example
  // source-example-heading: Additional code used in the demo
  /**
   * Additional code used in the demo
   */
  private void updateMessage(Div message, EnhancedDateTimeRangePicker dateTimeRangePicker) {
    LocalDateTime selectedStartDate = (dateTimeRangePicker.getValue() == null) ? null
        : dateTimeRangePicker.getValue().getStartDateTime();
    LocalDateTime selectedEndDate = (dateTimeRangePicker.getValue() == null) ? null
        : dateTimeRangePicker.getValue().getEndDateTime();

    if (selectedStartDate != null) {
      StringBuilder sb = new StringBuilder();

      // Show the full value string
      sb.append("\nValue: ").append(dateTimeRangePicker.getValue()).append("\n");

      // Start date parts
      sb.append("\nStart Day: ").append(selectedStartDate.getDayOfMonth()).append("\nStart Month: ")
          .append(selectedStartDate.getMonthValue()).append("\nStart Year: ")
          .append(selectedStartDate.getYear()).append("\nStart Time: ")
          .append(String.format("%02d:%02d:%02d", selectedStartDate.getHour(),
              selectedStartDate.getMinute(), selectedStartDate.getSecond()));

      // End date parts
      if (selectedEndDate != null) {
        sb.append("\nEnd Day: ").append(selectedEndDate.getDayOfMonth()).append("\nEnd Month: ")
            .append(selectedEndDate.getMonthValue()).append("\nEnd Year: ")
            .append(selectedEndDate.getYear()).append("\nEnd Time: ")
            .append(String.format("%02d:%02d:%02d", selectedEndDate.getHour(),
                selectedEndDate.getMinute(), selectedEndDate.getSecond()));
      }

      // Optional fields
      if (dateTimeRangePicker.getLocale() != null) {
        sb.append("\nDateLocale: ").append(dateTimeRangePicker.getLocale());
      }

      if (dateTimeRangePicker.getPattern() != null) {
        sb.append("\nDate formatting pattern: ").append(dateTimeRangePicker.getPattern());
      }

      if (dateTimeRangePicker.getParsers() != null) {
        sb.append("\nDate parsing pattern: ")
            .append(Arrays.toString(dateTimeRangePicker.getParsers()));
      }

      message.setText(sb.toString());
    } else {
      message.setText("No date-time range was selected");
    }

  }

  private Div createMessageDiv(String id) {
    Div message = new Div();
    message.setId(id);
    message.getStyle().set("whiteSpace", "pre");
    return message;
  }
  // end-source-example
}
