canny
=====

Dom module manager. 

Canny helps you to organize javascript in modules. Canny is just a quite simple helper to initialize your javascript modules directly with the dom. 

# documentation

## create module

Each canny module has to implement the add function. Here an example of the basic interface: 

```javascript
var myCannyMod = {
	add : function () {}
}
```

## register module

Before you can use it, your module needs to be registererd to the canny module. The name is important for canny to match the dom elements and also for you to get access to your module via the canny namespace.

```javascript
canny.add('myUniqueModuleName', myCannyMod);
```

Now you module is available via: <strong>canny.myUniqueModuleName</strong>

Note: There are some names there are already used from canny and can't be used as module names like: add, ready and cannyParse. 

Congratulation you've registered your first canny module! As next we bind our module to a specific dom element:

## bind to a dom element

Canny searches the hole dom tree for canny-mod attributes and calls the add method if a registered module is found.

```html
<div canny-mod="myUniqueModuleName" ></div>
```

You can add as many dom elements as you wont. Canny will call the add method for each registered module which was found in the dom.

Below an example where the add method from the same module is called three times. Exactly one call for each matched dom element.

```html
<div canny-mod="myUniqueModuleName" ></div>
<div canny-mod="myUniqueModuleName" ></div>
<div canny-mod="myUniqueModuleName" ></div>
```

### get access via add

The add methods is called with two parameters. The first one is the matched dom element. The second one is an optional parameter which you can add module specific attributes, the <strong>canny-var</strong>.

```javascript
var myCannyMod = {
	add : function (domNode, attributes) {
		// domNode - the dom element which was found in the view
	}
}
```

Below we add the canny-var attribute to our dom element.

```html
<div canny-mod="myUniqueModuleName" canny-var="helloModule"></div>
```

Now canny pass the var attribute to the add function.

```javascript
var myCannyMod = {
	add : function (domNode, attributes) {
		// attributes - this is our passed string 'helloModule'
		console.log(attributes); // --> 'helloModule'
	}
}
```

If you need to pass more than one attribute you can also pass a JSON object to canny-var like:

```html
<div canny-mod="myUniqueModuleName" canny-var="{'foo':'this is foo', 'bar':'this is bar'}"></div>
```

Canny will parse the JSON and pass it as second attribute to the add method. But now as an object!

```javascript
var myCannyMod = {
	add : function (domNode, attributes) {
		// attributes - this is a object with foo and bar
		console.log(attributes.foo); // --> 'helloModule'
        console.log(attributes.bar); // --> 'helloModule'
	}
}
```

### handle ready

The ready method from your module will be called when the dom is parsed completely. Means that all add methods from all canny-mod which could be found in the dom are called. 

```javascript
var myCannyMod = {
	add : function () {/*...*/},
	ready : function () {
		// called if all modules registered
	}
}
```

Important to know is that the ready method from your module will only be called when canny has found your module in the dom. If you module is not used in the view (but registered via canny.add('myModule', ... ) the ready method will not called. If you need this you have to use the canny.ready method:

```javascript
canny.ready(function () {
    // will be called if all modules are initialized
})
``` 
___

## API

### canny-mod

Expects a module name. If the name is not registered canny will print a warn.

```html
<div canny-mod="myUniqueModuleName"></div>
```

If you need more than one module you can pass module names as a space seperated list

```html
<div canny-mod="myUniqueModuleName fooMod barMod"></div>
```

### canny-var

Pass attributes to your module as string:
```html
<div canny-mod="fooMod" canny-var="myFoo"></div>
```
Pass attributes to your module as object:

```html
<div canny-mod="fooMod" canny-var="{'foo':'my foo', 'bar':'my bar'}"></div>
```
If you have more than one registered module and you need to pass for each module separate attributes you can use the moduleName-var.

```html
<div canny-mod="fooMod barMod" canny-fooMod="myFoo" canny-var={'bar':'my bar'}></div>
```
If you use both, canny-var and canny-moduleName than canny will give the canny-moduleName the prior and will ignore the canny-var. 

```html
<div canny-mod="fooMod barMod" canny-fooMod="myFoo" canny-var=myBar></div>
```
The 'canny.fooMod.add' method will called with 'myFoo' and not with the 'myBar'. Only the 'barMod' will called with 'myBar'.

### canny modules

#### add

```javascript
canny[myModuleName].add(domNode, [cannyVars])
```

#### ready
Will be called when:
 * all add methods from all modules there are found in the dom are called
 * and your module was found in the view

If your module is not in the view (registered on a dom element with canny-mod) than it will not called. If you need this please use the 'canny.ready' instead. 
```javascript
canny[myModuleName].ready()
```

### canny

#### add

Use this to register your modules to canny. Should be done early as possible (If canny parses the dom and your module is registered later canny will ignore it - if you need this check the cannyParse function).

```javascript
canny.add(moduleName, obj)
```

#### ready

Canny own ready method. Like the dom ready but all canny modules are registered and initialized.

```javascript
canny.ready(callback)
```

#### cannyParse

Public method to parse content manually with canny initialisation behavior. 

```javascript
canny.cannyParse(node, name, callback) 
```

E.g.: use cannyParse to parse your own dom elements. This function needs to be called with a object on which the modules is registered. 

```javascript
canny.cannyParse.apply(canny, [node, 'canny', function () {
	console.log('parse done');
}]) 
```
This function is helpful if you wont to add your modules on a different name space. E.g. we create our own namespace 'myModule' and add a 'canny module' fooMod:

```javascript
var myModule = {
	fooMod : {
		add : function (node, attr) {
		    console.log('use cannyParse to initialize my none canny module', attr);
		}
	}
};
```

Than we could have the following HTML content. Instead of canny we named it 'myModule'.

```html
<div myModule-mod="fooMod" myModule-var="myAttributes"></div>
```
Canny will ignore this content. But we can use the cannyParse to let canny initialize our own module with canny behavior.

```javascript
canny.cannyParse.apply(myModule, [node, 'myModule', function () {
	console.log('parse done');
}]) 
```
What we get is the console output from the add method of our 'fooMod':
```javascript
>>> use cannyParse to initialize my none canny module > myAttributes 
```
