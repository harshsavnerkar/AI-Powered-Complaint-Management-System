from agent.complaint_agent import run_complaint_agent

raw_text = """From: Hospital Pharmacy Quality Officer <pharmacy.intake@cityhospital.com>
Date: July 28, 2026
Subject: URGENT: Discolored Tablets and Patient Adverse Event - Batch B2024
To: quality.control@pharmaqms.com

Dear Quality Assurance Team,

We are writing to report a serious issue regarding Paracetamol 500mg tablets, Batch Number B2024.
Several tablets in this batch were found to be discolored with a yellowish tint and had a strong, chemical odor upon opening the bottle.
Manufacturing date was 23rd May 2025 and expiry date was 3rd june 2026.
Furthermore, one of our patients reported feeling severely nauseous and dizzy shortly after taking a dose from this batch.
"""

result = run_complaint_agent(complaint_text=raw_text)

print("=" * 50)
print("Mfg Date:", result.get('manufacturing_date'))
print("Exp Date:", result.get('expiry_date'))
print("=" * 50)