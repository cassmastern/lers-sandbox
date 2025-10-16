# Practical Code Examples

## SMART Client Implementation (JavaScript)

```javascript
// SMART-on-FHIR Client Implementation using fhirclient library
// Install: npm install fhirclient

import FHIR from 'fhirclient';

// ==========================================
// 1. INITIALIZATION AND AUTHORIZATION
// ==========================================

/**
 * Initialize SMART launch sequence
 * Call this from your launch.html page
 */
async function initializeLaunch() {
  try {
    await FHIR.oauth2.authorize({
      clientId: 'your-client-id',
      scope: 'launch/patient patient/*.read offline_access openid fhirUser',
      redirectUri: './index.html',
      // For standalone launch, specify iss (FHIR server URL)
      // iss: 'https://launch.smarthealthit.org/v/r4/fhir'
    });
  } catch (error) {
    console.error('Authorization failed:', error);
  }
}

/**
 * Initialize SMART client after redirect
 * Call this from your index.html page
 */
async function initializeClient() {
  try {
    const client = await FHIR.oauth2.ready();
    return client;
  } catch (error) {
    console.error('Client initialization failed:', error);
    throw error;
  }
}

// ==========================================
// 2. READING RESOURCES
// ==========================================

/**
 * Get current patient
 */
async function getCurrentPatient(client) {
  try {
    const patient = await client.patient.read();
    console.log('Patient:', patient);
    return patient;
  } catch (error) {
    console.error('Error reading patient:', error);
    throw error;
  }
}

/**
 * Search for observations
 */
async function getObservations(client, patientId, options = {}) {
  try {
    const query = {
      patient: patientId,
      _count: options.count || 10,
      _sort: options.sort || '-date',
      ...options.params
    };

    const observations = await client.request(
      `Observation?${new URLSearchParams(query)}`
    );
  
    return observations;
  } catch (error) {
    console.error('Error fetching observations:', error);
    throw error;
  }
}

/**
 * Get vital signs
 */
async function getVitalSigns(client, patientId) {
  try {
    const vitals = await client.request(
      `Observation?patient=${patientId}&category=vital-signs&_sort=-date&_count=20`
    );
    return vitals;
  } catch (error) {
    console.error('Error fetching vital signs:', error);
    throw error;
  }
}

/**
 * Get specific observation by ID
 */
async function getObservationById(client, id) {
  try {
    const observation = await client.request(`Observation/${id}`);
    return observation;
  } catch (error) {
    console.error('Error fetching observation:', error);
    throw error;
  }
}

/**
 * Get conditions
 */
async function getConditions(client, patientId, clinicalStatus = null) {
  try {
    let url = `Condition?patient=${patientId}`;
    if (clinicalStatus) {
      url += `&clinical-status=${clinicalStatus}`;
    }
  
    const conditions = await client.request(url);
    return conditions;
  } catch (error) {
    console.error('Error fetching conditions:', error);
    throw error;
  }
}

/**
 * Get medication requests
 */
async function getMedicationRequests(client, patientId, status = null) {
  try {
    let url = `MedicationRequest?patient=${patientId}&_sort=-authoredon`;
    if (status) {
      url += `&status=${status}`;
    }
  
    const medications = await client.request(url);
    return medications;
  } catch (error) {
    console.error('Error fetching medications:', error);
    throw error;
  }
}

/**
 * Get encounters
 */
async function getEncounters(client, patientId, dateRange = null) {
  try {
    let url = `Encounter?patient=${patientId}&_sort=-date`;
    if (dateRange) {
      url += `&date=ge${dateRange.start}&date=le${dateRange.end}`;
    }
  
    const encounters = await client.request(url);
    return encounters;
  } catch (error) {
    console.error('Error fetching encounters:', error);
    throw error;
  }
}

// ==========================================
// 3. CREATING RESOURCES
// ==========================================

/**
 * Create a new observation
 */
async function createObservation(client, observationData) {
  try {
    const response = await client.request({
      url: 'Observation',
      method: 'POST',
      body: JSON.stringify(observationData),
      headers: {
        'Content-Type': 'application/fhir+json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error creating observation:', error);
    throw error;
  }
}

/**
 * Example: Create blood pressure observation
 */
function createBloodPressureObservation(patientId, systolic, diastolic) {
  return {
    resourceType: 'Observation',
    status: 'final',
    category: [{
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/observation-category',
        code: 'vital-signs',
        display: 'Vital Signs'
      }]
    }],
    code: {
      coding: [{
        system: 'http://loinc.org',
        code: '85354-9',
        display: 'Blood pressure panel'
      }]
    },
    subject: {
      reference: `Patient/${patientId}`
    },
    effectiveDateTime: new Date().toISOString(),
    component: [
      {
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '8480-6',
            display: 'Systolic blood pressure'
          }]
        },
        valueQuantity: {
          value: systolic,
          unit: 'mmHg',
          system: 'http://unitsofmeasure.org',
          code: 'mm[Hg]'
        }
      },
      {
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '8462-4',
            display: 'Diastolic blood pressure'
          }]
        },
        valueQuantity: {
          value: diastolic,
          unit: 'mmHg',
          system: 'http://unitsofmeasure.org',
          code: 'mm[Hg]'
        }
      }
    ]
  };
}

// ==========================================
// 4. UPDATING RESOURCES
// ==========================================

/**
 * Update an existing resource
 */
async function updateResource(client, resourceType, id, resourceData) {
  try {
    const response = await client.request({
      url: `${resourceType}/${id}`,
      method: 'PUT',
      body: JSON.stringify(resourceData),
      headers: {
        'Content-Type': 'application/fhir+json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error updating resource:', error);
    throw error;
  }
}

// ==========================================
// 5. BATCH OPERATIONS
// ==========================================

/**
 * Execute batch request
 */
async function executeBatch(client, entries) {
  const bundle = {
    resourceType: 'Bundle',
    type: 'batch',
    entry: entries
  };

  try {
    const response = await client.request({
      url: '',
      method: 'POST',
      body: JSON.stringify(bundle),
      headers: {
        'Content-Type': 'application/fhir+json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error executing batch:', error);
    throw error;
  }
}

/**
 * Example: Batch read multiple resources
 */
function createBatchReadEntries(resourceRequests) {
  return resourceRequests.map(req => ({
    request: {
      method: 'GET',
      url: req
    }
  }));
}

// ==========================================
// 6. PAGINATION
// ==========================================

/**
 * Get all pages of a search result
 */
async function getAllPages(client, initialUrl) {
  const allResources = [];
  let nextUrl = initialUrl;

  while (nextUrl) {
    try {
      const bundle = await client.request(nextUrl);
  
      if (bundle.entry) {
        bundle.entry.forEach(entry => {
          if (entry.resource) {
            allResources.push(entry.resource);
          }
        });
      }

      // Find next link
      nextUrl = null;
      if (bundle.link) {
        const nextLink = bundle.link.find(link => link.relation === 'next');
        if (nextLink) {
          nextUrl = nextLink.url;
        }
      }
    } catch (error) {
      console.error('Error fetching page:', error);
      break;
    }
  }

  return allResources;
}

// ==========================================
// 7. UTILITY FUNCTIONS
// ==========================================

/**
 * Extract patient name
 */
function getPatientName(patient) {
  if (!patient.name || patient.name.length === 0) {
    return 'Unknown';
  }
  
  const name = patient.name[0];
  const given = name.given ? name.given.join(' ') : '';
  const family = name.family || '';
  
  return `${given} ${family}`.trim();
}

/**
 * Extract observation value
 */
function getObservationValue(observation) {
  if (observation.valueQuantity) {
    return `${observation.valueQuantity.value} ${observation.valueQuantity.unit}`;
  }
  if (observation.valueCodeableConcept) {
    return observation.valueCodeableConcept.coding?.[0]?.display ||
           observation.valueCodeableConcept.text;
  }
  if (observation.valueString) {
    return observation.valueString;
  }
  if (observation.component) {
    return observation.component.map(c => 
      `${c.code.coding[0].display}: ${c.valueQuantity.value} ${c.valueQuantity.unit}`
    ).join(', ');
  }
  return 'N/A';
}

/**
 * Format FHIR date
 */
function formatFhirDate(dateString) {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

// ==========================================
// 8. EXAMPLE USAGE
// ==========================================

async function main() {
  try {
    // Initialize client
    const client = await initializeClient();
  
    // Get current patient
    const patient = await getCurrentPatient(client);
    console.log('Patient Name:', getPatientName(patient));
  
    // Get vital signs
    const vitals = await getVitalSigns(client, patient.id);
    console.log('Vital Signs Count:', vitals.total);
  
    // Get active conditions
    const conditions = await getConditions(client, patient.id, 'active');
    console.log('Active Conditions:', conditions.total);
  
    // Get active medications
    const medications = await getMedicationRequests(client, patient.id, 'active');
    console.log('Active Medications:', medications.total);
  
  } catch (error) {
    console.error('Application error:', error);
  }
}

// Export functions
export {
  initializeLaunch,
  initializeClient,
  getCurrentPatient,
  getObservations,
  getVitalSigns,
  getConditions,
  getMedicationRequests,
  getEncounters,
  createObservation,
  createBloodPressureObservation,
  updateResource,
  executeBatch,
  getAllPages,
  getPatientName,
  getObservationValue,
  formatFhirDate
};
```