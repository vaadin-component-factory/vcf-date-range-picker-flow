# Date Time Range Picker component for Vaadin Flow

This project is based on [EnhancedDateRangePicker component for Vaadin Flow](https://github.com/vaadin-component-factory/vcf-date-range-picker-flow).

It provides the possibiity to to select date-time ranges using only one scrollable calendar. The implementation relies on the web-component [`<vcf-date-time-range-picker>`](https://github.com/vaadin-component-factory/vcf-date-time-range-picker).
 
This component is part of Vaadin Component Factory.

## Setting up for development:
Clone the project in GitHub (or fork it if you plan on contributing)
```
https://github.com/vaadin-component-factory/vcf-date-time-range-picker-flow
```
To build and install the project into the local repository run 
`mvn clean install -DskipTests`

## Running the demo
To run demo go to `vcf-date-time-range-picker-demo/` subfolder and run `mvn jetty:run`.
After server startup, you'll be able find demo at [http://localhost:8080](http://localhost:8080)

## Using the component in a Flow application
To use the component in an application using maven,
add the following dependency to your `pom.xml`:
```
<dependency>
    <groupId>com.vaadin.componentfactory</groupId>
    <artifactId>vcf-date-time-range-picker</artifactId>
    <version>${component.version}</version>
</dependency>
```

## License

This Add-on is distributed under [Apache Licence 2.0](https://github.com/vaadin-component-factory/vcf-date-time-range-picker-flow/blob/main/LICENSE).

Date Time Range Picker component for Vaadin Flow is written by Vaadin Ltd.

### Sponsored development
Major pieces of development of this add-on has been sponsored by multiple customers of Vaadin. Read more about Expert on Demand at: [Support](https://vaadin.com/support) and [Pricing](https://vaadin.com/pricing).
