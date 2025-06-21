# 📚 Code Documentation Guide

## 🎯 Overview

This guide outlines the code documentation standards and improvements implemented for the Matchpoint game show platform. Proper documentation ensures code maintainability, team collaboration, and professional development practices.

## ✅ Completed Documentation Improvements

### Backend Files
- **`backend/server.js`** - Main server file with comprehensive JSDoc comments
- **`backend/controllers/match.controller.js`** - Match controller with detailed function documentation
- **`backend/services/socketManager.js`** - Socket.IO manager with clear structure and examples

### Frontend Files
- **`frontend/src/components/MatchController.jsx`** - Main component with TypeScript-style JSDoc types
- **`frontend/src/services/socketClient.js`** - Socket client service with comprehensive documentation

## 📋 Documentation Standards

### 1. File Headers
Every file should start with a comprehensive header:

```javascript
/**
 * @fileoverview Brief description of the file's purpose
 * @author cc241070
 * @version 1.0.0
 * @description Detailed description of functionality
 */
```

### 2. Section Headers
Use clear section dividers for organization:

```javascript
// ============================================================================
// SECTION NAME
// ============================================================================
```

### 3. Function Documentation
All functions should have JSDoc comments:

```javascript
/**
 * Brief description of what the function does
 * 
 * @async (if applicable)
 * @param {Type} paramName - Description of parameter
 * @param {Type} paramName2 - Description of second parameter
 * @returns {Type} Description of return value
 * 
 * @example
 * // Example usage
 * const result = functionName(param1, param2);
 */
```

### 4. Variable Documentation
Document important variables and their types:

```javascript
/** @type {Type} Description of variable */
const variableName = value;

/**
 * Description of complex variable
 * @type {Object}
 * @property {string} property1 - Description
 * @property {number} property2 - Description
 */
```

### 5. Type Definitions
Use JSDoc typedef for complex types:

```javascript
/**
 * @typedef {Object} ComplexType
 * @property {string} name - Description
 * @property {number} value - Description
 * @property {Array} items - Description
 */
```

## 🔄 Remaining Files to Document

### High Priority
- [ ] `backend/models/match.model.js`
- [ ] `backend/models/user.model.js`
- [ ] `backend/models/game.model.js`
- [ ] `backend/services/database.js`
- [ ] `backend/services/authentication.js`
- [ ] `frontend/src/services/apiService.js`

### Medium Priority
- [ ] `backend/controllers/auth.controller.js`
- [ ] `backend/controllers/game.controller.js`
- [ ] `backend/controllers/users.controller.js`
- [ ] `frontend/src/components/HostLobby.jsx`
- [ ] `frontend/src/components/PlayerLobby.jsx`
- [ ] `frontend/src/components/GameView.jsx`
- [ ] `frontend/src/components/Scoreboard.jsx`

### Low Priority
- [ ] `backend/middlewares/*.js`
- [ ] `backend/routes/*.js`
- [ ] `frontend/src/components/*.jsx` (remaining components)
- [ ] Configuration files (`package.json`, `vite.config.js`, etc.)

## 🎨 Naming Conventions

### Variables and Functions
- Use **camelCase** for variables and functions
- Use **PascalCase** for components and classes
- Use **UPPER_SNAKE_CASE** for constants
- Use descriptive names that explain purpose

### Examples
```javascript
// ✅ Good
const userAuthenticationToken = getToken();
const MAX_RECONNECTION_ATTEMPTS = 5;
const handleSocketConnection = () => {};

// ❌ Bad
const token = getToken();
const max = 5;
const handle = () => {};
```

### File Names
- Use **kebab-case** for file names
- Be descriptive and consistent
- Group related files with prefixes

### Examples
```javascript
// ✅ Good
match-controller.js
socket-manager.js
user-authentication.js

// ❌ Bad
controller.js
manager.js
auth.js
```

## 📝 Comment Guidelines

### When to Comment
- **Complex logic** that isn't immediately obvious
- **Business rules** and domain-specific logic
- **API endpoints** and their expected behavior
- **Error handling** strategies
- **Performance considerations**
- **Security measures**

### When NOT to Comment
- **Obvious code** that's self-explanatory
- **Outdated information** (remove old comments)
- **Redundant comments** that just repeat the code

### Comment Style
```javascript
// ✅ Good - Explains WHY, not WHAT
// Retry connection up to 3 times with exponential backoff
// This prevents overwhelming the server during network issues
for (let attempt = 1; attempt <= 3; attempt++) {
    // ... retry logic
}

// ❌ Bad - Just repeats the code
// Loop 3 times
for (let attempt = 1; attempt <= 3; attempt++) {
    // ... retry logic
}
```

## 🔧 Tools and Extensions

### Recommended VS Code Extensions
- **JSDoc** - Syntax highlighting and validation
- **ESLint** - Code quality and style enforcement
- **Prettier** - Code formatting
- **TypeScript** - Better IntelliSense for JSDoc types

### ESLint Rules for Documentation
```json
{
  "rules": {
    "valid-jsdoc": "error",
    "require-jsdoc": ["error", {
      "require": {
        "FunctionDeclaration": true,
        "MethodDefinition": true,
        "ClassDeclaration": true
      }
    }]
  }
}
```

## 🚀 Best Practices

### 1. Keep Documentation Updated
- Update comments when code changes
- Remove outdated documentation
- Review documentation during code reviews

### 2. Use Examples
- Include usage examples in JSDoc comments
- Show common use cases and edge cases
- Provide copy-paste ready code snippets

### 3. Be Consistent
- Use the same documentation style across the project
- Follow established patterns
- Maintain consistent terminology

### 4. Focus on Value
- Document the "why" not just the "what"
- Explain business logic and domain concepts
- Highlight important implementation details

### 5. Review and Refactor
- Regularly review documentation quality
- Refactor documentation as code evolves
- Get feedback from team members

## 📊 Documentation Checklist

For each file, ensure:

- [ ] File header with @fileoverview, @author, @version, @description
- [ ] Section headers for organization
- [ ] JSDoc comments for all exported functions
- [ ] Type definitions for complex objects
- [ ] Examples for public APIs
- [ ] Clear variable and function names
- [ ] Consistent formatting and style
- [ ] No outdated or redundant comments
- [ ] Error handling documented
- [ ] Security considerations noted

## 🎯 Next Steps

1. **Complete high-priority files** using the established patterns
2. **Set up ESLint rules** for documentation enforcement
3. **Create documentation templates** for new files
4. **Establish review process** for documentation quality
5. **Consider TypeScript migration** for better type safety

## 📚 Resources

- [JSDoc Documentation](https://jsdoc.app/)
- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

*This guide should be updated as the project evolves and new patterns emerge.* 