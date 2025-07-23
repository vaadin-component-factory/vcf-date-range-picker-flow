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
package com.vaadin.componentfactory;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import java.time.LocalDateTime;
import com.vaadin.flow.component.UI;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import net.jcip.annotations.NotThreadSafe;

@NotThreadSafe
public class EnhancedDateTimePickerTest {

  private static final String OPENED_PROPERTY_NOT_UPDATED =
      "The server-side \"opened\"-property was not updated synchronously";

  private UI ui;

  @Before
  public void setUp() {
    ui = new UI();
    UI.setCurrent(ui);
  }

  @After
  public void tearDown() {
    UI.setCurrent(null);
  }

  @Test
  public void dateTimeRangePicker_basicCases() {
    EnhancedDateTimeRangePicker picker = new EnhancedDateTimeRangePicker();

    assertEquals(null, picker.getValue().getStartDateTime());
    assertEquals(null, picker.getValue().getEndDateTime());
    assertEquals(";", picker.getElement().getProperty("value"));

    picker.setValue(new DateTimeRange(LocalDateTime.of(2018, 4, 25, 10, 0, 0), null));
    assertEquals("2018-04-25T10:00:00;", picker.getElement().getProperty("value"));

    picker.getElement().setProperty("value", "2017-03-24T00:00:00;");
    assertEquals(new DateTimeRange(LocalDateTime.of(2017, 3, 24, 0, 0, 0), null),
        picker.getValue());

  }

  @Test
  public void defaultCtor_does_not_update_values() {
    EnhancedDateTimeRangePicker picker = new EnhancedDateTimeRangePicker();
    assertNull(picker.getValue().getStartDateTime());
    assertNull(picker.getValue().getEndDateTime());
    assertEquals(";", picker.getElement().getProperty("value"));
  }

  @Test
  public void setInitialValue() {
    EnhancedDateTimeRangePicker picker =
        new EnhancedDateTimeRangePicker(new DateTimeRange(LocalDateTime.of(2018, 4, 25, 11, 30, 00), null));
    assertEquals(new DateTimeRange(LocalDateTime.of(2018, 4, 25, 11, 30, 00), null), picker.getValue());
    assertEquals("2018-04-25T11:30:00;", picker.getElement().getProperty("value"));
  }

  @Test
  public void updatingToNullValue_displaysEmptyString() {
    EnhancedDateTimeRangePicker picker = new EnhancedDateTimeRangePicker();

    picker.setValue(new DateTimeRange(LocalDateTime.now(), null));
    picker.setValue(null);

    assertNull(picker.getValue());
    assertEquals("", picker.getElement().getProperty("value"));
  }

  @Test
  public void setOpened_openedPropertyIsUpdated() {
    EnhancedDateTimeRangePicker picker = new EnhancedDateTimeRangePicker();
    assertFalse("Initially EnhancedDatePicker should be closed", picker.isOpened());
    picker.setOpened(true);
    assertTrue(OPENED_PROPERTY_NOT_UPDATED, picker.isOpened());
    picker.setOpened(false);
    assertFalse(OPENED_PROPERTY_NOT_UPDATED, picker.isOpened());
  }

  @Test
  public void openAndClose_openedPropertyIsUpdated() {
    EnhancedDateTimeRangePicker picker = new EnhancedDateTimeRangePicker();
    assertFalse("Initially EnhancedDatePicker should be closed", picker.isOpened());
    picker.open();
    assertTrue(OPENED_PROPERTY_NOT_UPDATED, picker.isOpened());
    picker.close();
    assertFalse(OPENED_PROPERTY_NOT_UPDATED, picker.isOpened());
  }

  @Test
  public void clearButtonVisiblePropertyValue() {
    EnhancedDateTimeRangePicker picker = new EnhancedDateTimeRangePicker();

    assertFalse("Clear button should not be visible by default", picker.isClearButtonVisible());
    assertClearButtonPropertyValueEquals(picker, true);
    assertClearButtonPropertyValueEquals(picker, false);
  }

  public void assertClearButtonPropertyValueEquals(EnhancedDateTimeRangePicker picker,
      Boolean value) {
    picker.setClearButtonVisible(value);
    assertEquals(value, picker.isClearButtonVisible());
    assertEquals(picker.isClearButtonVisible(),
        picker.getElement().getProperty("clearButtonVisible", value));
  }

}
