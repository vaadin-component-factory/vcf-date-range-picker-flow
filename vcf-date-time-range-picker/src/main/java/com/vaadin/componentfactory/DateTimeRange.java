/*
 * Copyright 2025 Vaadin Ltd.
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

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * A simple data class that represents a date-time range using two {@link LocalDateTime} values: a
 * start and an end.
 */
@SuppressWarnings("serial")
public class DateTimeRange implements Serializable {

  private LocalDateTime startDateTime;
  private LocalDateTime endDateTime;

  /**
   * Constructs a new {@code DateTimeRange} with the specified start and end {@link LocalDateTime}.
   *
   * @param startDateTime the start of the date-time range
   * @param endDateTime the end of the date-time range
   */
  public DateTimeRange(LocalDateTime startDateTime, LocalDateTime endDateTime) {
    this.startDateTime = startDateTime;
    this.endDateTime = endDateTime;
  }

  /**
   * Returns the start of the date-time range.
   *
   * @return the start date-time
   */
  public LocalDateTime getStartDateTime() {
    return startDateTime;
  }

  /**
   * Sets the start of the date-time range.
   *
   * @param startDateTime the new start date-time
   */
  public void setStartDateTime(LocalDateTime startDateTime) {
    this.startDateTime = startDateTime;
  }

  /**
   * Returns the end of the date-time range.
   *
   * @return the end date-time
   */
  public LocalDateTime getEndDateTime() {
    return endDateTime;
  }

  /**
   * Sets the end of the date-time range.
   *
   * @param endDateTime the new end date-time
   */
  public void setEndDateTime(LocalDateTime endDateTime) {
    this.endDateTime = endDateTime;
  }

  @Override
  public String toString() {
    return String.format("%s;%s", this.startDateTime, this.endDateTime);
  }

  @Override
  public int hashCode() {
    return Objects.hash(endDateTime, startDateTime);
  }

  @Override
  public boolean equals(Object obj) {
    if (this == obj)
      return true;
    if (obj == null)
      return false;
    if (getClass() != obj.getClass())
      return false;
    DateTimeRange other = (DateTimeRange) obj;
    return Objects.equals(endDateTime, other.endDateTime)
        && Objects.equals(startDateTime, other.startDateTime);
  }

}
