# FHIR Search Parameters

<<>>

**FHIR Search Examples**

```bash
# Base URL
BASE="https://launch.smarthealthit.org/v/r4/fhir"

# 1. Get a specific patient by ID
curl "$BASE/Patient/smart-1288992"

# 2. Search patients by name
curl "$BASE/Patient?name=Shaw"

# 3. Search patients by birthdate
curl "$BASE/Patient?birthdate=1987-02-20"

# 4. Get observations for a patient
curl "$BASE/Observation?patient=smart-1288992"

# 5. Get vital signs observations
curl "$BASE/Observation?patient=smart-1288992&category=vital-signs"

# 6. Get observations with specific code (blood pressure)
curl "$BASE/Observation?patient=smart-1288992&code=85354-9"

# 7. Get recent observations (sorted by date, descending)
curl "$BASE/Observation?patient=smart-1288992&_sort=-date&_count=10"

# 8. Get observations within date range
curl "$BASE/Observation?patient=smart-1288992&date=ge2020-01-01&date=le2023-12-31"

# 9. Get active conditions
curl "$BASE/Condition?patient=smart-1288992&clinical-status=active"

# 10. Get conditions by category
curl "$BASE/Condition?patient=smart-1288992&category=encounter-diagnosis"

# 11. Get active medication requests
curl "$BASE/MedicationRequest?patient=smart-1288992&status=active"

# 12. Get medications with intent=order
curl "$BASE/MedicationRequest?patient=smart-1288992&intent=order"

# 13. Get recent encounters
curl "$BASE/Encounter?patient=smart-1288992&_sort=-date&_count=5"

# 14. Get encounters by type
curl "$BASE/Encounter?patient=smart-1288992&type=http://snomed.info/sct|185349003"

# 15. Get procedures for patient
curl "$BASE/Procedure?patient=smart-1288992"

# 16. Get allergies
curl "$BASE/AllergyIntolerance?patient=smart-1288992"

# 17. Get immunizations
curl "$BASE/Immunization?patient=smart-1288992"

# 18. Get diagnostic reports
curl "$BASE/DiagnosticReport?patient=smart-1288992"

# 19. Search with multiple parameters (AND logic)
curl "$BASE/Observation?patient=smart-1288992&category=laboratory&date=ge2022-01-01"

# 20. Use _include to get referenced resources
curl "$BASE/Observation?patient=smart-1288992&_include=Observation:performer"

# 21. Use _revinclude to get referencing resources
curl "$BASE/Patient/smart-1288992?_revinclude=Observation:patient"

# 22. Get only specific fields with _elements
curl "$BASE/Patient/smart-1288992?_elements=name,birthDate,gender"

# 23. Use _summary for abbreviated results
curl "$BASE/Patient/smart-1288992?_summary=true"

# 24. Pagination with _count and _offset
curl "$BASE/Observation?patient=smart-1288992&_count=20&_offset=0"

# 25. Search by token (identifier)
curl "$BASE/Patient?identifier=http://hospital.smarthealthit.org|smart-1288992"

# Search Prefixes:
# eq - equals (default)
# ne - not equals
# gt - greater than
# lt - less than
# ge - greater or equal
# le - less or equal
# sa - starts after
# eb - ends before
# ap - approximately
```