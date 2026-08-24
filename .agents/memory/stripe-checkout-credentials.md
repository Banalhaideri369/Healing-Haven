---
name: Stripe Checkout credential checks
description: Validating a configured Stripe secret before relying on the booking checkout flow.
---

Treat the presence of a Stripe secret as unverified until the API creates a Checkout session. A server can start normally while Stripe rejects a malformed secret, including values with embedded control characters from copy/paste.

**Why:** The booking endpoint only exposed the credential problem at the first Stripe request, while every local API and frontend workflow otherwise ran normally.

**How to apply:** After a Stripe secret is added or changed, restart the API and create a non-paid Checkout session against a real catalog item. Ask for the raw secret key only—without an environment-variable assignment, quotes, or formatting—if Stripe rejects the request.