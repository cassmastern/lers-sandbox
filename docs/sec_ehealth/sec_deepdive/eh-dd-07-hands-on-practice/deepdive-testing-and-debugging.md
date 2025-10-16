# Testing and Debugging

## Public Sandboxes  

**SMART Health IT Sandbox**  
URL: https://launch.smarthealthit.org  
Features:  
- R4 FHIR server  
- Pre-populated test patients  
- OAuth 2.0 authorization  
- Launch simulator  
- No registration required for testing  
   
Test Patients:  
- smart-1288992 (Adult with various conditions)  
- smart-1032702 (Pediatric patient)  
- smart-1137192 (Elderly patient)  

**HAPI FHIR Server** 
URL: http://hapi.fhir.org/baseR4  
Features:  
- Public R4 server  
- No authentication  
- Full CRUD operations  
- Good for basic FHIR testing  

**SMART App Gallery**  
URL: https://gallery.smarthealthit.org  
Test your app with various EHR scenarios  


## Testing Tools  

### Postman / Insomnia  

- HTTP client for API testing  
- Create collections of FHIR requests  
- Manage OAuth tokens  
- Save test scenarios  

### cURL Examples   
   
#### Get patient 

```curl 
curl -H "Accept: application/fhir+json" \
   https://launch.smarthealthit.org/v/r4/fhir/Patient/smart-1288992
```

#### Search observations  

```curl
curl -H "Accept: application/fhir+json" \
   "https://launch.smarthealthit.org/v/r4/fhir/Observation?patient=smart-1288992&_count=5"
```

#### With authentication  

```curl
curl -H "Accept: application/fhir+json" \
   -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
   https://your-fhir-server/Patient/123
```

### FHIR Validator  

URL: https://validator.fhir.org  

- Validate FHIR resources  
- Check profile conformance  
- Test against specific IGs  

### Inferno Testing Tool  

URL: https://inferno.healthit.gov  
- Test FHIR API conformance  
- US Core validation  
- SMART App Launch testing  
- Bulk Data testing  

### Crucible  

URL: https://projectcrucible.org  
- FHIR conformance testing  
- Automated test suites  

## Debugging Techniques  

### 1. Check Server Metadata  

`GET /metadata`

Verify:  
- Supported resources  
- Available operations  
- OAuth endpoints  
- Supported search parameters  

### 2. Test OAuth Flow Step-by-Step  

Step 1: Get configuration  

`GET /.well-known/smart-configuration`

Step 2: Authorization request  

- Check redirect_uri matches registered value  
- Verify scope format  
- Include state parameter  

Step 3: Token exchange  

- Verify code is fresh (< 5 minutes)  
- Check client_id matches  
- Ensure redirect_uri is identical  

Step 4: Validate token  

- Check token expiration  
- Verify scope in response  
- Confirm patient context  

### 3. Common Error Patterns  

401 Unauthorized:  
- Missing Authorization header  
- Invalid or expired token  
- Token not found in request  

403 Forbidden:  
- Insufficient scope  
- Patient context mismatch  
- Resource not allowed for user  

404 Not Found:  
- Resource ID doesn't exist  
- Wrong FHIR server base URL  
- Resource deleted  

422 Unprocessable Entity:  
- Invalid resource content  
- Missing required elements  
- Data type mismatch  
- Business rule violation  

### 4. Logging and Monitoring  

Log these items:  
- All HTTP requests/responses  
- Token acquisition and refresh  
- Search parameters used  
- Error responses with details  
- Performance metrics  

Example logging format:  
[2024-10-15 10:30:00] GET /Patient/123  
Authorization: Bearer eyJ0eX...  
Response: 200 OK (234ms)  

### 5. Browser Developer Tools  

Network Tab:  
- Inspect all HTTP traffic  
- View request/response headers  
- Check timing information  
- Copy requests as cURL  

Console Tab:  
- JavaScript errors  
- SMART client library logs  
- Custom debug messages  

Application/Storage Tab:  
- Session storage (token info)  
- Cookies  
- IndexedDB (if used)  

### 6. FHIR Query Debugging  

Start simple:  
GET /Patient/123  

Add complexity gradually:  
GET /Patient?name=Smith  
GET /Patient?name=Smith&birthdate=1980-01-01  
GET /Patient?name=Smith&_include=Patient:organization  

Use _summary for quick checks:  
GET /Patient/123?_summary=true  

Check total counts:  
GET /Observation?patient=123&_summary=count  

### 7. Validate Resources Before Submission  

Use $validate operation:  
POST /Patient/$validate  
Content-Type: application/fhir+json  

Body: Your patient resource  

Response: OperationOutcome with validation results  

### 8. Test Data Scenarios  

Create test cases for:  
- Minimal valid resource  
- Complete resource with all optional elements  
- Invalid resources (missing required, wrong type)  
- Edge cases (empty arrays, null values)  
- Large datasets (pagination testing)  
- Concurrent requests  
- Rate limiting  

### 9. Performance Testing  

Monitor:  
- Response times for common queries  
- Bundle processing time  
- Token refresh latency  
- Search result pagination  
- Large resource retrieval  

Tools:  
- Apache JMeter  
- k6 load testing  
- Locust  

## Common Pitfalls and Solutions  

### 1. CORS Issues (Browser Apps)  
Problem: Cross-Origin Resource Sharing blocked  
Solution:  
- Server must include CORS headers  
- Use proxy in development  
- Check Access-Control-Allow-Origin header  

### 2. Token Expiration  
Problem: 401 errors after token expires  
Solution:  
- Implement automatic token refresh  
- Check expires_in from token response  
- Handle 401 by refreshing token  
- Store refresh_token securely  

### 3. Patient Context Loss  
Problem: Wrong patient data displayed  
Solution:  
- Always verify patient ID from token  
- Don't trust client-side patient ID  
- Validate patient context on each request  

### 4. Search Result Pagination  
Problem: Only getting first page of results  
Solution:  
- Check bundle.link for "next" relation  
- Implement pagination loop  
- Use _count to control page size  

### 5. Reference Resolution  
Problem: Can't access referenced resources  
Solution:  
- Use _include to fetch related resources  
- Make separate requests for references  
- Check reference format (relative vs absolute)  

### 6. Date/Time Formats  
Problem: Invalid date format errors  
Solution:  
- Use ISO 8601 format  
- FHIR date: YYYY-MM-DD  
- FHIR dateTime: YYYY-MM-DDThh:mm:ss+zz:zz  
- FHIR instant: YYYY-MM-DDThh:mm:ss.sss+zz:zz  

### 7. Code System Versions  
Problem: Code validation failures  
Solution:  
- Include system URL with codes  
- Specify version if needed  
- Use standard terminologies (LOINC, SNOMED)  

### 8. Missing Required Elements  
Problem: 422 Unprocessable Entity  
Solution:  
- Check resource profile requirements  
- Validate before submission  
- Review OperationOutcome details  

### 9. Scope Insufficient  
Problem: 403 Forbidden despite authorization  
Solution:  
- Request appropriate scopes during auth  
- Check granted scopes in token response  
- Verify scope format (patient/Resource.read)  

### 10. PKCE Verification Failure  
Problem: Token exchange fails with PKCE error  
Solution:  
- Store code_verifier in session  
- Send same verifier in token request  
- Use correct code_challenge_method (S256)  


## Testing Checklist  

Authentication & Authorization:  
□ App can discover SMART configuration  
□ Authorization request includes all required parameters  
□ Authorization redirects to correct URI  
□ Token exchange succeeds  
□ Access token is valid and not expired  
□ Refresh token works (if applicable)  
□ Appropriate scopes are granted  
□ Patient context is correct  

Resource Operations:  
□ Can read individual resources  
□ Search returns expected results  
□ Create operation succeeds  
□ Update operation succeeds  
□ Delete operation succeeds (if supported)  
□ Batch/transaction operations work  
□ Conditional operations work  

Data Quality:  
□ Required elements are present  
□ Data types are correct  
□ Code systems are valid  
□ References are valid  
□ Extensions are properly formatted  
□ Profile conformance is verified  

Error Handling:  
□ 401 errors trigger re-authentication  
□ 403 errors are handled gracefully  
□ 404 errors display appropriate message  
□ Network errors are caught  
□ Validation errors are displayed  
□ Timeout handling works  

Performance:  
□ Queries complete in reasonable time  
□ Pagination works correctly  
□ Token refresh doesn't block UI  
□ Large result sets are handled  
□ Concurrent requests work properly  

Security:  
□ HTTPS is enforced  
□ Tokens are stored securely  
□ PKCE is implemented (public clients)  
□ State parameter prevents CSRF  
□ Token expiration is respected  
□ Sensitive data is not logged  


## Sample Test Script (Python)  

```python
import requests
import json

BASE_URL = "https://launch.smarthealthit.org/v/r4/fhir"
PATIENT_ID = "smart-1288992"

def test_read_patient():
    """Test reading a patient resource"""
    url = f"{BASE_URL}/Patient/{PATIENT_ID}"
    headers = {"Accept": "application/fhir+json"}
    
    response = requests.get(url, headers=headers)
    assert response.status_code == 200
    
    patient = response.json()
    assert patient["resourceType"] == "Patient"
    assert patient["id"] == PATIENT_ID
    print("✓ Patient read successful")

def test_search_observations():
    """Test searching observations"""
    url = f"{BASE_URL}/Observation"
    params = {
        "patient": PATIENT_ID,
        "category": "vital-signs",
        "_count": 5,
        "_sort": "-date"
    }
    headers = {"Accept": "application/fhir+json"}
    
    response = requests.get(url, params=params, headers=headers)
    assert response.status_code == 200
    
    bundle = response.json()
    assert bundle["resourceType"] == "Bundle"
    assert bundle["type"] == "searchset"
    print(f"✓ Found {bundle.get('total', 0)} observations")

def test_search_with_include():
    """Test search with _include"""
    url = f"{BASE_URL}/Observation"
    params = {
        "patient": PATIENT_ID,
        "_count": 5,
        "_include": "Observation:patient"
    }
    headers = {"Accept": "application/fhir+json"}
    
    response = requests.get(url, params=params, headers=headers)
    assert response.status_code == 200
    
    bundle = response.json()
    # Should include both observations and patient
    resource_types = [e["resource"]["resourceType"] for e in bundle.get("entry", [])]
    assert "Observation" in resource_types
    assert "Patient" in resource_types
    print("✓ Include parameter working")

def test_invalid_resource():
    """Test that invalid resource ID returns 404"""
    url = f"{BASE_URL}/Patient/invalid-id-12345"
    headers = {"Accept": "application/fhir+json"}
    
    response = requests.get(url, headers=headers)
    assert response.status_code == 404
    print("✓ 404 handling correct")

def test_metadata():
    """Test capability statement retrieval"""
    url = f"{BASE_URL}/metadata"
    headers = {"Accept": "application/fhir+json"}
    
    response = requests.get(url, headers=headers)
    assert response.status_code == 200
    
    capability = response.json()
    assert capability["resourceType"] == "CapabilityStatement"
    assert capability["fhirVersion"] == "4.0.1"
    print("✓ Metadata retrieved successfully")

if __name__ == "__main__":
    test_read_patient()
    test_search_observations()
    test_search_with_include()
    test_invalid_resource()
    test_metadata()
    print("\n✓ All tests passed!")
```

## Debuggin OAuth Flow  

1. Authorization Request Debug:  
   console.log("Auth URL:", authUrl);  
   console.log("Client ID:", clientId);  
   console.log("Redirect URI:", redirectUri);  
   console.log("Scopes:", scopes);  
   console.log("State:", state);  

2. Token Response Debug:  
   console.log("Access Token:", response.access_token.substring(0, 20) + "...");  
   console.log("Token Type:", response.token_type);  
   console.log("Expires In:", response.expires_in);  
   console.log("Scope:", response.scope);  
   console.log("Patient:", response.patient);  

3. API Request Debug:  
   console.log("Request URL:", url);  
   console.log("Method:", method);  
   console.log("Headers:", headers);  
   console.log("Token Present:", !!headers.Authorization);  

4. Error Response Debug:  
   console.error("Status:", error.response.status);  
   console.error("Status Text:", error.response.statusText);  
   console.error("Response Body:", error.response.data);  
   
   ```python  
   if (error.response.data.resourceType === "OperationOutcome") {
     error.response.data.issue.forEach(issue => {
       console.error(`${issue.severity}: ${issue.diagnostics}`);
     });
   }
   ```
