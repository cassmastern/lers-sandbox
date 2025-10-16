# SMART Client Implementation (Python)

## Python Example

```python
"""
SMART-on-FHIR Client Implementation in Python
Install dependencies: pip install fhirclient
"""

from fhirclient import client
from fhirclient.models import (
    patient, observation, condition, medicationrequest,
    encounter, procedure, allergyintolerance, immunization,
    diagnosticreport, careplan
)
import datetime
import json


class SmartFhirClient:
    """Wrapper for SMART-on-FHIR operations"""
    
    def __init__(self, settings):
        """
        Initialize SMART client
        
        Args:
            settings (dict): Configuration dictionary with:
                - app_id: Client ID
                - api_base: FHIR server base URL
                - redirect_uri: OAuth redirect URI (optional)
        """
        self.settings = {
            'app_id': settings.get('app_id', 'my_app'),
            'api_base': settings.get('api_base'),
            'redirect_uri': settings.get('redirect_uri', 'http://localhost:8000')
        }
        self.smart = client.FHIRClient(settings=self.settings)
        
    # ==========================================
    # PATIENT OPERATIONS
    # ==========================================
    
    def get_patient(self, patient_id):
        """Get patient by ID"""
        try:
            pat = patient.Patient.read(patient_id, self.smart.server)
            return pat
        except Exception as e:
            print(f"Error reading patient: {e}")
            return None
    
    def search_patients(self, **kwargs):
        """
        Search for patients
        
        Args:
            **kwargs: Search parameters (name, birthdate, identifier, etc.)
        
        Returns:
            list: List of Patient resources
        """
        try:
            search = patient.Patient.where(struct=kwargs)
            patients = search.perform_resources(self.smart.server)
            return patients
        except Exception as e:
            print(f"Error searching patients: {e}")
            return []
    
    def get_patient_name(self, pat):
        """Extract formatted name from patient"""
        if not pat.name:
            return "Unknown"
        
        name = pat.name[0]
        given = ' '.join(name.given) if name.given else ''
        family = name.family or ''
        return f"{given} {family}".strip()
    
    # ==========================================
    # OBSERVATION OPERATIONS
    # ==========================================
    
    def get_observations(self, patient_id, category=None, code=None, 
                        date_range=None, count=10):
        """
        Get observations for a patient
        
        Args:
            patient_id (str): Patient ID
            category (str): Observation category (e.g., 'vital-signs', 'laboratory')
            code (str): LOINC code
            date_range (tuple): (start_date, end_date) as datetime objects
            count (int): Maximum number of results
        
        Returns:
            list: List of Observation resources
        """
        try:
            search_params = {
                'patient': patient_id,
                '_count': count,
                '_sort': '-date'
            }
            
            if category:
                search_params['category'] = category
            
            if code:
                search_params['code'] = code
            
            if date_range:
                start, end = date_range
                search_params['date'] = f"ge{start.isoformat()}"
                if end:
                    search_params['date'] = f"{search_params['date']},le{end.isoformat()}"
            
            search = observation.Observation.where(struct=search_params)
            observations = search.perform_resources(self.smart.server)
            return observations
        except Exception as e:
            print(f"Error fetching observations: {e}")
            return []
    
    def get_vital_signs(self, patient_id, count=20):
        """Get vital signs for a patient"""
        return self.get_observations(
            patient_id, 
            category='vital-signs',
            count=count
        )
    
    def get_lab_results(self, patient_id, count=20):
        """Get laboratory results for a patient"""
        return self.get_observations(
            patient_id,
            category='laboratory',
            count=count
        )
    
    def get_observation_value(self, obs):
        """Extract value from observation"""
        if obs.valueQuantity:
            return f"{obs.valueQuantity.value} {obs.valueQuantity.unit}"
        elif obs.valueCodeableConcept:
            if obs.valueCodeableConcept.coding:
                return obs.valueCodeableConcept.coding[0].display
            return obs.valueCodeableConcept.text
        elif obs.valueString:
            return obs.valueString
        elif obs.component:
            components = []
            for comp in obs.component:
                code_display = comp.code.coding[0].display if comp.code.coding else "Unknown"
                value = f"{comp.valueQuantity.value} {comp.valueQuantity.unit}"
                components.append(f"{code_display}: {value}")
            return ", ".join(components)
        return "N/A"
    
    def create_observation(self, obs_data):
        """
        Create a new observation
        
        Args:
            obs_data (dict): Observation data as dictionary
        
        Returns:
            Observation: Created observation resource
        """
        try:
            obs = observation.Observation(obs_data)
            obs.create(self.smart.server)
            return obs
        except Exception as e:
            print(f"Error creating observation: {e}")
            return None
    
    # ==========================================
    # CONDITION OPERATIONS
    # ==========================================
    
    def get_conditions(self, patient_id, clinical_status=None, category=None):
        """
        Get conditions for a patient
        
        Args:
            patient_id (str): Patient ID
            clinical_status (str): Clinical status filter (active, inactive, resolved)
            category (str): Category filter
        
        Returns:
            list: List of Condition resources
        """
        try:
            search_params = {'patient': patient_id}
            
            if clinical_status:
                search_params['clinical-status'] = clinical_status
            
            if category:
                search_params['category'] = category
            
            search = condition.Condition.where(struct=search_params)
            conditions = search.perform_resources(self.smart.server)
            return conditions
        except Exception as e:
            print(f"Error fetching conditions: {e}")
            return []
    
    def get_active_conditions(self, patient_id):
        """Get active conditions for a patient"""
        return self.get_conditions(patient_id, clinical_status='active')
    
    # ==========================================
    # MEDICATION OPERATIONS
    # ==========================================
    
    def get_medications(self, patient_id, status=None):
        """
        Get medication requests for a patient
        
        Args:
            patient_id (str): Patient ID
            status (str): Status filter (active, completed, stopped)
        
        Returns:
            list: List of MedicationRequest resources
        """
        try:
            search_params = {
                'patient': patient_id,
                '_sort': '-authoredon'
            }
            
            if status:
                search_params['status'] = status
            
            search = medicationrequest.MedicationRequest.where(struct=search_params)
            medications = search.perform_resources(self.smart.server)
            return medications
        except Exception as e:
            print(f"Error fetching medications: {e}")
            return []
    
    def get_active_medications(self, patient_id):
        """Get active medications for a patient"""
        return self.get_medications(patient_id, status='active')
    
    def get_medication_name(self, med_request):
        """Extract medication name from MedicationRequest"""
        if med_request.medicationCodeableConcept:
            if med_request.medicationCodeableConcept.coding:
                return med_request.medicationCodeableConcept.coding[0].display
            return med_request.medicationCodeableConcept.text
        return "Unknown medication"
    
    # ==========================================
    # ENCOUNTER OPERATIONS
    # ==========================================
    
    def get_encounters(self, patient_id, status=None, date_range=None):
        """
        Get encounters for a patient
        
        Args:
            patient_id (str): Patient ID
            status (str): Encounter status
            date_range (tuple): (start_date, end_date)
        
        Returns:
            list: List of Encounter resources
        """
        try:
            search_params = {
                'patient': patient_id,
                '_sort': '-date'
            }
            
            if status:
                search_params['status'] = status
            
            if date_range:
                start, end = date_range
                search_params['date'] = f"ge{start.isoformat()}"
                if end:
                    search_params['date'] = f"{search_params['date']},le{end.isoformat()}"
            
            search = encounter.Encounter.where(struct=search_params)
            encounters = search.perform_resources(self.smart.server)
            return encounters
        except Exception as e:
            print(f"Error fetching encounters: {e}")
            return []
    
    # ==========================================
    # PROCEDURE OPERATIONS
    # ==========================================
    
    def get_procedures(self, patient_id, date_range=None):
        """Get procedures for a patient"""
        try:
            search_params = {'patient': patient_id}
            
            if date_range:
                start, end = date_range
                search_params['date'] = f"ge{start.isoformat()}"
                if end:
                    search_params['date'] = f"{search_params['date']},le{end.isoformat()}"
            
            search = procedure.Procedure.where(struct=search_params)
            procedures = search.perform_resources(self.smart.server)
            return procedures
        except Exception as e:
            print(f"Error fetching procedures: {e}")
            return []
    
    # ==========================================
    # ALLERGY OPERATIONS
    # ==========================================
    
    def get_allergies(self, patient_id, clinical_status=None):
        """Get allergies for a patient"""
        try:
            search_params = {'patient': patient_id}
            
            if clinical_status:
                search_params['clinical-status'] = clinical_status
            
            search = allergyintolerance.AllergyIntolerance.where(struct=search_params)
            allergies = search.perform_resources(self.smart.server)
            return allergies
        except Exception as e:
            print(f"Error fetching allergies: {e}")
            return []
    
    # ==========================================
    # IMMUNIZATION OPERATIONS
    # ==========================================
    
    def get_immunizations(self, patient_id):
        """Get immunizations for a patient"""
        try:
            search_params = {'patient': patient_id}
            search = immunization.Immunization.where(struct=search_params)
            immunizations = search.perform_resources(self.smart.server)
            return immunizations
        except Exception as e:
            print(f"Error fetching immunizations: {e}")
            return []
    
    # ==========================================
    # DIAGNOSTIC REPORT OPERATIONS
    # ==========================================
    
    def get_diagnostic_reports(self, patient_id, category=None):
        """Get diagnostic reports for a patient"""
        try:
            search_params = {'patient': patient_id}
            
            if category:
                search_params['category'] = category
            
            search = diagnosticreport.DiagnosticReport.where(struct=search_params)
            reports = search.perform_resources(self.smart.server)
            return reports
        except Exception as e:
            print(f"Error fetching diagnostic reports: {e}")
            return []
    
    # ==========================================
    # CARE PLAN OPERATIONS
    # ==========================================
    
    def get_care_plans(self, patient_id, status=None):
        """Get care plans for a patient"""
        try:
            search_params = {'patient': patient_id}
            
            if status:
                search_params['status'] = status
            
            search = careplan.CarePlan.where(struct=search_params)
            plans = search.perform_resources(self.smart.server)
            return plans
        except Exception as e:
            print(f"Error fetching care plans: {e}")
            return []
    
    # ==========================================
    # UTILITY FUNCTIONS
    # ==========================================
    
    def format_date(self, fhir_date):
        """Format FHIR date/datetime for display"""
        if not fhir_date:
            return "Unknown"
        
        if isinstance(fhir_date, str):
            try:
                dt = datetime.datetime.fromisoformat(fhir_date.replace('Z', '+00:00'))
                return dt.strftime('%Y-%m-%d')
            except:
                return fhir_date
        return str(fhir_date)
    
    def get_code_display(self, codeable_concept):
        """Extract display text from CodeableConcept"""
        if not codeable_concept:
            return "Unknown"
        
        if codeable_concept.coding and len(codeable_concept.coding) > 0:
            return codeable_concept.coding[0].display or codeable_concept.coding[0].code
        
        return codeable_concept.text or "Unknown"


# ==========================================
# EXAMPLE USAGE
# ==========================================

def main():
    """Example usage of SMART FHIR client"""
    
    # Configure client for SMART Health IT sandbox
    settings = {
        'app_id': 'my_app',
        'api_base': 'https://launch.smarthealthit.org/v/r4/fhir'
    }
    
    # Initialize client
    smart_client = SmartFhirClient(settings)
    
    # Example patient ID from sandbox
    patient_id = 'smart-1288992'
    
    # Get patient demographics
    print("=" * 50)
    print("PATIENT INFORMATION")
    print("=" * 50)
    pat = smart_client.get_patient(patient_id)
    if pat:
        print(f"Name: {smart_client.get_patient_name(pat)}")
        print(f"Gender: {pat.gender}")
        print(f"Birth Date: {pat.birthDate.isostring if pat.birthDate else 'Unknown'}")
        print(f"ID: {pat.id}")
    
    # Get vital signs
    print("\n" + "=" * 50)
    print("VITAL SIGNS")
    print("=" * 50)
    vitals = smart_client.get_vital_signs(patient_id, count=5)
    for obs in vitals:
        code_display = smart_client.get_code_display(obs.code)
        value = smart_client.get_observation_value(obs)
        date = smart_client.format_date(obs.effectiveDateTime.isostring if obs.effectiveDateTime else None)
        print(f"{code_display}: {value} ({date})")
    
    # Get active conditions
    print("\n" + "=" * 50)
    print("ACTIVE CONDITIONS")
    print("=" * 50)
    conditions = smart_client.get_active_conditions(patient_id)
    for cond in conditions:
        code_display = smart_client.get_code_display(cond.code)
        onset = smart_client.format_date(cond.onsetDateTime.isostring if hasattr(cond, 'onsetDateTime') and cond.onsetDateTime else None)
        print(f"{code_display} (Onset: {onset})")
    
    # Get active medications
    print("\n" + "=" * 50)
    print("ACTIVE MEDICATIONS")
    print("=" * 50)
    medications = smart_client.get_active_medications(patient_id)
    for med in medications:
        med_name = smart_client.get_medication_name(med)
        status = med.status
        print(f"{med_name} (Status: {status})")
        if med.dosageInstruction and len(med.dosageInstruction) > 0:
            dosage = med.dosageInstruction[0]
            if dosage.text:
                print(f"  Dosage: {dosage.text}")
    
    # Get recent encounters
    print("\n" + "=" * 50)
    print("RECENT ENCOUNTERS")
    print("=" * 50)
    encounters = smart_client.get_encounters(patient_id)
    for enc in encounters[:5]:  # Limit to 5
        enc_type = smart_client.get_code_display(enc.type[0]) if enc.type and len(enc.type) > 0 else "Unknown"
        status = enc.status
        period_start = smart_client.format_date(enc.period.start.isostring if enc.period and enc.period.start else None)
        print(f"{enc_type} - {status} ({period_start})")
    
    # Get allergies
    print("\n" + "=" * 50)
    print("ALLERGIES")
    print("=" * 50)
    allergies = smart_client.get_allergies(patient_id)
    for allergy in allergies:
        allergen = smart_client.get_code_display(allergy.code)
        clinical_status = allergy.clinicalStatus.coding[0].code if allergy.clinicalStatus and allergy.clinicalStatus.coding else "Unknown"
        print(f"{allergen} (Status: {clinical_status})")
    
    # Get immunizations
    print("\n" + "=" * 50)
    print("IMMUNIZATIONS")
    print("=" * 50)
    immunizations = smart_client.get_immunizations(patient_id)
    for imm in immunizations:
        vaccine = smart_client.get_code_display(imm.vaccineCode)
        date = smart_client.format_date(imm.occurrenceDateTime.isostring if hasattr(imm, 'occurrenceDateTime') and imm.occurrenceDateTime else None)
        print(f"{vaccine} ({date})")


# ==========================================
# EXAMPLE: CREATING AN OBSERVATION
# ==========================================

def create_blood_pressure_example(smart_client, patient_id):
    """Example: Create a blood pressure observation"""
    
    obs_data = {
        'resourceType': 'Observation',
        'status': 'final',
        'category': [{
            'coding': [{
                'system': 'http://terminology.hl7.org/CodeSystem/observation-category',
                'code': 'vital-signs',
                'display': 'Vital Signs'
            }]
        }],
        'code': {
            'coding': [{
                'system': 'http://loinc.org',
                'code': '85354-9',
                'display': 'Blood pressure panel'
            }],
            'text': 'Blood pressure'
        },
        'subject': {
            'reference': f'Patient/{patient_id}'
        },
        'effectiveDateTime': datetime.datetime.now().isoformat(),
        'component': [
            {
                'code': {
                    'coding': [{
                        'system': 'http://loinc.org',
                        'code': '8480-6',
                        'display': 'Systolic blood pressure'
                    }]
                },
                'valueQuantity': {
                    'value': 120,
                    'unit': 'mmHg',
                    'system': 'http://unitsofmeasure.org',
                    'code': 'mm[Hg]'
                }
            },
            {
                'code': {
                    'coding': [{
                        'system': 'http://loinc.org',
                        'code': '8462-4',
                        'display': 'Diastolic blood pressure'
                    }]
                },
                'valueQuantity': {
                    'value': 80,
                    'unit': 'mmHg',
                    'system': 'http://unitsofmeasure.org',
                    'code': 'mm[Hg]'
                }
            }
        ]
    }
    
    new_obs = smart_client.create_observation(obs_data)
    if new_obs:
        print(f"Created observation with ID: {new_obs.id}")
    return new_obs


if __name__ == '__main__':
    main()
```