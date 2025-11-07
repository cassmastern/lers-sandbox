# Handling Variation — Overview

We've covered FHIR's core building blocks: resources, data types, relationships, and REST operations. About time to explore the mechanisms that make FHIR adaptable to real-world healthcare requirements.

## Beyond the Basics

Base FHIR provides a foundation — 80% of what most systems need. But healthcare is diverse:

- **US hospitals** need race/ethnicity extensions for quality reporting
- **European systems** require GDPR-compliant consent tracking
- **Research networks** need custom phenotype definitions
- **Specialized clinics** track domain-specific measurements not in base FHIR

This section covers contructs that help FHIR handle these variations without breaking interoperability:

- **Profiles**: Constrain base resources for specific use cases (e.g., US Core Patient)
- **Extensions**: Add custom data elements not in base spec (e.g., mother's maiden name)

These mechanisms let organizations customize FHIR while maintaining compatibility with standard tools and other systems.

We'll cover:

- How profiles tighten cardinality and add requirements
- Understanding MustSupport flags and their implications
- Creating and using extensions for custom data
- Searching by profile and validating conformance
- Real-world examples from US Core and IPS

---

## When to Use Profiles and Extensions

**Use profiles when**:

- Implementing national/regional standards (US Core, AU Base, UK Core)
- Building specialty-specific implementations (oncology, cardiology)
- Enforcing organizational policies (all patients must have primary care provider)

**Use extensions when**:

- Tracking data not in base FHIR (patient's preferred pharmacy, custom identifiers)
- Supporting legacy system migrations (preserve all original data)
- Implementing emerging standards not yet in base spec (social determinants of health)

**Don't overuse**:

- If base FHIR already has the element, use it (don't create redundant extensions)
- If multiple organizations need the same data, propose it for base FHIR (contribute to standards)

---

## Next Steps

Let's take a close look at profiles and extensions.