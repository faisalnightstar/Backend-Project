# Concept I learned

<h4> IIFEs function </h4>

- IIFEs (Immediately Invoked Function Expressions) are JavaScript functions that run as soon as they are defined. They are also known as Self-Executing Anonymous Functions.

## Syntax

```javascript
(function () {
    // code here
})();
```

## Examples

```javascript
// Regular function
function greet() {
    console.log("Hello!");
}
greet(); // Requires separate call

// IIFE
(function () {
    console.log("Hello!");
})(); // Runs immediately

// IIFE with parameters
(function (name) {
    console.log(`Hello, ${name}!`);
})("John"); // Outputs: Hello, John!
```

Key Points of IIFEs

- IIFEs run immediately after they're created
- They help create a private scope to avoid polluting the global namespace
- Commonly used for module patterns and encapsulation

Use Cases

1. Module pattern implementation
2. Avoiding variable name conflicts
3. Creating private scope
4. One-time initialization code
