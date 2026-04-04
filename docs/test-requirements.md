# JavaScript Code Test

## Overview

`BookSearchApiClient` is a simple class that makes an HTTP API call to retrieve a list of books and return them.

---

## Task

You need to refactor the `BookSearchApiClient` class and demonstrate in `example-client.js` how it would be used.

Refactor it into what you consider production-ready code. You may change it in any way you like and can use either **JavaScript or TypeScript**.

---

## Goals

Your refactored solution should focus on maintainability, extensibility, and testability.

---

## Key Discussion Areas

You will be asked to explain the following:

### 1. Supporting Multiple Book APIs

- How would you easily add other book seller APIs in the future?
- How would your architecture support multiple providers?

---

### 2. Normalising API Responses

- Different APIs return different response payloads.
- How would you handle response differences without requiring changes to `example-client.js` in the future?

---

### 3. Query Flexibility

- How would you implement different query types such as:
  - By publisher
  - By year published
  - By author
- How would this scale as more query types are added?

---

### 4. Testing Strategy

- How would your code be tested?
- What would you unit test vs integration test?
- How would you mock external HTTP APIs?

---

## Deliverable

- Refactored `BookSearchApiClient`
- Updated `example-client.js` demonstrating usage
- Clean architecture or modular structure preferred
- Explanation of design decisions (optional but recommended)