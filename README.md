# Simple Custom Elements & PWA boilerplate

## BaseComponent
The BaseComponent can be inherited to create custom elements.
The constructor of BaseComponent accepts two parameters:
1. url/template. This option is a string, and reflects one of the following:
* If the _inline_ option (see bellow) is true, this string is considered to be HTML
* If the _inline_ option is false (default: false), this string is the url of the html template file, minus the _html_ extension.
If the _withStyles_ options is also true (default: true), this url path is going to be used for retrieving a style file with a css extension, too.

2. options. Following options are accepted:
* mode (default: open): 'open' or 'closed' property passed to the Shadow DOM
* withStyles (default: true): if not inline, use the template url to retrieve also a styles file, with the same url and the .css extension
* inline (default: false): use the first constructor parameter as a string representation of the HTML template, and don't fetch any remote HTML template, or styles
* dynamic (default: true): process all the dynamic data properties of the template, and modify the DOM accordingly


## Component State Values and Props
Components have state and props, which come automatically into play, only when the component has a dynamic template.
Props are set with the _setProps_ function.
State is set with the _setStateValues_ function.
Both of those functions cause an update of the template.
If a same named attribute exists on both props and state values, props have precedence.

## Dynamic Templates
When the BaseComponent has a dynamic template, it traverses the DOM in search of the following data attributes:
* [data-content]
* [data-attr]
* [data-list]
* [data-if]
* [data-callback]

### [data-content]
Replace the innerHTML of the component, with a string value coming from either props os state values

### [data-attr]
The value of data-attr should always be a string separated into two parts with a semicolon, e.g. attrName:propName.
The attribute of the component called attrName, is set to the value of propName, as found in either props or state values.

### [data-list]
The value of data-list should always be a string separated into two parts with a semicolon, e.g. listName:templateName.
The templateName is used to look for a template (only the first time), which is the used for rendering the items of the list.
The listName is used to find the array that contains the values in either props or state values.
Every item of the list, is considered to be also a template, and it is updated, with a reduced scope. The list items is considered to be the 'props' but the state of the component is shared through items. This applies even if the list was part of the state values, and not the props.
Lists re-render fully on every change.

### [data-if]
The value of data-if can either be a string separated into two parts with a semicolon, or a string. 
If it contains only a string, then this string is the name of the value of propName, as found in either props or state values, which is used to check if this component should be shown. If the value is truthy, it is shown, if it is falsy, it is not.
If it contains a semicolon, the first part should always be 'not', and in that case, the component acts in the opposite way (show on falsy values, hide on truthy)

### [data-callback]
The value of data-callback should always be a string separated into two parts with a semicolon, e.g. eventName:handlerName.
A handler that is a method of the component, with the name handlerName, is going to be attached on the element, and listen for the event called eventName.
Handlers are attached after the first template update, and the are stored in the state, in an eventListeners array, as objects: { elem, event, handler }.
