package com.vaadin.componentfactory;

import java.time.LocalDate;
import java.time.Month;
import java.util.Locale;

import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.NativeButton;
import com.vaadin.flow.router.Route;

@Route("date-picker-locale")
public class DatePickerLocalePage extends Div {

    private final LocalDate may3rd = LocalDate.of(2018, Month.MAY, 3);
    private final LocalDate april23rd = LocalDate.of(2018, Month.APRIL, 23);

    public DatePickerLocalePage() {
        EnhancedDatePicker datePicker = new EnhancedDatePicker(april23rd, Locale.CHINA);
        datePicker.setId("locale-picker-server-with-value");

        NativeButton locale = new NativeButton("Locale: UK");
        locale.setId("uk-locale");

        locale.addClickListener(e -> datePicker.setLocale(Locale.UK));

        EnhancedDatePicker frenchLocale = new EnhancedDatePicker();
        frenchLocale.setId("french-locale-date-picker");

        frenchLocale.setLocale(Locale.FRANCE);
        frenchLocale.setValue(may3rd);

        EnhancedDatePicker german = new EnhancedDatePicker();
        german.setLocale(Locale.GERMAN);
        german.setId("german-locale-date-picker");

        add(datePicker, locale, frenchLocale, german);

        EnhancedDatePicker polandDatePicker = new EnhancedDatePicker(may3rd, new Locale("pl", "PL"));
        polandDatePicker.setId("polish-locale-date-picker");
        add(polandDatePicker);

        EnhancedDatePicker korean = new EnhancedDatePicker(may3rd, new Locale("ko", "KR"));
        korean.setId("korean-locale-date-picker");
        add(korean);

    }

}
