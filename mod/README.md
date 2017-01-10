repeat
=====
The repeat module instantiates a template once per item from a collection.
Each template instance gets its own scope, where the given loop variable
is set to the current collection item.

### canny-var attributes
**String**
* pass the global reference (repeat will resolve the string on the window object) which can be a
  * function pointer (best choice - also to configure the scope variable name)
  * directly the collection of items
  * or directly the array of items as string (see examples)
  
The default loop variable scope is *item*

E.g.:
```html
<div canny-mod="repeat" canny-var="scope.to.collectionOrFunctionPointer">{{item}}</div>
```

**JSON Object:** (Prefer the string variant above - this might be deprecated in future)
* **for:** configure the loop variable name (default is **item**).
* **in**: is the source where repeat can find the collection.
 It accepts functions and collections:
   * **collection:** accepts Objects, strings or functions (see on-click)  
   * **function:** repeat will call it with a callback function as parameter. The callback function can be called with the collection

E.g.:
```html
<div canny-mod="repeat" canny-var="{'for':'customScope', 'in':'scope.to.collectionOrFunctionPointer'}">{{customScope}}</div>
```
   
##### initialize from javascript
 You can also initialize the repeat module from you custom function via calling the repeat.add -method directly:
```js
...
canny.repeat.add(document.getElementById('sampleList'), function (repeatCB) {
  // save callback to call it again for render again your list
  renderDOMListAgain = repeatCB;
  // call the repeat callback with a simple list
  repeatCB(['one', 'two', 'three']);
})
```
Your initial HTML could look like:
```html
<ul id="sampleList">
 <li>Number: {{item}}</li>
</ul> 
```

**JSON Array:**
* pass and array instead of an JSON object (the default iterator name is **item**)

E.g.:
```html
<div canny-mod="repeat" canny-var="scope.to.collectionOrFunctionPointer">...</div>
```

### Static List:
You can pass a static JSON array direct to canny-var. The default iterator name is **item**.
```html
<ul canny-mod="repeat" canny-var="['item 1','item 1','item 3']">
    <li>{{item}}</li>
</ul>
```
Generates:
```html
<ul canny-mod="repeat" canny-var="['item 1','item 1','item 3']">
    <li>item 1</li>
    <li>item 2</li>
    <li>item 3</li>
</ul>
```

### List of strings:
It excepts list of strings.
```javascript
var path = {
  list : ['foo', 'bar']     
}
```
Can be used in HTML like:
```html
<div canny-mod="repeat" canny-var="path.list">
  <p>DATA: {{item}})</p>
</div>
```
Generates:
```html
<div canny-mod="repeat" canny-var="path.list">
  <p>DATA: foo</p>
  <p>DATA: bar</p>
</div>
```

### List of objects
It excepts list of objects.
```javascript
var path = {
  objectList : [{foo : 'foo1', bar: 'bar1'}, {foo : 'foo2', bar: 'bar2'}]     
}
```
Can be used like this:
```html
<div canny-mod="repeat" canny-var="path.objectList">
  <p>DATA FOO: {{item.foo}})</p>
  <p>DATA BAR: {{item.bar}})</p>
</div>
```
Generates:
```html
<div canny-mod="repeat" canny-var="path.list">
  <p>DATA FOO: foo1</p>
  <p>DATA BAR: bar1</p>
  <p>DATA FOO: foo2</p>
  <p>DATA BAR: bar2</p>
</div>
```

### List of functions
It excepts list of functions. Each function will called from canny.repeat with the actual DOM node.
<br/>Important to know is that Functions can only return strings!
```javascript
var obj = {
  functionList : [
    function() {return "retValue1"},
    function() {return "retValue2"}
  ]     
}
```
Can be used like this:
```html
<div canny-mod="repeat" canny-var="obj.functionList">
  <p>return value 1: {{item}})</p>
  <p>return value 2: {{item}})</p>
</div>
```
Generates:
```html
<div canny-mod="repeat" canny-var="obj.functionList">
  <p>return value 1: retValue1</p>
  <p>return value 2: retValue2</p>
</div>
```

### Accepts also functions
If you need to generate the data at later time you can pass repeat a function pointer. The **renderRepeatFc** can be
executed at later time or directly. The advantage of the function is that if the data has changed you can call
the function again to render the data again. If you do this all old data will be removed and replaced by the new one.
```javascript
var path = {
  functionPointer : function (renderRepeatFc) {
    renderRepeatFc(['foo', 'bar'] ] )
  }    
}
```
Can be used in HTML like:
```html
<div canny-mod="repeat" canny-var="path.functionPointer">
  <p>DATA: {{item}})</p>
</div>
```
Generates:
```html
<div canny-mod="repeat" canny-var="path.functionPointer">
  <p>DATA: foo</p>
  <p>DATA: bar</p>
</div>
```
### rp-bind attribute
With rp-bind you can bind a function to the rendered element. The function will be called with the registered node as parameter.
If you return false the element will be removed from the DOM.
```javascript
var path = {
  objectList : [{control : function (node) {node.className = 'foo';}, {control : function (node) {node.className = 'bar';}]     
}
```
Can be used like this:
```html
<div canny-mod="repeat" canny-var="path.objectList">
  <p rp-bind="item.control">click me</p>
</div>
```
Generates:
```html
<div canny-mod="repeat" canny-var="path.functionPointer">
  <p rp-bind="item.control">click me</p> <!-- click on element will log 'foo' -->
  <p rp-bind="item.control">click me</p> <!-- click on element will log 'bar' -->
</div>
```

### modifier attributes
To add a specific attribute to a template instance you can just add the "expression" to the attribute.
```javascript
var path = {
  objectList : [{className : 'foo foo1'}, {className : 'bar'}]     
}
```
Can be used like this:
```html
<div canny-mod="repeat" canny-var="path.objectList">
  <p class="{{item.className}}">I have the class {{item.className}}</p>
</div>
```
Generates:
```html
<div canny-mod="repeat" canny-var="path.objectList">
  <p class="foo foo1">I have the class foo and foo1</p>
  <p class="bar">I have the class bar</p>
</diV>
```
This works for all kind of attributes. Like id, src, href... and so on.

### if conditions (deprecated instead of use rp-bind)
With the if condition you can decide which part of you template should be rendered and which not.
There are two attributes: **if** and **if-not**.

Note: maybe later it could also contain more complex logic. E.g. pass directly a conditional statement like if="item.foo === 'foo'". But actually this logic could also be implemented in the javascript file. Currently there is no reasion to move logic like this to the DOM level.
```javascript
var path = {
  conditionCollection : [{foo : true}, {foo : false}]     
}
```
Can be used like this:
```html
<div canny-mod="repeat" canny-var="path.conditionCollection">
  <p if="item.foo">foo if {{item.foo}}</p>
  <p if-not="item.foo">foo if not {{item.foo}}</p>
</div>
```
Generates:
```html
<div canny-mod="repeat" canny-var="path.functionPointer">
  <p if="item.foo">foo if true</p>
  <p if-not="item.foo">foo if not false</p>
</diV>
```
To avoid none existing property exceptions you can also use the if attribute to check if a property
of an object exists or not. For example the **barFoo** property only exists for the second element.
And instead of four elements it will only render two :
```javascript
var path = {
  conditionCollection :[
    {foo : 'foo'},
    {foo : 'foo', bar: {barFoo : 'barFoo'}}
  ]     
}
```
Can be used like this:
```html
<div canny-mod="repeat" canny-var="path.conditionCollection">
  <h1 if="item.bar">if bar: {{item.bar.barFoo}}</h1>
  <h2 if-not="item.bar">there is no item bar only foo: {{item.foo}}</h2>
</div>
```
Generates:
```html
<div canny-mod="repeat" canny-var="path.functionPointer">
  <h2 if-not="item.bar">there is no item bar only foo: foo</h2>
  <h1 if="item.bar">if bar: barFoo</h1>
</diV>
```

___
whisker
=====

> Note: since canny version **0.1.0** whisker is not backward compatible anymore. The **whiskerUpdate** method has been removed.
Instead whisker pass the update callback directly to your function pointer. Please read the doc to understood the
new syntax.

Whisker is a small template engine which supports flexible text and attribute changing. Only what whisker
needs is a source function where whisker can take the property object.
For example to render a simple text to your HTML you can do the following:
```html
<div canny-mod="whisker" canny-var="method">
   <p>Hallo {{scope.name}}!</p>
</div>
```
Only what you need  is to provide a function in the global scope and tell whisker the name space 'scope':
```javascript
var method = function (whiskerCallback) {
  whiskerCallback('scope', {name: 'whisker'});
}
```
The output of this will be
```
  Hallo whisker!
```

### change dynamically
Only what you need is to save the callback from whisker and call it again:
```javascript
...
  whiskerCallback('scope', {name: 'user'});
...
```
and whisker will change the HTML to:
```
Hallo user!
```

### attribute example
You can use whisker to modifier and change attributes. For example a image tag:
```html
<div canny-mod="whisker" canny-var="method">
  <img src="{{image.src}}" alt="{{image.alt}}"/>
</div>
```
javascript:
```javascript
var method = function (whiskerCallback) {
  whiskerCallback('image', {src: '/image/path/pic.png', alt: 'picture'});
}
```
It will set the src and alt attribute like:
```html
<div canny-mod="whisker" canny-var="method">
  <img src="/image/path/pic.png" alt="{{image.alt}}"/>
</div>
```
If you call the whisker callback again you can load a different image.
### scope
If you don't want to tell whisker the scope every time you can configure it in the HTML:
```html
<div canny-mod="whisker" canny-var="{'bind':'image','to':'method'}">
  <img src="{{image.src}}" alt="{{image.alt}}"/>
</div>
```
and then pass directly the object to the whisker callback:
```javascript
var method = function (whiskerCallback) {
  whiskerCallback({src: 'img.png', alt: 'a image'});
}
```
### multiple scopes:
Whisker support multiple scopes but this has also disadvantages for example you can do the following:
```html
<div canny-mod="whisker" canny-var="method1">
    <div canny-mod="whisker" canny-var="method2">
       <p>{{scope1.text}}!</p>
       <p>{{scope2.text}}!</p>
    </div>
</div>
```
javascript
```javascript
var method1 = function (whiskerCallback) {
      whiskerCallback('scope1',{text: 'Some text'});
    },
    method2 = function (whiskerCallback) {
      whiskerCallback('scope2',{text: 'Different text in a different scope'});
    }
```
The HTML will looks like:

```html
<div canny-mod="whisker" canny-var="method1">
    <div canny-mod="whisker" canny-var="method2">
       <p>Some text!</p>
       <p>Different text in a different scope!</p>
    </div>
</div>
```

This works fine so far each callback will be called. If for example method2 doesn't call the whisker callback then
the expression will stay in the HTML:

```html
<div canny-mod="whisker" canny-var="method1">
    <div canny-mod="whisker" canny-var="method2">
       <p>Some text!</p>
       <p>{{scope2.text}}!</p>
    </div>
</div>
```

Make sure that all of them are called. If only a property is not exists then the expression will be replaced by an
empty string.

### wk-bind attribute
With wk-bind you can bind a function to the rendered element. The function will be called with the registered node as parameter.
If you return false the element will be removed\* from the DOM.

Note: try to avoid the return false if you 
 * want modify other elements inside the removed container
 * if you have other scope whisker placeholder which needs to be rendered 

Syntax: **wk-bind="scope.functionPointer"**

> \* it will be replaced by an placeholder div with display:none. If you execute the 
>  function again without returning explicit false the original node will be restored. 

```javascript
var registerWhisker = function (fc) {
    fc('scope', {
      functionPointer1 : function (node) {return false;},     
      functionPointer2 : function (node) {node.style.color = 'red'; node.innerHTML = "I'm red"},     
    });
}
```

The initial HTML looks like:
```html
<div canny-mod="whisker" canny-var="registerWhisker">
    <div wk-bind="functionPointer1">first sample</div>
    <div wk-bind="functionPointer2">second sample</div>
</div>
```
and after executing:
```html
<div canny-mod="whisker" canny-var="registerWhisker">
    <div style="display:none" />
    <div wk-bind="functionPointer2" style="color:red">I'm red</div>
</div>
```
If you save the fc pointer you can execute it again with:
```javascript
fc('scope', {
  functionPointer1 : function (node) {return true;}, // restore the node    
  functionPointer2 : function (node) {node.style.color = 'green'; node.innerHTML = "I'm gree"},     
});
```
and the HTML will look like:
```html
<div canny-mod="whisker" canny-var="registerWhisker">
    <div wk-bind="functionPointer1">first sample</div>
    <div wk-bind="functionPointer2" style="color:green">I'm green</div>
</div>
```
___
async
=====
The main purpose of this module is to attach asynchonous loaded HTML snippets to the DOM and apply the canny logic on it.
You can also use it to do simple GET or POST calls to the server.

### load async HTML

You can add async as canny module direct in the DOM to load asynchrounous HTML files

```html
<div canny-mod="async" canny-var="{'url' : '/asyncFiles/content.html'}">
    <!-- all conent will be added in here -->
</div>
```

Async will automatically add all scripts to the head of the page and will trigger the canny parse for the loaded HTML DOM.

You can also use it directly from your JS with calling:
```js
canny.async.loadHTML(document.getElementById('loadInHere'), {url : '/asyncFiles/content.html'});
```

> You can combine the async module with the flowControl module in a way that the async load of
the HTML file will only be triggered if the view is active. Further information see **flowControl async**.

#### realtive URL's

You can configure the relative URL from which the resources will be loaded.

If you pass a **mediaURL** property to the async module than all relative url's will be loaded from them.
```html
<div canny-mod="async" canny-var="{'url' : '/asyncFiles/content.html','mediaURL':'/base/'}">
    <!-- all conent will be added in here -->
</div>
```
**content.html**
```html
<script type="text/javascript" src="relativeURL/script.js"></script>
<link rel="stylesheet" href="relativeURL/style.css" type="text/css"/>
```
Both URL's will be prefixed with /base/relativeURL/... . All absolute URL's like / or http:// or https:// won't be touched.

Note: actually it's only supporting link and script tags. Tags like img, iFrames and so on are not supported. If you need this please ask for it or send me a pull request ;)

### POST/GET
To make a simple POST call the the server you can use the **doAjax** method.

>  noCache:boolean,
>  method:string|POST(default),
>  data:object,string,
>  path:string,
>  async:boolean|true(default),
>  onFailure:function,
>  onSuccess:function,
>  contentType:string|Content-Type(default),
>  mimeType:string|text plain(default)


```
canny.async.doAjax({path : '/rest/endpoint', data : 'mydata', onSuccess : function () {console.log('POST done')}});
```

___
flowControl
===========

> Note: since canny version **0.1.0** flowControlInstance is renamed to flowControl.

With the flowControl module you can easily manage different views in your browser. It supports:

 * single views
 * grouped views

More description is coming soon...

### flowControl async

You can combine the functionality of flowControl with the asynchrounous load of HTML content. To make this happen you can configure a
async property with the URL of the HTML snippet you want to add.

```html
<div canny-mod="flowControl" canny-var="{'view': 'showAsyncHTML', 'async' : '/asyncFiles/content.html'}" style="display: none">
    <!-- all conent will be added in here -->
</div>
```

If you call:

```js
canny.flowControl.show('showAsyncHTML');
```

Then flowControl uses the canny.async module to trigger the HTML file load and after this flowControl will show the view. If you cann the show method again flowControl will **not** trigger the load again and will only activate the view.

___
require (work in progress)
==========================


TODO:
 * is there an space in the canny-mod attribute like: canny-mod="moduleName " -> than require tries to load a 'empty' script.
