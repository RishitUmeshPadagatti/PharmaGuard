import httpx
from typing import Dict, Any

ANALYZE_ENDPOINT = "http://localhost:8000/api/analyze"


def fetch_patient_analysis(patient_id: str) -> Dict[str, Any]:
    """
    Fetches the pharmacogenomic analysis for a given patient_id
    from the external backend API at /api/analyze.

    Returns the full JSON response dict, or raises on error.
    """
    payload = {"patient_id": patient_id}

    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(ANALYZE_ENDPOINT, json=payload)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        raise RuntimeError(
            f"External API returned error {e.response.status_code}: {e.response.text}"
        ) from e
    except httpx.RequestError as e:
        raise RuntimeError(
            f"Failed to reach external API at {ANALYZE_ENDPOINT}: {e}"
        ) from e
