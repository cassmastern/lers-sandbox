# Test title: Text, Headings, Diagrams

## Test Heading 2 (##)
Some llorem ipsum minetum

- bullet one
- bullet two

## Another Test Heading 2

```
graph LR
    Patient[Patient]
    Surgeon[Surgeon]
    Admin[Administrator]
    System[(BeautyBridge Platform)]
    PaymentGateway[Payment Gateway]
    TranslationAPI[Translation API]
    AccommodationAPI[Accommodation API]

    Patient -- "Search Surgeons (by specialization, language, etc.)" --> System
    Patient -- "View Surgeon Profiles (credentials, portfolio)" --> System
    Patient -- "Book Consultation (online/in-person)" --> System
    Patient -- "Make Payment (consultation/booking)" --> PaymentGateway
    Patient -- "Upload Medical Documents" --> System
    Patient -- "Manage Bookings/Appointments" --> System
    Patient -- "Track Recovery Progress" --> System
    Patient -- "Communicate with Surgeon (secure messaging, video)" --> System
    Patient -- "Book Accommodation" --> AccommodationAPI
    Patient -- "Use Translation Services" --> TranslationAPI
    Patient -- "Provide Feedback/Reviews" --> System

    Surgeon -- "Manage Profile (credentials, portfolio, availability)" --> System
    Surgeon -- "View Patient Records" --> System
    Surgeon -- "Manage Bookings/Appointments" --> System
    Surgeon -- "Communicate with Patients (secure messaging, video)" --> System
    Surgeon -- "Provide Post-Op Instructions" --> System
    Surgeon -- "Monitor Patient Recovery" --> System
    Surgeon -- "Collaborate with Other Surgeons" --> System
    Surgeon -- "Use Translation Services" --> TranslationAPI
    Surgeon -- "Access Analytics/Reports" --> System

    Admin -- "Manage Users (Surgeons, Patients)" --> System
    Admin -- "Verify Surgeon Credentials" --> System
    Admin -- "Manage Platform Content" --> System
    Admin -- "Generate Reports" --> System
    Admin -- "Handle Support Requests" --> System

    System -- "Integrate with Payment Gateway" --> PaymentGateway
    System -- "Integrate with Accommodation API" --> AccommodationAPI
    System -- "Integrate with Translation API" --> TranslationAPI
```
