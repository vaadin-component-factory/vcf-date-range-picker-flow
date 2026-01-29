# EnhancedDateRangePicker component for Vaadin Flow

This project is based on [DatePicker component for Vaadin Flow](https://github.com/vaadin/vaadin-date-picker-flow) and also in [EnhancedDatePicker](https://github.com/vaadin-component-factory/enhanced-date-picker).

On top of basic functionality of DatePicker, it has ability to select date ranges using only one scrollable calendar.
As in EnhancedDatePicker, formatting is done by JavaScript library [date-fns v2.0.0-beta.2](https://date-fns.org/v2.0.0-beta.2/docs/Getting-Started). More information about supported formatting paterns can be found here:
 https://date-fns.org/v2.0.0-beta.2/docs/format
 
This component is part of Vaadin Component Factory

## Compatibility

- Version 1.x.x supports Vaadin 14+
- Version 2.x.x supports Vaadin 21+
- Version 3.x.x supports Vaadin 23.0.x
- Version 4.x.x supports Vaadin 23.1 & 23.2
- Version 5.x.x supports Vaadin 24
- Version 6.x.x supports Vaadin 25

## Running the component demo
Run from the command line:
- `mvn  -pl enhanced-date-picker-demo -Pwar install jetty:run`

Then navigate to `http://localhost:8080/vcf-date-range-picker`

## Installing the component
Run from the command line:
- `mvn clean install -DskipTests`

## Using the component in a Flow application
To use the component in an application using maven,
add the following dependency to your `pom.xml`:
```
<dependency>
    <groupId>com.vaadin.componentfactory</groupId>
    <artifactId>vcf-date-range-picker</artifactId>
    <version>${component.version}</version>
</dependency>
```

## Flow documentation
Documentation for flow can be found in [Flow documentation](https://github.com/vaadin/flow-and-components-documentation/blob/master/documentation/Overview.asciidoc).

## License

This Add-on is distributed under [Apache Licence 2.0](https://github.com/vaadin-component-factory/vcf-date-range-picker-flow/blob/main/LICENSE).

Enhanced Date Range Picker component for Vaadin Flow is written by Vaadin Ltd.

### Sponsored development
Major pieces of development of this add-on has been sponsored by multiple customers of Vaadin. Read more about Expert on Demand at: [Support](https://vaadin.com/support) and [Pricing](https://vaadin.com/pricing).
