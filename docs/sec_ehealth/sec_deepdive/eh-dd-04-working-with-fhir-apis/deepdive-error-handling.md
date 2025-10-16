# Error Handling and OperationOutcome

## OperationOutcome Example

```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "invalid",
      "details": {
        "text": "The resource does not conform to the profile"
      },
      "diagnostics": "Patient.birthDate: minimum required = 1, but only found 0",
      "location": [
        "Patient.birthDate"
      ],
      "expression": [
        "Patient.birthDate"
      ]
    },
    {
      "severity": "warning",
      "code": "business-rule",
      "details": {
        "text": "Patient age indicates pediatric patient but no guardian contact provided"
      },
      "diagnostics": "Consider adding guardian information for minors"
    }
  ]
}

// Severity Codes:
// - fatal: System is not available
// - error: Operation failed
// - warning: Operation succeeded but issues noted
// - information: Additional information

// Issue Type Codes (partial list):
// - invalid: Content invalid against specification
// - structure: Structural issue
// - required: Required element missing
// - value: Element value invalid
// - invariant: Constraint rule violation
// - security: Security problem
// - login: Authentication needed
// - unknown: Unknown error
// - expired: Expired content
// - forbidden: Forbidden operation
// - suppressed: Content suppressed
// - processing: Processing failure
// - not-supported: Operation not supported
// - duplicate: Duplicate resource
// - not-found: Resource not found
// - too-long: Content too long
// - code-invalid: Invalid code
// - extension: Extension issue
// - too-costly: Operation too expensive
// - business-rule: Business rule violation
// - conflict: Version conflict
// - incomplete: Incomplete resource
// - transient: Transient processing error
// - lock-error: Lock error
// - no-store: No storage available
// - exception: Unhandled exception
// - timeout: Timeout
// - throttled: Rate limited
// - informational: Information only
```

