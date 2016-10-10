canny
=====

[NPM: canny](https://www.npmjs.com/package/canny)

[Supports browserify](https://github.com/substack/node-browserify)

[Fork me on github](https://github.com/eightyfour/canny/)

[Read more about the existing modules](https://github.com/eightyfour/canny/tree/master/mod)

> Note: Canny is still in a alpha phase and some modules might be changed in near future. So far I've time I will continue with the development and documentation. Any input or help are welcome ;)

[![Build Status](https://travis-ci.org/eightyfour/canny.svg)](https://travis-ci.org/eightyfour/canny)

Dom module manager. Canny is not a framework canny is more a tiny library which helps you to organize javascript in modules. Canny is just a quite simple helper to initialize your javascript modules directly with the dom. 

*Why should I use canny? You can:*

 * *write module without any selectors*
 * *write modules there are easily to test*
 * *break down your modules in tiny logical pieces*
 * *have a global name space*
 * *have your own name space (on for each module)*
 * *have maximum flexibility to desgin your modules*
 * *work with test driven development*
 * *use canny or not*

Canny interact quite close with the dom. You can register the modules directly to the dom elements, instead of using selectors which are defined somewhere in the javascript and points to id's or classes there must be available... 
This is one of the main advantages because it makes easier to see which HTML elements have a javascript functionality. And in most of the cases it's not complicated to change the dom structure. 


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

## bind to dom 

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

### access via add

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

If you need to pass more then one attribute you can also pass a JSON object to canny-var like:

```html
<div canny-mod="myUniqueModuleName" canny-var="{'foo':'this is foo', 'bar':'this is bar'}"></div>
```

Canny will parse the JSON and pass it as second attribute to the add method. But now as an object!

```javascript
var myCannyMod = {
	add : function (domNode, attributes) {
		// attributes - this is a object with foo and bar
		console.log(attributes.foo); // --> 'this is foo'
        console.log(attributes.bar); // --> 'this is bar'
	}
}
```

### handle ready

The ready method from your module will be called when canny has called all add methods from all registered modules which be could found in the view.

```javascript
var myCannyMod = {
	add : function () {/*...*/},
	ready : function () {
		// called if all modules registered
	}
}
```

**notice:** Important to know is that the ready method from your module will only be called when canny has found your module in the dom. If you module is not used in the view (but registered via canny.add('myModule', ... ) the ready method will not called. If you need this you have to use the canny.ready method:

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

If you need more then one module you can pass module names as a space seperated list

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
If you have more then one registered module and you need to pass for each module separate attributes you can use the moduleName-var.

```html
<div canny-mod="fooMod barMod" canny-fooMod="myFoo" canny-var={'bar':'my bar'}></div>
```
If you use both, canny-var and canny-moduleName then canny will give the canny-moduleName the prior and will ignore the canny-var. 

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

```javascript
canny[myModuleName].ready()
```

(**Notice:** If your module is not in the view (registered on a dom element with canny-mod) then ready will not be called. If you need this you can use the 'canny.ready' instead. See chapter canny -> ready)

### canny

#### add

Use this to register your modules to canny. Should be done early as possible (If canny parses the dom and your module is registered later canny will ignore it - if you need this check the cannyParse function).

```javascript
canny.add(moduleName, obj)
```

> If you need the current canny instance you can pass a function instead of an object to the add method. Canny will call the function with the canny instance.
```javascript
canny.add(moduleName, function(cannyInstance))
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
This function is helpful if you wont to create a your modules on a different name space. E.g. we create our own namespace 'myModule' and add a 'canny module' fooMod:

```javascript
var myModule = {
	fooMod : {
		add : function (node, attr) {
		    console.log('use cannyParse to initialize my own canny instance', attr);
		}
	}
};
```

Then we could have the following HTML content. Instead of canny we named it 'myModule'.

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

## how to use canny

### module
A good way is to create your module as a closure which returns the add method and saves all required nodes. Now let's create a module which saves all nodes in a internal 'map'. 

```javascript
canny.add('saveDomNodes', (function () {
	var nodes = {};	
	return {
	    getNodes : function (id) {
	        return [].slice.call(Object.keys(nodes));
	    },
	    getNodeById : function (id) {
	        return nodes[id];
	    },
		add : function (node, attr) {
			nodes[attr] = node;
		},
		ready : function () {
			// save access to other modules via canny.otherModule.doSomething();
		}
	}
}()));
```

The HTML could loo like:

```html
<div canny-mod="saveDomNodes" canny-var="node1"></div>
<div canny-mod="saveDomNodes" canny-var="node2"></div>
<div canny-mod="saveDomNodes" canny-var="node3"></div>
```
Now we have access to the nodes without written a selector:
```javascript
// return all registered nodes:
canny.saveDomNodes.getNodes(); 
// returns node2:
canny.saveDomNodes.getNodeById('node2');
```

Using the example above only for selectors looks over engineered. But with this knowledge you can create great modules. We can define in the var attribute different behaviors for our module. 

Below an example where you give your module more functionality. We just need the dom nodes to add the advanced functionality:

```javascript
canny.add('menuModule', (function () {
    var menu,
        modules = {
            toggleOpenMenuButton : function (node) {
                node.addEventListener(('click'), function () {
                    if (menu.classList.contains('c-open')) {
                        menu.classList.remove('c-open');
                    } else {
                        menu.classList.add('c-open');
                    }
                })
            },
            menu : function (node) {
                menu = node;
                // initialize the menu - e.g. closed by default
                menu.classList.remove('c-open');
            }
        };
    return {
        add : function (node, attr) {
            // check if the module supports the attr
            if (modules.hasOwnProperty(attr)) {
                // execute the function
                modules[attr](node);
            }
        },
        ready : function () {
            // secure access to other modules via canny.otherModule.doSomething();
        }
    }
}()));
```
Now we define a node for our menu. And a additional node to register a show button.
```html
<div canny-mod="menuModule" canny-var="menu">
	<ul>
		<li>item 1</li>
		<li>item 2</li>
		<li>item 3</li>
	</ul>
</div>

<div canny-mod="menuModule" canny-var="toggleOpenMenuButton"></div>
<!-- 
	...
and if you wont then add a second button somewhere else in the dom 
	...
-->
<div canny-mod="menuModule" canny-var="toggleOpenMenuButton"></div>
```

The good thing is you can easily remove and add the toggleOpenMenuButton because there is no selector in the code. If a button exist it will become the functionality. 

The menuModule  example demonstate a good usecase for a canny module. You can capsulate all module specific functionality inside the module. And you have a clear interface for other modules there need access to it. For example a other module needs to be known when a menuButton is clicked. Let's extend the menuModule with a clickListener: 

```javascript
canny.add('menuModule', (function () {
	var menu,
		toggleOpenMenuButtonCallback = function () {},
		modules = {
			toggleOpenMenuButton : function (node) {
				node.addEventlistener('click'), function () {					
					if (menu.classList.contains('c-open')) {
						menu.classList.remove('c-open');
						toggleOpenMenuButtonCallback(false)	
					} else {
						menu.classList.add('c-open');
						toggleOpenMenuButtonCallback(true);
					}
					
				}	
			},
			menu : function (node) {...}
		};	
	return {
		onMenuStateChanged : function (callback) {
			toggleOpenMenuButtonCallback = callback;	 
		},
		add : function (node, attr) {...}
		ready : function () {...}
	}
}()));
```

Now a different module can register a callback to our module which is triggered when the toogle button is clicked.

### advanced module - cannyParse
It's up to you how complicate you design your modules. Below an example which uses cannyParse to initialize custom module items. 

In the following example Canny will ignore the **advanced-mod** -attributes and will only instantiate the canny-mod="advanced". We delegate the instantiation for the **advanced-mod** -attributes to the *advanced* module.

```html
<div canny-mod="advanced">
	<div advanced-mod="item" advanced-var="item1"></div>	
	<div advanced-mod="item" advanced-var="item2"></div>
	<div advanced-mod="item" advanced-var="item3"></div>
</div>
```

As next we define the canny module advanced:

```javascript
canny.add('advanced', (function () {
	var mainNode,
		// this is the custom canny mod which needs a add method
		customMod : {
			// part of canny api
			add : function (node, attr) {
				console.log('item: ' + attr);
			}
		};	
	return {
		// pat of canny api
		add : function (node, attr) {
			mainNode = node;	
		},
		ready : function () {
			// trigger the cannyParse
			canny.cannyParse.apply(customMod,[mainNode, 'advanced', function () {console.log('canny parse module advance cpomplete');}])
		}
	}
}()));
```

The advanced module has the full control and can decide when the nodes with the **advanced-mod** -attributes are initialized. 
In the sample above we trigger the cannyParse in the ready method. We should see the following output in the console log:
```javascript
item: item1
item: item2
item: item3
``` 

## browserify
You can also use browserify to import modules from the [mod folder](https://github.com/eightyfour/canny/tree/master/mod). Modules which are
imported via require needs to be bind manually to the canny scope: 
```javascript
var canny = require('canny'),
    repeat = require('canny/mod/repeat');
canny.add('repeat', repeat);
```
With this approache it's also be possible to bind existing modules to a custom scope or give the module a different name (in case of name space conflicts).

## License

(The MIT License)

Copyright (c) 2014 eightyfour

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Release notes

**0.1.8**

 * flowControl 
 
   * has whisker support for re rendering view
   
 * repeat
 
   * supports *rp-bind* attribute
   * mark *if*, *if-not* and *on-click* attribute as deprecated

**0.1.10**

  * flowControl
    * fix issues that views as anchor are not shown because of 'this' is undefined (function is called out of context)
    
**0.1.12**

  * flowControl
    * add onShowInitialViewComplete - calls the given function after loading all initial views.
 
   