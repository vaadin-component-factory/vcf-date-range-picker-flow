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
package com.vaadin.componentfactory;

import com.vaadin.flow.component.AbstractSinglePropertyField;
import com.vaadin.flow.component.AttachEvent;
import com.vaadin.flow.component.Component;
import com.vaadin.flow.component.ComponentEvent;
import com.vaadin.flow.component.ComponentEventListener;
import com.vaadin.flow.component.HasComponents;
import com.vaadin.flow.component.HasLabel;
import com.vaadin.flow.component.HasSize;
import com.vaadin.flow.component.HasValidation;
import com.vaadin.flow.component.HasValue;
import com.vaadin.flow.component.Tag;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.dependency.JavaScript;
import com.vaadin.flow.component.dependency.JsModule;
import com.vaadin.flow.component.dependency.NpmPackage;
import com.vaadin.flow.component.shared.HasClearButton;
import com.vaadin.flow.function.SerializableConsumer;
import com.vaadin.flow.function.SerializableFunction;
import com.vaadin.flow.internal.JsonSerializer;
import com.vaadin.flow.shared.Registration;
import elemental.json.JsonObject;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;
import org.jsoup.internal.StringUtil;

/**
 * Server-side component that encapsulates the functionality of the
 * {@code vaadin-date-picker} webcomponent.
 * <p>
 * It allows setting and getting {@link LocalDate} objects, setting minimum and
 * maximum date ranges and has internationalization support by using the
 * {@link DatePickerI18n} object.
 *
 */
@JavaScript("./date-fns-limited.min.js")
@JavaScript("./enhancedDateRangePickerConnector.js")
@Tag("vcf-date-range-picker")
@NpmPackage(value = "@vaadin-component-factory/vcf-date-range-picker", version = "5.0.2")
@JsModule("@vaadin-component-factory/vcf-date-range-picker/vcf-date-range-picker.js")
public class EnhancedDateRangePicker extends  AbstractSinglePropertyField<EnhancedDateRangePicker, DateRange>
        implements HasSize, HasValidation, HasComponents, HasClearButton, HasLabel {

	private static final String PROP_AUTO_OPEN_DISABLED = "autoOpenDisabled";
    private static DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE;
    public static final String PRESET_TODAY = "todayButton";
    public static final String PRESET_YESTERDAY = "yesterdayButton";
    public static final String PRESET_THIS_WEEK = "thisWeekButton";
    public static final String PRESET_LAST_WEEK = "lastWeekButton";
    public static final String PRESET_THIS_MONTH = "thisMonthButton";
    public static final String PRESET_LAST_MONTH = "lastMonthButton";
    public static final String PRESET_THIS_YEAR = "thisYearButton";
    public static final String PRESET_LAST_YEAR = "lastYearButton";
    public static final String PRESET_CANCEL_BUTTON = "cancelButton";

    private DatePickerI18n i18n;

    private final static SerializableFunction<String, DateRange> PARSER = s -> {
        DateRange result = null;
        if (s!=null && !s.isEmpty() && s.contains(";")) {
            String startDateString = s.split(";",-1)[0];
            String endDateString = s.split(";",-1)[1];
            LocalDate startDate = (StringUtil.isBlank(startDateString)?null:LocalDate.parse(startDateString, dateTimeFormatter));
            LocalDate endDate = (StringUtil.isBlank(endDateString)?null:LocalDate.parse(endDateString, dateTimeFormatter));
            result = new DateRange(startDate,endDate);
        }
        return result;
    };

    private final static SerializableFunction<DateRange, String> FORMATTER = d -> {
        String result = "";
        if (d!=null) {
            result = String.format("%s;%s", d.getStartDate()==null?"":dateTimeFormatter.format(d.getStartDate()) , d.getEndDate()==null?"":dateTimeFormatter.format(d.getEndDate()));
        }
        return result;
    };

    private final static SerializableFunction<String, LocalDate> DATE_PARSER = s -> {
        return s == null || s.isEmpty() ? null : LocalDate.parse(s);
    };

    private final static SerializableFunction<LocalDate, String> DATE_FORMATTER = d -> {
        return d == null ? "" : d.toString();
    };

    private Locale locale;
    private String languageTag;

    private LocalDate max;
    private LocalDate min;
    private boolean required;
    
    private String formattingPattern;
    private String[] parserPatterns;

    /**
     * Default constructor.
     */
    public EnhancedDateRangePicker() {
        this(new DateRange(null,null));
    }

    /**
     * Convenience constructor to create a date picker with a pre-selected date
     * in current UI locale setPattern.
     *
     * @param initialDate
     *            the pre-selected date in the picker
     * @see #setValue(Object)
     */
    public EnhancedDateRangePicker(DateRange initialDate) {
        super("value", initialDate, String.class, PARSER, FORMATTER);
        this.setPattern("yyyy-MM-dd");
        this.setParsers("yyyy-MM-dd");
        
        // Initialize property value unless it has already been set from a
        // template
        if (getElement().getProperty("value") == null) {
            setPresentationValue(initialDate);
        }

        // workaround for https://github.com/vaadin/flow/issues/3496
        setInvalid(false);

        addValueChangeListener(e -> validate());
    }

    /**
     * Convenience constructor to create a date picker with a label.
     *
     * @param label
     *            the label describing the date picker
     * @see #setLabel(String)
     */
    public EnhancedDateRangePicker(String label) {
        this();
        setLabel(label);
    }

    /**
     * Convenience constructor to create a date picker with a pre-selected date
     * in current UI locale setPattern and a label.
     *
     * @param label
     *            the label describing the date picker
     * @param initialDate
     *            the pre-selected date in the picker
     * @see #setValue(Object)
     * @see #setLabel(String)
     */
    public EnhancedDateRangePicker(String label, DateRange initialDate) {
        this(initialDate);
        setLabel(label);
    }

    /**
     * Convenience constructor to create a date picker with a
     * {@link ValueChangeListener}.
     *
     * @param listener
     *            the listener to receive value change events
     * @see #addValueChangeListener(HasValue.ValueChangeListener)
     */
    public EnhancedDateRangePicker(
            ValueChangeListener<ComponentValueChangeEvent<EnhancedDateRangePicker, DateRange>> listener) {
        this();
        addValueChangeListener(listener);
    }

    /**
     * Convenience constructor to create a date picker with a
     * {@link ValueChangeListener} and a label.
     *
     *
     * @param label
     *            the label describing the date picker
     * @param listener
     *            the listener to receive value change events
     * @see #setLabel(String)
     * @see #addValueChangeListener(HasValue.ValueChangeListener)
     */
    public EnhancedDateRangePicker(String label,
                              ValueChangeListener<ComponentValueChangeEvent<EnhancedDateRangePicker, DateRange>> listener) {
        this(label);
        addValueChangeListener(listener);
    }

    /**
     * Convenience constructor to create a date picker with a pre-selected date
     * in current UI locale setPattern and a {@link ValueChangeListener}.
     *
     * @param initialDate
     *            the pre-selected date in the picker
     * @param listener
     *            the listener to receive value change events
     * @see #setValue(Object)
     * @see #addValueChangeListener(HasValue.ValueChangeListener)
     */
    public EnhancedDateRangePicker(DateRange initialDate,
                              ValueChangeListener<ComponentValueChangeEvent<EnhancedDateRangePicker, DateRange>> listener) {
        this(initialDate);
        addValueChangeListener(listener);
    }

    /**
     * Convenience constructor to create a date picker with a pre-selected date
     * in current UI locale setPattern, a {@link ValueChangeListener} and a label.
     *
     * @param label
     *            the label describing the date picker
     * @param initialDate
     *            the pre-selected date in the picker
     * @param listener
     *            the listener to receive value change events
     * @see #setLabel(String)
     * @see #setValue(Object)
     * @see #addValueChangeListener(HasValue.ValueChangeListener)
     */
    public EnhancedDateRangePicker(String label, DateRange initialDate,
                              ValueChangeListener<ComponentValueChangeEvent<EnhancedDateRangePicker, DateRange>> listener) {
        this(initialDate);
        setLabel(label);
        addValueChangeListener(listener);
    }

    /**
     * Convenience Constructor to create a date picker with pre-selected date
     * and locale setup.
     *
     * @param initialDate
     *            the pre-selected date in the picker
     * @param locale
     *            the locale for the date picker
     */
    public EnhancedDateRangePicker(DateRange initialDate, Locale locale) {
        this(initialDate);
        setLocale(locale);        
    }

    /**
     * Convenience Constructor to create a date picker with pre-selected date
     * and pattern setup.
     *
     * @param initialDate
     *            the pre-selected date in the picker
     * @param formattingPattern
     *            the pattern for formatting value of the date picker
     */
    public EnhancedDateRangePicker(DateRange initialDate, String formattingPattern) {
        this(initialDate);
        setPattern(formattingPattern);
    }
    
    /**
     * Convenience Constructor to create a date picker with pre-selected date, formatting 
     * pattern, and parsing patterns.
     *
     * @param initialDate
     *            the pre-selected date in the picker
     * @param formattingPattern
     *            the pattern for formatting value of the date picker
     * @param parserPatterns
     *           the array of patterns used for parsing the date picker's value
     */
    public EnhancedDateRangePicker(DateRange initialDate, String formattingPattern, String ... parserPatterns) {
        this(initialDate);
        setPattern(formattingPattern);
        setParsers(parserPatterns);
    }

    /**
     * EnhancedDatePicker has workaround to this issue    
     * https://github.com/vaadin/vaadin-date-picker-flow/issues/223
     * 
     * Calling disableClientValidation() after instantiation will make EnhancedDatePicker 
     * to behave similar way as regular DatePicker with client side validations. This
     * method is provided if you need to retain that behavior instead.
     */
    @Deprecated
    public void disableClientValidation() {
        EnhancedDateRangePickerValidationUtil.disableClientValidation(this);
    }

    /**
     * Sets the minimum date in the date picker. Dates before that will be
     * disabled in the popup.
     *
     * @param min
     *            the minimum date that is allowed to be selected, or
     *            <code>null</code> to remove any minimum constraints
     */
    public void setMin(LocalDate min) {
        String minAsString = DATE_FORMATTER.apply(min);
        getElement().setProperty("min", minAsString == null ? "" : minAsString);
        this.min = min;
    }

    /**
     * Gets the minimum date in the date picker. Dates before that will be
     * disabled in the popup.
     *
     * @return the minimum date that is allowed to be selected, or
     *         <code>null</code> if there's no minimum
     */
    public LocalDate getMin() {
        return DATE_PARSER.apply(getElement().getProperty("min"));
    }

    /**
     * Sets the maximum date in the date picker. Dates after that will be
     * disabled in the popup.
     *
     * @param max
     *            the maximum date that is allowed to be selected, or
     *            <code>null</code> to remove any maximum constraints
     */
    public void setMax(LocalDate max) {
        String maxAsString = DATE_FORMATTER.apply(max);
        getElement().setProperty("max", maxAsString == null ? "" : maxAsString);
        this.max = max;
    }

    /**
     * Gets the maximum date in the date picker. Dates after that will be
     * disabled in the popup.
     *
     * @return the maximum date that is allowed to be selected, or
     *         <code>null</code> if there's no maximum
     */
    public LocalDate getMax() {
        return DATE_PARSER.apply(getElement().getProperty("max"));
    }


    /**
     * Set the Locale for the Date Picker. The displayed date will be matched to
     * the format used in that locale. If this method is never called, the Locale
     * will default to the UI's Locale.
     * <p>
     * NOTE:Supported formats are MM/DD/YYYY, DD/MM/YYYY and YYYY/MM/DD. Browser
     * compatibility can be different based on the browser and mobile devices,
     * you can check here for more details: <a href=
     * "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString">https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString</a>
     *
     * @param locale
     *            the locale set to the date picker, cannot be null
     */
    public void setLocale(Locale locale) {
        Objects.requireNonNull(locale, "Locale must not be null.");
        this.locale = locale;
        // For ill-formed locales, Locale.toLanguageTag() will append subtag
        // "lvariant" to it, which will cause the client side
        // Date().toLocaleDateString()
        // fallback to the system default locale silently.
        // This has been caught by DatePickerValidationPage::invalidLocale test
        // when running on
        // Chrome(73+)/FireFox(66)/Edge(42.17134).
        if (!locale.toLanguageTag().contains("lvariant")) {
            languageTag = locale.toLanguageTag();
        } else if (locale.getCountry().isEmpty()) {
            languageTag = locale.getLanguage();
        } else {
            languageTag = locale.getLanguage() + "-" + locale.getCountry();
        }
        getUI().ifPresent(ui -> setLocaleWithJS());
    }

    private void setLocaleWithJS() {
        runBeforeClientResponse(ui -> getElement()
                .callJsFunction("$connector.setLocale", languageTag));
    }

    /**
     * Gets the Locale for this date picker
     *
     * @return the locale used for this picker
     */
    @Override
    public Locale getLocale() {
        return locale;
    }
    
    /**
     * Setting the patterns for parsing the value of the date-picker.
     * 
     * The parsing will be attempted according to the order of the supplied patterns. If none of these
     * patterns can successfully parse the date-picker's value, the parsing will, first, be attempted using the
     * formatting value (which can be set using @setPattern). If the latter also fails, parsing will be
     * attempted using the Locale (which can be set using @setLocale).
     *
     * @param parserPatterns
     *           the array of patterns used for parsing the date picker's value
     */
    public void setParsers(String... parserPatterns){
    	this.parserPatterns = parserPatterns;
        runBeforeClientResponse(ui -> getElement().callJsFunction("$connector.setParsers", parserPatterns));
    }
    
    /**
     * Gets the parser patterns for this date-picker
     *
     * @return an array of the parser patterns used for formatting value of the date picker
     */
    public String[] getParsers() {
        return parserPatterns;
    }

    /**
     * Setting the Pattern for formatting value of the date picker
     *
     * @param formattingPattern
     *           the pattern for formatting value of the date picker
     *           if set to null or empty string then for matting will be done by Locale
     */
    public void setPattern(String formattingPattern){
        this.formattingPattern = formattingPattern;
        runBeforeClientResponse(ui -> getElement().callJsFunction("$connector.setPattern", formattingPattern));
    }

    public void setClassNameForDates(String className, LocalDate ... dates) {
        String datesString = Arrays.asList(dates).stream().map(adate->"'" + adate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + "'").collect(Collectors.joining(","));
        datesString = "[" + datesString + "]";
        this.getElement().executeJs("this.setClassNameForDates($0," + datesString + ")", className);
    }

    /**
     * Gets the Pattern for this date picker
     *
     * @return the pattern for formatting value of the date picker
     */
    public String getPattern() {
        return formattingPattern;
    }

    @Override
    protected void onAttach(AttachEvent attachEvent) {
        super.onAttach(attachEvent);
        initConnector();
        if (locale == null) {
            getUI().ifPresent(ui -> setLocale(ui.getLocale()));        	
        } else if (languageTag != null) {
            setLocaleWithJS();
        }
        if (i18n != null) {
            setI18nWithJS();
        }
        if (formattingPattern != null) {
            setPattern(formattingPattern);
        }
        EnhancedDateRangePickerValidationUtil.disableClientValidation(this);
    }

    private void initConnector() {
        runBeforeClientResponse(ui -> ui.getPage().executeJs(
                "window.Vaadin.Flow.enhancedDateRangePickerConnector.initLazy($0)",
                getElement()));
    }

    /**
     * Gets the internationalization object previously set for this component.
     * <p>
     * Note: updating the object content that is gotten from this method will
     * not update the lang on the component if not set back using
     * {@link EnhancedDateRangePicker#setI18n(DatePickerI18n)}
     *
     * @return the i18n object. It will be <code>null</code>, If the i18n
     *         properties weren't set.
     */
    public DatePickerI18n getI18n() {
        return i18n;
    }

    /**
     * Sets the internationalization properties for this component.
     *
     * @param i18n
     *            the internationalized properties, not <code>null</code>
     */
    public void setI18n(DatePickerI18n i18n) {
        Objects.requireNonNull(i18n,
                "The I18N properties object should not be null");
        this.i18n = i18n;
        getUI().ifPresent(ui -> setI18nWithJS());
    }

    private void setI18nWithJS() {
        runBeforeClientResponse(ui -> {
            JsonObject i18nObject = (JsonObject) JsonSerializer.toJson(i18n);
            for (String key : i18nObject.keys()) {
                getElement().executeJs("this.set('i18n." + key + "', $0)",
                        i18nObject.get(key));
            }
        });
    }

    void runBeforeClientResponse(SerializableConsumer<UI> command) {
        getElement().getNode().runWhenAttached(ui -> ui
                .beforeClientResponse(this, context -> command.accept(ui)));
    }

    public void setErrorMessage(String errorMessage) {
        getElement().setProperty("errorMessage",
              errorMessage == null ? "" : errorMessage);
    }

    /**
     * Gets the current error message from the datepicker.
     *
     * @return the current error message
     */
    public String getErrorMessage() {
        return getElement().getProperty("errorMessage");
    }

    public void setInvalid(boolean invalid) {
        getElement().setProperty("invalid", invalid);
    }

    /**
     * Gets the validity of the datepicker output.
     * <p>
     * return true, if the value is invalid.
     *
     * @return the {@code validity} property from the datepicker
     */
    public boolean isInvalid() {
        return getElement().getProperty("invalid", false);
    }

    /**
     * Performs a server-side validation of the given value. This is needed because it is possible to circumvent the
     * client side validation constraints using browser development tools.
     */
    private boolean isInvalid(DateRange value) {
        boolean isRequiredButEmpty = required && Objects.equals(getEmptyValue(), value);
        boolean isGreaterThanMax  = value != null && value.getStartDate() != null && max != null && value.getStartDate().isAfter(max);
        boolean isSmallerThenMin = value != null && value.getStartDate() != null && min != null && value.getStartDate().isBefore(min);
        boolean startDateInvalid = isRequiredButEmpty || isGreaterThanMax || isSmallerThenMin;
        isRequiredButEmpty = required && Objects.equals(getEmptyValue(), value);
        isGreaterThanMax  = value != null && value.getEndDate() != null && max != null && value.getEndDate().isAfter(max);
        isSmallerThenMin = value != null && value.getEndDate() != null && min != null && value.getEndDate().isBefore(min);
        boolean endDateInvalid = isRequiredButEmpty || isGreaterThanMax || isSmallerThenMin;
        boolean endDateBeforeStartDate = value != null && value.getStartDate() != null && value.getEndDate() != null && value.getEndDate().isBefore(value.getStartDate());
        return startDateInvalid || endDateInvalid || endDateBeforeStartDate;
    }    
    
    /**
     * Sets displaying a clear button in the datepicker when it has value.
     * <p>
     * The clear button is an icon, which can be clicked to set the datepicker
     * value to {@code null}.
     *
     * @param clearButtonVisible
     *            {@code true} to display the clear button, {@code false} to
     *            hide it
     */
    public void setSidePanelVisible(boolean sidePanelVisible) {
        getElement().setProperty("hideSidePanel", !sidePanelVisible);
    }

    /**
     * Gets whether this datepicker displays a clear button when it has value.
     *
     * @return {@code true} if this datepicker displays a clear button,
     *         {@code false} otherwise
     * @see #setClearButtonVisible(boolean)
     */
    public boolean isTextFieldsVisible() {
        return !getElement().getProperty("hideTextFields", false);
    }

    /**
     * Sets displaying a clear button in the datepicker when it has value.
     * <p>
     * The clear button is an icon, which can be clicked to set the datepicker
     * value to {@code null}.
     *
     * @param clearButtonVisible
     *            {@code true} to display the clear button, {@code false} to
     *            hide it
     */
    public void setTextFieldsVisible(boolean textFieldsVisible) {
        getElement().setProperty("hideTextFields", !textFieldsVisible);
    }

    /**
     * Gets whether this datepicker displays a clear button when it has value.
     *
     * @return {@code true} if this datepicker displays a clear button,
     *         {@code false} otherwise
     * @see #setClearButtonVisible(boolean)
     */
    public boolean isSidePanelVisible() {
        return !getElement().getProperty("hideSidePanel", false);
    }
    
    public void setLabel(String label) {
        getElement().setProperty("label", label == null ? "" : label);
    }

    /**
     * Gets the label of the datepicker.
     *
     * @return the {@code label} property of the datePicker
     */
    public String getLabel() {
        return getElement().getProperty("label");
    }

    public void setPlaceholder(String placeholder) {
        getElement().setProperty("placeholder",
          placeholder == null ? "" : placeholder);
    }

    protected void setEndPlaceholder(String endPlaceholder) {
        getElement().setProperty("endPlaceholder",
                endPlaceholder == null ? "" : endPlaceholder);
    }
    
    /**
     * Gets the placeholder of the datepicker.
     * <p>
     * This property is not synchronized automatically from the client side, so
     * the returned value may not be the same as in client side.
     * </p>
     *
     * @return the {@code placeholder} property of the datePicker
     */
    public String getPlaceholder() {
        return getElement().getProperty("placeholder");
    }

    /**
     * Gets the end placeholder of the datepicker.
     * <p>
     * This property is not synchronized automatically from the client side, so
     * the returned value may not be the same as in client side.
     * </p>
     *
     * @return the {@code placeholder} property of the datePicker
     */
    protected String getEndPlaceholder() {
        return getElement().getProperty("endPlaceholder");
    }

    /**
     * Date which should be visible when there is no value selected.
     * <p>
     * The same date formats as for the {@code value} property are supported.
     * </p>
     *
     * @param initialPosition
     *            the LocalDate value to set
     */
    public void setInitialPosition(LocalDate initialPosition) {
        String initialPositionString = DATE_FORMATTER.apply(initialPosition);
        getElement().setProperty("initialPosition",
                initialPositionString == null ? "" : initialPositionString);
    }

    /**
     * Get the visible date when there is no value selected.
     * <p>
     * The same date formats as for the {@code value} property are supported.
     * <p>
     * This property is not synchronized automatically from the client side, so
     * the returned value may not be the same as in client side.
     * </p>
     *
     * @return the {@code initialPosition} property from the datepicker
     */
    public LocalDate getInitialPosition() {
        return DATE_PARSER.apply(getElement().getProperty("initialPosition"));
    }

    public void setRequired(boolean required) {
        getElement().setProperty("required", required);
        this.required = required;
    }

    @Override
    public void setRequiredIndicatorVisible(boolean required) {
        super.setRequiredIndicatorVisible(required);
        this.required = required;
    }
    
    /**
     * Determines whether the datepicker is marked as input required.
     * <p>
     * This property is not synchronized automatically from the client side, so
     * the returned value may not be the same as in client side.
     *
     * @return {@code true} if the input is required, {@code false} otherwise
     */
    public boolean isRequired() {
        return getElement().getProperty("required", false);
    }

    /**
     * Set the week number visible in the EnhancedDatePicker.
     * <p>
     * Set true to display ISO-8601 week numbers in the calendar.
     * <p>
     * Notice that displaying week numbers is only supported when
     * i18n.firstDayOfWeek is 1 (Monday).
     *
     * @param weekNumbersVisible
     *            the boolean value to set
     */
    public void setWeekNumbersVisible(boolean weekNumbersVisible) {
        getElement().setProperty("showWeekNumbers", weekNumbersVisible);
    }

    /**
     * Get the state of {@code showWeekNumbers} property of the datepicker
     * <p>
     * This property is not synchronized automatically from the client side, so
     * the returned value may not be the same as in client side.
     * </p>
     *
     * @return the {@code showWeekNumbers} property from the datepicker
     */
    public boolean isWeekNumbersVisible() {
        return getElement().getProperty("showWeekNumbers", false);
    }

    /**
     * Sets the opened property of the datepicker to open or close its overlay.
     *
     * @param opened
     *            {@code true} to open the datepicker overlay, {@code false} to
     *            close it
     */
    void setOpened(boolean opened) {
        getElement().setProperty("opened", opened);
    }

    /**
     * Opens the datepicker overlay.
     */
    public void open() {
        setOpened(true);
    }

    /**
     * Opens the datepicker overlay.
     */
    public void openOnPosition(int x, int y) {
        this.getElement().executeJs("this.openOnPosition($0,$1)", x,y);
    }

    /**
     * Closes the datepicker overlay.
     */
    protected void close() {
        setOpened(false);
    }

    /**
     * Gets the states of the drop-down for the datepicker
     *
     * @return {@code true} if the drop-down is opened, {@code false} otherwise
     */
    public boolean isOpened() {
        return getElement().getProperty("opened", false);
    }

    /**
     * When auto open is enabled, the dropdown will open when the field is clicked.
     *
     * @param autoOpen Value for the auto open property,
     */
    public void setAutoOpen(boolean autoOpen) {
        getElement().setProperty(PROP_AUTO_OPEN_DISABLED, !autoOpen);
    }

    /**
     * When auto open is enabled, the dropdown will open when the field is clicked.
     *
     * @return {@code true} if auto open is enabled. {@code false} otherwise. Default is {@code true}
     */
    public boolean isAutoOpen() {
        return !getElement().getProperty(PROP_AUTO_OPEN_DISABLED,false);
    }
 
    public void setName(String name) {
        getElement().setProperty("name", name == null ? "" : name);   
    }

    /**
     * Performs server-side validation of the current value. This is needed
     * because it is possible to circumvent the client-side validation
     * constraints using browser development tools.
     */
    protected void validate() {
        setInvalid(isInvalid(getValue()));
    }
    
    /**
     * Gets the name of the EnhancedDatePicker.
     *
     * @return the {@code name} property from the EnhancedDatePicker
     */
    public String getName() {
        return getElement().getProperty("name");
    }

    /**
     * {@code opened-changed} event is sent when the overlay opened state
     * changes.
     */
    public static class OpenedChangeEvent extends ComponentEvent<EnhancedDateRangePicker> {
        private final boolean opened;
        
        public OpenedChangeEvent(EnhancedDateRangePicker source, boolean fromClient) {
          super(source, fromClient);
          this.opened = source.isOpened();
        }
  
        public boolean isOpened() {
            return opened;
        }
    }
    
    /**
     * Adds a listener for {@code opened-changed} events fired by the
     * webcomponent.
     *
     * @param listener
     *            the listener
     * @return a {@link Registration} for removing the event listener
     */
    public Registration addOpenedChangeListener(
            ComponentEventListener<OpenedChangeEvent> listener) {
        return addListener(OpenedChangeEvent.class, listener);
    }

    /**
     * {@code invalid-changed} event is sent when the invalid state changes.
     */
    public static class InvalidChangeEvent extends ComponentEvent<EnhancedDateRangePicker> {
        private final boolean invalid;

        public InvalidChangeEvent(EnhancedDateRangePicker source, boolean fromClient) {
            super(source, fromClient);
            this.invalid = source.isInvalid();
        }

        public boolean isInvalid() {
            return invalid;
        }
    }

    /**
     * Adds a listener for {@code invalid-changed} events fired by the
     * webcomponent.
     *
     * @param listener
     *            the listener
     * @return a {@link Registration} for removing the event listener
     */
    public Registration addInvalidChangeListener(
            ComponentEventListener<InvalidChangeEvent> listener) {
        return addListener(InvalidChangeEvent.class, listener);
    }

    /**
     * Adds the given component into this field before the content, replacing
     * any existing prefix component.
     * <p>
     * This is most commonly used to add a simple icon or static text into the
     * field.
     * 
     * @param component
     *            the component to set, can be {@code null} to remove existing
     *            prefix component
     */
    public void setPrefixComponent(Component component) {
    	EnhancedDateRangePickerPrefixUtil.setPrefixComponent(this, component);
    }
    
    /**
     * Gets the component in the prefix slot of this field.
     * 
     * @return the prefix component of this field, or {@code null} if no prefix
     *         component has been set
     * @see #setPrefixComponent(Component)
     */
    public Component getPrefixComponent() {
    	return EnhancedDateRangePickerPrefixUtil.getPrefixComponent(this);
    }

    /**
     * The internationalization properties for {@link EnhancedDateRangePicker}.
     */
    public static class DatePickerI18n implements Serializable {
        private List<String> monthNames;
        private List<String> weekdays;
        private List<String> weekdaysShort;
        private int firstDayOfWeek;
        private String week;
        private String calendar;
        private String clear;
        private String today;
        private String cancel;
        
        private String yesterday;
        private String thisWeek;
        private String lastWeek;
        private String thisMonth;
        private String lastMonth;
        private String thisYear;
        private String lastYear;

        /**
         * Gets the name of the months.
         *
         * @return the month names
         */
        public List<String> getMonthNames() {
            return monthNames;
        }

        public String getLastYear() {
            return lastYear;
        }

        public DatePickerI18n setLastYear(String lastYear) {
            this.lastYear = lastYear;
            return this;
        }

        public String getThisYear() {
            return thisYear;
        }

        public DatePickerI18n setThisYear(String thisYear) {
            this.thisYear = thisYear;
            return this;
        }

        public String getLastMonth() {
            return lastMonth;
        }

        public DatePickerI18n setLastMonth(String lastMonth) {
            this.lastMonth = lastMonth;
            return this;
        }

        public String getThisMonth() {
            return thisMonth;
        }

        public DatePickerI18n setThisMonth(String thisMonth) {
            this.thisMonth = thisMonth;
            return this;
        }

        public String getLastWeek() {
            return lastWeek;
        }

        public DatePickerI18n setLastWeek(String lastWeek) {
            this.lastWeek = lastWeek;
            return this;
        }

        public String getThisWeek() {
            return thisWeek;
        }

        public DatePickerI18n setThisWeek(String thisWeek) {
            this.thisWeek = thisWeek;
            return this;
        }

        public String getYesterday() {
            return yesterday;
        }

        public DatePickerI18n setYesterday(String yesterday) {
            this.yesterday = yesterday;
            return this;
        }

        /**
         * Sets the name of the months, starting from January and ending on
         * December.
         *
         * @param monthNames
         *            the month names
         * @return this instance for method chaining
         */
        public DatePickerI18n setMonthNames(List<String> monthNames) {
            this.monthNames = monthNames;
            return this;
        }

        /**
         * Gets the name of the week days.
         *
         * @return the week days
         */
        public List<String> getWeekdays() {
            return weekdays;
        }

        /**
         * Sets the name of the week days, starting from {@code Sunday} and
         * ending on {@code Saturday}.
         *
         * @param weekdays
         *            the week days names
         * @return this instance for method chaining
         */
        public DatePickerI18n setWeekdays(List<String> weekdays) {
            this.weekdays = weekdays;
            return this;
        }

        /**
         * Gets the short names of the week days.
         *
         * @return the short names of the week days
         */
        public List<String> getWeekdaysShort() {
            return weekdaysShort;
        }

        /**
         * Sets the short names of the week days, starting from {@code sun} and
         * ending on {@code sat}.
         *
         * @param weekdaysShort
         *            the short names of the week days
         * @return this instance for method chaining
         */
        public DatePickerI18n setWeekdaysShort(List<String> weekdaysShort) {
            this.weekdaysShort = weekdaysShort;
            return this;
        }

        /**
         * Gets the first day of the week.
         * <p>
         * 0 for Sunday, 1 for Monday, 2 for Tuesday, 3 for Wednesday, 4 for
         * Thursday, 5 for Friday, 6 for Saturday.
         *
         * @return the index of the first day of the week
         */
        public int getFirstDayOfWeek() {
            return firstDayOfWeek;
        }

        /**
         * Sets the first day of the week.
         * <p>
         * 0 for Sunday, 1 for Monday, 2 for Tuesday, 3 for Wednesday, 4 for
         * Thursday, 5 for Friday, 6 for Saturday.
         *
         * @param firstDayOfWeek
         *            the index of the first day of the week
         * @return this instance for method chaining
         */
        public DatePickerI18n setFirstDayOfWeek(int firstDayOfWeek) {
            this.firstDayOfWeek = firstDayOfWeek;
            return this;
        }

        /**
         * Gets the translated word for {@code week}.
         *
         * @return the translated word for week
         */
        public String getWeek() {
            return week;
        }

        /**
         * Sets the translated word for {@code week}.
         *
         * @param week
         *            the translated word for week
         * @return this instance for method chaining
         */
        public DatePickerI18n setWeek(String week) {
            this.week = week;
            return this;
        }

        /**
         * Gets the translated word for {@code calendar}.
         *
         * @return the translated word for calendar
         */
        public String getCalendar() {
            return calendar;
        }

        /**
         * Sets the translated word for {@code calendar}.
         *
         * @param calendar
         *            the translated word for calendar
         * @return this instance for method chaining
         */
        public DatePickerI18n setCalendar(String calendar) {
            this.calendar = calendar;
            return this;
        }

        /**
         * Gets the translated word for {@code clear}.
         *
         * @return the translated word for clear
         */
        public String getClear() {
            return clear;
        }

        /**
         * Sets the translated word for {@code clear}.
         *
         * @param clear
         *            the translated word for clear
         * @return this instance for method chaining
         */
        public DatePickerI18n setClear(String clear) {
            this.clear = clear;
            return this;
        }

        /**
         * Gets the translated word for {@code today}.
         *
         * @return the translated word for today
         */
        public String getToday() {
            return today;
        }

        /**
         * Sets the translated word for {@code today}.
         *
         * @param today
         *            the translated word for today
         * @return this instance for method chaining
         */
        public DatePickerI18n setToday(String today) {
            this.today = today;
            return this;
        }

        /**
         * Gets the translated word for {@code cancel}.
         *
         * @return the translated word for cancel
         */
        public String getCancel() {
            return cancel;
        }

        /**
         * Sets the translated word for {@code cancel}.
         *
         * @param cancel
         *            the translated word for cancel
         * @return this instance for method chaining
         */
        public DatePickerI18n setCancel(String cancel) {
            this.cancel = cancel;
            return this;
        }
    }

        /**
     * Removes all contents from this component, this includes child components,
     * text content as well as child elements that have been added directly to
     * this component using the {@link Element} API.
     */
    @Override
    public void removeAll() {
        getElement().getChildren()
                .forEach(child -> child.removeAttribute("slot"));
        getElement().removeAllChildren();
    }

    /**
     * Removes the given child components from this component.
     *
     * @param components
     *            The components to remove.
     * @throws IllegalArgumentException
     *             if any of the components is not a child of this component.
     */
    @Override
    public void remove(Component... components) {
        for (Component component : components) {
            if (getElement().equals(component.getElement().getParent())) {
                component.getElement().removeAttribute("slot");
                getElement().removeChild(component.getElement());
            } else {
                throw new IllegalArgumentException("The given component ("
                        + component + ") is not a child of this component");
            }
        }
    }

    @Override
    public void add(Component... components) {
        HasComponents.super.add(components);
        for (Component component : components) {
            component.getElement().setAttribute("slot", "presets");
        }
    }

    public void removePresetByIds(String ... ids) {
        for (String id : ids) {
            this.getElement().executeJs("this.removePreselectionById($0)", id);
        }
    }

    @Override
    public void setValue(DateRange value) {
      if(value == null) {
        getElement().executeJs("this.value = 'null;null';");
      }
      super.setValue(value);
    }

    @Override
    public DateRange getEmptyValue() {
      return null;
    }
}
