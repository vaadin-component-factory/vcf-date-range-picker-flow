# EnhancedDatePicker component for Vaadin Flow

This project is fork of [DatePicker component for Vaadin Flow](https://github.com/vaadin/vaadin-date-picker-flow). 
On top of basic functionality of DatePicker, it has ability to format date by pattern. 
Formatting is done by JavaScript library [date-fns v2.0.0-beta.2](https://date-fns.org/v2.0.0-beta.2/docs/Getting-Started). More information about supported formatting paterns can be found here:
 https://date-fns.org/v2.0.0-beta.2/docs/format
 
Formatting pattern can be set using method `setPattern(String formattingPattern)`. For example:
```java
EnhancedDatePicker datePicker;
datePicker.setPattern("dd-MMM-yyyy");
``` 
or by using constructor: `new EnhancedDatePicker(LocalDate.now(), "dd-MMM-yyyy");`

Patterns used for parsing user's input can be set using method `setParsers(String ... parserPatterns)`. For example:
```java
EnhancedDatePicker datePicker;
datePicker.setParsers("dd-MM-yy", "dd/MM/yy", "dd/MM/yyyy");
``` 
or by using constructor: `new EnhancedDatePicker(LocalDate.now(), "dd-MMM-yyyy", "dd-MM-yy", "dd/MM/yy", "dd/MM/yyyy");`

This component can be used in combination with [`<vaadin-date-picker>`](https://github.com/vaadin/vaadin-date-picker).
In HTML/JS template you can add `<vaadin-date-picker id="datePickerId"></vaadin-date-picker>` and in Java side, you can bind it to `EnhancedDatePicker` like this:

```java
@Id("datePickerId")
private EnhancedDatePicker datePicker;
```


NOTE: Localization in this component is also done by DateFns and some locales for some patterns are not stable: 
for example Russian and French for pattern `MMM`(it adds '.' in the end of month and then it can not parse it back)


[Live Demo ↗](https://incubator.app.fi/enhanced-date-picker-demo/enhanced-date-picker)

This component is part of Vaadin Component Factory

## Running the component demo
Run from the command line:
- `mvn  -pl enhanced-date-picker-demo -Pwar install jetty:run`

Then navigate to `http://localhost:8080/enhanced-date-picker`

## Running Integration tests

For running integration tests demos execute one of the following lines depending on the desired mode
- `mvn -pl enhanced-date-picker-integration-tests clean jetty:run`
- `mvn -pl enhanced-date-picker-integration-tests clean jetty:run -Dvaadin.bowerMode`

Then navigate to `http://localhost:9998/` for see integration tests demos.

For running all integration tests execute
- `mvn clean install verify`

## Installing the component
Run from the command line:
- `mvn clean install -DskipTests`

## Using the component in a Flow application
To use the component in an application using maven,
add the following dependency to your `pom.xml`:
```
<dependency>
    <groupId>com.vaadin.componentfactory</groupId>
    <artifactId>enhanced-date-picker</artifactId>
    <version>${component.version}</version>
</dependency>
```

## Flow documentation
Documentation for flow can be found in [Flow documentation](https://github.com/vaadin/flow-and-components-documentation/blob/master/documentation/Overview.asciidoc).

## Contributing
- Use the coding conventions from [Flow coding conventions](https://github.com/vaadin/flow/tree/master/eclipse)
- [Submit a pull request](https://www.digitalocean.com/community/tutorials/how-to-create-a-pull-request-on-github) with detailed title and description
- Wait for response from one of Vaadin Flow team members

## License

Apache Licence 2