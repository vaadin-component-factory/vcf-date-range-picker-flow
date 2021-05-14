/*
 * Copyright 2000-2017 Vaadin Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
package com.vaadin.componentfactory.demo;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Locale;

import com.vaadin.componentfactory.DateRange;
import com.vaadin.componentfactory.EnhancedDateRangePicker;
import com.vaadin.componentfactory.EnhancedDateRangePicker.DatePickerI18n;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.Label;
import com.vaadin.flow.component.html.NativeButton;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.demo.DemoView;
import com.vaadin.flow.router.Route;

/**
 * View for {@link EnhancedDateRangePicker} demo.
 *
 * @author Vaadin Ltd
 */
@Route("")
public class EnhancedDateRangePickerView extends DemoView {

    @Override
    public void initView() {
        createPatternDatePicker();
        createPatternAndLocaleDatePicker();
        createSimpleDatePicker();
        createMinAndMaxDatePicker();
        createDisabledDatePicker();
        createFinnishDatePicker();
        createWithClearButton();
        createLocaleChangeDatePicker();

        addCard("Additional code used in the demo",
                new Label("These methods are used in the demo."));
    }

    private void createSimpleDatePicker() {
        Div message = createMessageDiv("simple-picker-message");

        // begin-source-example
        // source-example-heading: Simple date picker
        EnhancedDateRangePicker datePicker = new EnhancedDateRangePicker();

        datePicker.addValueChangeListener(
                event -> updateMessage(message, datePicker));
        // end-source-example

        datePicker.setId("simple-picker");

        addCard("Simple date range picker", datePicker, message);
    }

    private void createPatternDatePicker() {
        Div message = createMessageDiv("simple-picker-message");

        // begin-source-example
        // source-example-heading: Date picker with pattern
        EnhancedDateRangePicker datePicker = new EnhancedDateRangePicker(new DateRange(LocalDate.now(),null), "dd-MMM-yyyy");
        datePicker.setId("withCustomJSPreset");
        Button from1st = new Button("From 1st");
        from1st.setThemeName("tertiary");
        from1st.addClickListener(ev->{
            datePicker.setValue(new DateRange(LocalDate.now().withDayOfMonth(1), LocalDate.now()));
        });
        Button may2021MonthButton = new Button("May 2021");
        may2021MonthButton.setThemeName("tertiary");
        may2021MonthButton.setId("may2021MonthButton");
        datePicker.add(from1st,may2021MonthButton);
        datePicker.getElement().addAttachListener(ev->{
            UI.getCurrent().getPage().executeJs("customElements.whenDefined('vcf-date-range-picker').then(function() {" +
            "const button = document.querySelector('#may2021MonthButton');"+
            "const dateRangePicker = document.querySelector('#Pattern-picker');"+
            "button.addEventListener('click', function() {"+
            "  dateRangePicker.value='2021-05-01;2021-05-31';"+
            "  dateRangePicker.close();"+
            "});" +
            "});");            
        });

        updateMessage(message, datePicker);

        datePicker.addValueChangeListener(
                event -> updateMessage(message, datePicker));

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

        // end-source-example

        datePicker.setId("Pattern-picker");

        addCard("Date range picker with pattern", datePicker, message, patten, setPatternBtn, dropPatternBtn);
    }

    private void createPatternAndLocaleDatePicker() {
        Div message = createMessageDiv("simple-picker-message");

        // begin-source-example
        // source-example-heading: Date picker with pattern and locale
        EnhancedDateRangePicker datePicker = new EnhancedDateRangePicker(new DateRange(LocalDate.now(),null), "dd-MMM-yyyy");
//        UI.getCurrent().setLocale(Locale.ITALIAN);
        updateMessage(message, datePicker);

        datePicker.addValueChangeListener(
                event -> updateMessage(message, datePicker));

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

        datePicker.setId("Pattern-picker");

        addCard("Date range picker with pattern and locale", datePicker, message, patten, patterns, locales);
    }

    private void createMinAndMaxDatePicker() {
        Div message = createMessageDiv("min-and-max-picker-message");

        // begin-source-example
        // source-example-heading: Date picker with min and max
        EnhancedDateRangePicker datePicker = new EnhancedDateRangePicker();
        datePicker.setLabel("Select a day within this month");
        datePicker.setPlaceholder("Date within this month");

        LocalDate now = LocalDate.now();

        datePicker.setMin(now.withDayOfMonth(1));
        datePicker.setMax(now.withDayOfMonth(now.lengthOfMonth()));

        datePicker.addValueChangeListener(
                event -> updateMessage(message, datePicker));
        // end-source-example

        datePicker.setId("min-and-max-picker");
        addCard("Date range picker with min and max", datePicker, message);
    }

    private void createDisabledDatePicker() {
        Div message = createMessageDiv("disabled-picker-message");

        // begin-source-example
        // source-example-heading: Disabled date picker
        EnhancedDateRangePicker datePicker = new EnhancedDateRangePicker();
        datePicker.setEnabled(false);
        // end-source-example

        datePicker.addValueChangeListener(event -> {
            message.setText("This event should not have happened");
        });

        datePicker.setId("disabled-picker");
        addCard("Disabled date range picker", datePicker, message);
    }

    private void createWithClearButton() {
        // begin-source-example
        // source-example-heading: Clear button
        EnhancedDateRangePicker datePicker = new EnhancedDateRangePicker();
        datePicker.setValue(new DateRange(LocalDate.now(),null));

        // Display an icon which can be clicked to clear the value:
        datePicker.setClearButtonVisible(true);
        // end-source-example

        addCard("Clear button", datePicker);
    }

    private void createFinnishDatePicker() {
        Div message = createMessageDiv("finnish-picker-message");

        // begin-source-example
        // source-example-heading: Internationalized date picker
        EnhancedDateRangePicker datePicker = new EnhancedDateRangePicker();
        datePicker.setLabel("Finnish date picker");
        datePicker.setPlaceholder("Syntymäpäivä");
        datePicker.setLocale(new Locale("fi"));

        datePicker.setI18n(
                new DatePickerI18n().setWeek("viikko").setCalendar("kalenteri")
                        .setClear("tyhjennä").setToday("tänään")
                        .setCancel("peruuta").setFirstDayOfWeek(1)
                        .setYesterday("eilen").setThisWeek("tämä viikko")
                        .setLastWeek("viime viikko").setThisMonth("tässä kuussa")
                        .setLastMonth("viime kuukausi").setThisYear("tämä vuosi")
                        .setLastYear("viime vuonna")
                        .setMonthNames(Arrays.asList("tammiku", "helmikuu",
                                "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu",
                                "heinäkuu", "elokuu", "syyskuu", "lokakuu",
                                "marraskuu", "joulukuu")).setWeekdays(
                        Arrays.asList("sunnuntai", "maanantai", "tiistai",
                                "keskiviikko", "torstai", "perjantai",
                                "lauantai")).setWeekdaysShort(
                        Arrays.asList("su", "ma", "ti", "ke", "to", "pe",
                                "la")));

        datePicker.addValueChangeListener(event -> {
            LocalDate selectedDate = event.getValue().getStartDate();
            if (selectedDate != null) {
                int weekday = selectedDate.getDayOfWeek().getValue() % 7;
                String weekdayName = datePicker.getI18n().getWeekdays()
                        .get(weekday);

                int month = selectedDate.getMonthValue() - 1;
                String monthName = datePicker.getI18n().getMonthNames()
                        .get(month);

                message.setText("Day of week: " + weekdayName + "\nMonth: "
                        + monthName);
            } else {
                message.setText("No date is selected");
            }
        });
        // end-source-example

        datePicker.setId("finnish-picker");
        addCard("Internationalized date range picker", datePicker, message);
    }

    private void createLocaleChangeDatePicker() {
        Div message = createMessageDiv("Customize-locale-picker-message");
        // begin-source-example
        // source-example-heading: Date picker with customize locales
        // By default, the datePicker uses the current UI locale
        EnhancedDateRangePicker datePicker = new EnhancedDateRangePicker();
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

        datePicker.addValueChangeListener(
                event -> updateMessage(message, datePicker));
        // end-source-example
        locale1.setId("Locale-US");
        locale2.setId("Locale-UK");
        datePicker.setId("locale-change-picker");
        addCard("Date range picker with customize locales", datePicker, locale1,
                locale2, locale3, message);
    }
    
    // begin-source-example
    // source-example-heading: Additional code used in the demo
    /**
     * Additional code used in the demo
     */
    private void updateMessage(Div message, EnhancedDateRangePicker datePicker) {
        LocalDate selectedStartDate = (datePicker.getValue()==null)?null:datePicker.getValue().getStartDate();
        LocalDate selectedEndDate = (datePicker.getValue()==null)?null:datePicker.getValue().getEndDate();
        if (selectedStartDate != null) {
        	String parsers = null;
        	if (datePicker.getParsers() != null)
        		parsers = Arrays.toString(datePicker.getParsers());
            message.setText(
                    "Start Day: " + selectedStartDate.getDayOfMonth()
                            + "\nStart Month: " + selectedStartDate.getMonthValue()
                            + "\nStart Year: " + selectedStartDate.getYear()
                            + "\nEnd Date: " + (selectedEndDate==null?"":selectedEndDate.getDayOfMonth())
                            + "\nEnd Month: " + (selectedEndDate==null?"":selectedEndDate.getMonthValue())
                            + "\nEnd Year: " + (selectedEndDate==null?"":selectedEndDate.getYear())
                            + "\nLocale: " + datePicker.getLocale()
                            + "\nFormatting pattern: " + datePicker.getPattern()
                            + "\nParsing pattern: " + parsers);
        } else {
            message.setText("No date is selected");
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
