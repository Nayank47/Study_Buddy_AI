# Technical Notes: HTTP APIs

HTTP is a request-response protocol used by clients and servers to exchange resources over the web. A client sends a request with a method, path, headers, and sometimes a body. The server returns a response with a status code, headers, and sometimes a body.

GET requests are normally used to retrieve data and should not change server state. POST requests are commonly used to create resources or trigger operations that change state. PUT requests usually replace an existing resource, while PATCH requests usually update part of a resource.

Status codes summarize the result of a request. Codes in the 200 range indicate success, codes in the 300 range indicate redirection, codes in the 400 range indicate client errors, and codes in the 500 range indicate server errors.

Authentication proves who the requester is, while authorization decides what the requester is allowed to do. API keys are simple credentials, but they should be treated like passwords and stored outside source code. OAuth is often used when an app needs delegated access to a user's resources.

RESTful APIs organize actions around resources and use standard HTTP methods. Good resource names are nouns, such as `/users` or `/orders`, rather than verbs. Consistent naming helps developers predict how the API behaves.

Pagination prevents large list endpoints from returning too much data at once. Offset pagination uses page numbers or offsets, while cursor pagination uses a stable marker from the previous response. Cursor pagination is often better for frequently changing datasets.

Idempotency means repeating the same request has the same effect as making it once. GET and PUT should be idempotent, while POST is not always idempotent. Idempotency keys help clients safely retry create operations after network failures.

Rate limiting protects an API from overload and abuse. A server may return HTTP 429 when a client sends too many requests. Good APIs include headers that tell clients how many requests remain and when the limit resets.

Validation checks incoming data before the application uses it. Server-side validation is required even if the frontend already validates input. Clear validation errors help clients fix bad requests quickly.

Versioning lets APIs change without breaking existing clients. Some APIs put the version in the path, such as `/v1/orders`, while others use headers. Breaking changes should be introduced in a new version.
