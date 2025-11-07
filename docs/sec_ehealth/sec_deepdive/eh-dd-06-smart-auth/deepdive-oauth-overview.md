# Overview

## Securing Healthcare Data Access

We saw how FHIR structures and exchanges healthcare data. Now we'll explore how apps obtain secure, authorized access to that data—the "SMART" in SMART-on-FHIR.

Authorization in healthcare is complex. Unlike public APIs where anyone can sign up for an API key, healthcare data requires:

- **User authentication**: Proving who you are (clinician, patient, administrator)
- **App authorization**: Granting specific permissions to third-party apps
- **Context awareness**: Knowing which patient record you're viewing
- **Audit trails**: Recording who accessed what, when, and why
- **Consent management**: Respecting patient privacy preferences

SMART App Launch solves these challenges by building on OAuth 2.0—a proven authorization framework used by Google, Facebook, and countless other platforms—but with healthcare-specific extensions.

---

## The Authorization Challenge

**Without SMART**, app integration requires:

- Custom API keys for each EHR vendor
- Storing user passwords in the app (security nightmare)
- Manual patient selection (breaks clinical workflow)
- All-or-nothing permissions (can't grant read-only access)

**With SMART**, you get:

- ✅ Standard OAuth 2.0 flow (proven, well-understood)
- ✅ No password sharing (tokens are scoped and revocable)
- ✅ Automatic context (app knows which patient you're viewing)
- ✅ Granular permissions (request only what you need)
- ✅ Works across vendors (write once, deploy everywhere)

---

## Two Launch Patterns

### EHR Launch (Provider Context)

**Scenario**: Clinician clicks your app button while viewing a patient chart.

**What happens**: EHR initiates launch with patient context already established. Your app automatically knows which patient to display.

**Use cases**: Clinical decision support, order entry, chart review tools.

### Standalone Launch (Patient Access)

**Scenario**: Patient opens your app on their phone outside any EHR.

**What happens**: Patient authenticates and explicitly selects which data to share.

**Use cases**: Patient portals, fitness trackers, personal health records.

---

## Next Steps

Let's start with the OAuth 2.0 foundation that makes all of this possible.