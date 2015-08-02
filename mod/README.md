flowControlInstance 
=====
...

___
repeat
=====
The repeat module instantiates a template once per item from a collection. 
Each template instance gets its own scope, where the given loop variable 
is set to the current collection item.

### canny-var attributes
* **for:** configure the loop variable name.
* **in**: is the source where repeat can find the collection.
 It accepts functions and collections:
   * **collection:** accepts Objects, strings or functions (see on-click)  
   * **function:** repeat will call it with a callback function as parameter. The callback function can be called with the collection
   
E.g.:
```html
<div canny-mod="repeat" canny-var="{'for':'item', 'in':'scope.to.collectionOrFunction'}">...</div>
```
> **Protip:** same for all canny modules you can also instantiate the repeat module from the javscript by passing the variables directly to the add method (repeat.add(node, obj **node** contains the template as children(s), **obj** needs the **for** and **in** property)

### List of strings:
It excepts list of strings.
```javascript
var path = {
  list : ['foo', 'bar']     
}
```
Can be used in HTML like:
```html
<div canny-mod="repeat" canny-var="{'for':'item', 'in':'path.list'}">
  <p>DATA: {{item}})</p>
</div>
```
Generates:
```html
<div canny-mod="repeat" canny-var="{'for':'item', 'in':'path.list'}">
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
<div canny-mod="repeat" canny-var="{'for':'objectItem', 'in':'path.objectList'}">
  <p>DATA FOO: {{objectItem.foo}})</p>
  <p>DATA BAR: {{objectItem.bar}})</p>
</div>
```
Generates:
```html
<div canny-mod="repeat" canny-var="{'for':'item', 'in':'path.list'}">
  <p>DATA FOO: foo1</p>
  <p>DATA BAR: bar1</p>
  <p>DATA FOO: foo2</p>
  <p>DATA BAR: bar2</p>
</div>
```

### Accepts also functions
If you need to generate the data at later time you can pass repeat a function pointer. The **renderRepeatFc** can be 
executed at later time or directly. The advantage of the function is that if the data has changed you can call 
the function again to render the data. If you do this all old data will be removed and replaced byt the new one.
```javascript
var path = {
  functionPointer : function (renderRepeatFc) {
    renderRepeatFc(['foo', 'bar'] ] )
  }    
}
```
Can be used in HTML like:
```html
<div canny-mod="repeat" canny-var="{'for':'item', 'in':'path.functionPointer'}">
  <p>DATA: {{item}})</p>
</div>
```
Generates:
```html
<div canny-mod="repeat" canny-var="{'for':'item', 'in':'path.functionPointer'}">
  <p>DATA: foo</p>
  <p>DATA: bar</p>
</div>
```
### handle click events
If you want to register a click event you can use the **on-click** attribute.
```javascript
var path = {
  objectList : [{clickMe : function () {console.log('foo')}, {clickMe : function () {console.log('bar')}]     
}
```
Can be used like this:
```html
<div canny-mod="repeat" canny-var="{'for':'item', 'in':'path.objectList'}">
  <p on-click="item.clickMe">click me</p>
</div>
```
Generates:
```html
<div canny-mod="repeat" canny-var="{'for':'item', 'in':'path.functionPointer'}">
  <p on-click="item.clickMe">click me</p> <!-- click on element will log 'foo' -->
  <p on-click="item.clickMe">click me</p> <!-- click on element will log 'bar' -->
</div>
```

### add dynamic classes
To add a specific class to a template instance you can use the **add-class** attribute. 
```javascript
var path = {
  objectList : [{className : 'foo'}, {className : 'bar'}]     
}
```
Can be used like this:
```html
<div canny-mod="repeat" canny-var="{'for':'item', 'in':'path.objectList'}">
  <p add-class="item.className">I have the class {{item.className}}</p>
</div>
```
Generates:
```html
<div canny-mod="repeat" canny-var="{'for':'item', 'in':'path.functionPointer'}">
  <p class="foo" add-class="item.className">I have the class foo</p>
  <p class="bar" add-class="item.className">I have the class bar</p>
</diV>
```

### if conditions
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
<div canny-mod="repeat" canny-var="{'for':'item', 'in':'path.conditionCollection'}">
  <p if="item.foo">foo if {{item.foo}}</p>
  <p if-not="item.foo">foo if not {{item.foo}}</p>
</div>
```
Generates:
```html
<div canny-mod="repeat" canny-var="{'for':'item', 'in':'path.functionPointer'}">
  <p if="item.foo">foo if true</p>
  <p if-not="item.foo">foo if not false</p>
</diV>
```
To avoid none existing property exceptions you can also use the if attribute to check if a property of an object exists or not. For example the **barFoo** property only exists for the second element. And instead of four elements it will only render two :
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
<div canny-mod="repeat" canny-var="{'for':'item', 'in':'path.conditionCollection'}">
  <h1 if="item.bar">if bar: {{item.bar.barFoo}}</h1>
  <h2 if-not="item.bar">there is no item bar only foo: {{item.foo}}</h2>
</div>
```
Generates:
```html
<div canny-mod="repeat" canny-var="{'for':'item', 'in':'path.functionPointer'}">
  <h2 if-not="item.bar">there is no item bar only foo: foo</h2>
  <h1 if="item.bar">if bar: barFoo</h1>
</diV>
```

___
async
=====
Loads html files asynchron in to dom.

require (work in progress)
=====

TODO:
 * is there an space in the canny-mod attribute like: canny-mod="moduleName " -> than require tries to load a 'empty' script.


whisker
=====
like mustache but with much less functionality
