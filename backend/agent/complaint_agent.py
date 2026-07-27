from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from typing import TypedDict, Optional
from dotenv import load_dotenv
import os

load_dotenv()

# ── LLM Setup ──
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.3
)

# ── State: what data flows through the agent ──
class ComplaintState(TypedDict):
    complaint_text  : str
    product_name    : str
    batch_number    : str
    customer_name   : str
    risk_level      : Optional[str]
    category        : Optional[str]
    ai_summary      : Optional[str]
    capa            : Optional[str]
    is_complete     : Optional[bool]
    missing_fields  : Optional[str]
    duplicate_flag  : Optional[bool]
    product_strength: Optional[str]
    quantity_affected: Optional[str]
    complaint_date  : Optional[str]
    complaint_source: Optional[str]
    priority        : Optional[str]
    manufacturing_date: Optional[str]
    expiry_date     : Optional[str]

# ──────────────────────────────────────────
# NODE 0 — Entity Extractor
# ──────────────────────────────────────────
def extract_entities(state: ComplaintState) -> ComplaintState:
    prompt = f"""
You are an expert pharmaceutical Quality Management System (QMS) assistant.
Analyze the raw customer complaint text and extract the following details if present. If a detail is not mentioned in the text, write "None".

Raw Complaint Text:
{state['complaint_text']}

Extract:
PRODUCT_NAME: (The name of the medicine, active drug substance, or product, e.g., Paracetamol 500mg, Amoxicillin 250mg)
BATCH_NUMBER: (The batch, lot, control, or serial number, e.g., B2024, AMX779)
CUSTOMER_NAME: (The name of the customer, reporter, pharmacy, hospital, distributor, or clinic, e.g., Dr. Ramesh Sharma, Apex Distributors)
PRODUCT_STRENGTH: (The strength, dosage, or grade of the product, e.g., 500mg, 250mg)
QUANTITY_AFFECTED: (The quantity affected, e.g., 150 bottles, 1 carton, 10 tablets)
COMPLAINT_DATE: (The date the complaint was sent/logged in YYYY-MM-DD format if mentioned, e.g., 2026-07-28)
COMPLAINT_SOURCE: (The source medium of the complaint, e.g. Email, Phone call, Letter, Portal. Look at headers like "From:" to detect if it is an Email)
PRIORITY: (Determine the priority based on the complaint severity/issues. Choose one of: High, Medium, Low)
MANUFACTURING_DATE: (The manufacturing date of the batch in YYYY-MM-DD format if mentioned, e.g., 2025-05-23)
EXPIRY_DATE: (The expiration date of the batch in YYYY-MM-DD format if mentioned, e.g., 2026-06-03)

Output only the extracted values in this exact format:
PRODUCT_NAME: <value>
BATCH_NUMBER: <value>
CUSTOMER_NAME: <value>
PRODUCT_STRENGTH: <value>
QUANTITY_AFFECTED: <value>
COMPLAINT_DATE: <value>
COMPLAINT_SOURCE: <value>
PRIORITY: <value>
MANUFACTURING_DATE: <value>
EXPIRY_DATE: <value>
"""
    response = llm.invoke(prompt)
    text = response.content
    
    prod_name = state.get('product_name', '')
    batch_num = state.get('batch_number', '')
    cust_name = state.get('customer_name', '')
    prod_strength = state.get('product_strength', '')
    qty_affected = state.get('quantity_affected', '')
    comp_date = state.get('complaint_date', '')
    comp_source = state.get('complaint_source', '')
    priority = state.get('priority', '')
    mfg_date = state.get('manufacturing_date', '')
    exp_date = state.get('expiry_date', '')

    def clean_val(v: str) -> str:
        return v.strip().replace("*", "").replace('"', '').strip()
    
    if not prod_name and "PRODUCT_NAME:" in text:
        val = clean_val(text.split("PRODUCT_NAME:")[1].split("\n")[0])
        if val.lower() != "none" and val != "":
            prod_name = val
    if not batch_num and "BATCH_NUMBER:" in text:
        val = clean_val(text.split("BATCH_NUMBER:")[1].split("\n")[0])
        if val.lower() != "none" and val != "":
            batch_num = val
    if not cust_name and "CUSTOMER_NAME:" in text:
        val = clean_val(text.split("CUSTOMER_NAME:")[1].split("\n")[0])
        if val.lower() != "none" and val != "":
            cust_name = val
    if not prod_strength and "PRODUCT_STRENGTH:" in text:
        val = clean_val(text.split("PRODUCT_STRENGTH:")[1].split("\n")[0])
        if val.lower() != "none" and val != "":
            prod_strength = val
    if not qty_affected and "QUANTITY_AFFECTED:" in text:
        val = clean_val(text.split("QUANTITY_AFFECTED:")[1].split("\n")[0])
        if val.lower() != "none" and val != "":
            qty_affected = val
    if not comp_date and "COMPLAINT_DATE:" in text:
        val = clean_val(text.split("COMPLAINT_DATE:")[1].split("\n")[0])
        if val.lower() != "none" and val != "":
            comp_date = val
    if not comp_source and "COMPLAINT_SOURCE:" in text:
        val = clean_val(text.split("COMPLAINT_SOURCE:")[1].split("\n")[0])
        if val.lower() != "none" and val != "":
            comp_source = val
    if not priority and "PRIORITY:" in text:
        val = clean_val(text.split("PRIORITY:")[1].split("\n")[0])
        if val.lower() != "none" and val != "":
            priority = val
    if not mfg_date and "MANUFACTURING_DATE:" in text:
        val = clean_val(text.split("MANUFACTURING_DATE:")[1].split("\n")[0])
        if val.lower() != "none" and val != "":
            mfg_date = val
    if not exp_date and "EXPIRY_DATE:" in text:
        val = clean_val(text.split("EXPIRY_DATE:")[1].split("\n")[0])
        if val.lower() != "none" and val != "":
            exp_date = val

    return {
        **state,
        "product_name": prod_name,
        "batch_number": batch_num,
        "customer_name": cust_name,
        "product_strength": prod_strength,
        "quantity_affected": qty_affected,
        "complaint_date": comp_date,
        "complaint_source": comp_source,
        "priority": priority,
        "manufacturing_date": mfg_date,
        "expiry_date": exp_date
    }

# ──────────────────────────────────────────
# NODE 1 — Completeness Checker
# ──────────────────────────────────────────
def check_completeness(state: ComplaintState) -> ComplaintState:
    prompt = f"""
You are a pharmaceutical QMS expert.

Check if this complaint has all required information:
- Product name
- Batch number
- Customer name
- Clear description of the issue

Complaint Text: {state['complaint_text']}
Product Name: {state['product_name']}
Batch Number: {state['batch_number']}
Customer Name: {state['customer_name']}

Reply in this exact format:
COMPLETE: Yes or No
MISSING: list any missing fields or None
"""
    response = llm.invoke(prompt)
    text = response.content

    is_complete = "yes" in text.lower().split("complete:")[1].split("\n")[0].lower()
    missing = text.split("MISSING:")[1].strip() if "MISSING:" in text else "None"

    return {
        **state,
        "is_complete"   : is_complete,
        "missing_fields": missing
    }

# ──────────────────────────────────────────
# NODE 2 — Risk Classifier
# ──────────────────────────────────────────
def classify_risk(state: ComplaintState) -> ComplaintState:
    prompt = f"""
You are a pharmaceutical Quality Management expert.

Classify this customer complaint by risk level and category.

Complaint: {state['complaint_text']}
Product: {state['product_name']}
Batch: {state['batch_number']}

Risk Levels:
- Critical: Life threatening, serious injury, product recall needed
- Major: Significant quality issue, regulatory concern
- Minor: Small defect, cosmetic issue, packaging problem

Reply in this exact format:
RISK_LEVEL: Critical or Major or Minor
CATEGORY: (e.g. Product Quality, Packaging, Labeling, Contamination, Efficacy, Side Effect)
"""
    response = llm.invoke(prompt)
    text = response.content

    risk = "Unclassified"
    category = "General"

    if "RISK_LEVEL:" in text:
        risk = text.split("RISK_LEVEL:")[1].split("\n")[0].strip()
    if "CATEGORY:" in text:
        category = text.split("CATEGORY:")[1].split("\n")[0].strip()

    return {
        **state,
        "risk_level": risk,
        "category"  : category
    }

# ──────────────────────────────────────────
# NODE 3 — AI Summary Generator
# ──────────────────────────────────────────
def generate_summary(state: ComplaintState) -> ComplaintState:
    prompt = f"""
You are a pharmaceutical QMS documentation expert.

Write a professional 2-3 sentence summary of this complaint
suitable for a Quality Management System report.

Complaint: {state['complaint_text']}
Product: {state['product_name']}
Batch Number: {state['batch_number']}
Risk Level: {state['risk_level']}
Category: {state['category']}

Write only the summary. No extra text.
"""
    response = llm.invoke(prompt)
    return {
        **state,
        "ai_summary": response.content.strip()
    }

# ──────────────────────────────────────────
# NODE 4 — CAPA Recommender
# ──────────────────────────────────────────
def recommend_capa(state: ComplaintState) -> ComplaintState:
    prompt = f"""
You are a pharmaceutical CAPA (Corrective and Preventive Action) expert.

Based on this complaint, provide:
1. Root Cause Analysis (possible reasons)
2. Corrective Action (immediate fix)
3. Preventive Action (long term prevention)

Complaint: {state['complaint_text']}
Product: {state['product_name']}
Risk Level: {state['risk_level']}
Category: {state['category']}

Format your response clearly with these 3 sections.
"""
    response = llm.invoke(prompt)
    return {
        **state,
        "capa": response.content.strip()
    }

# ──────────────────────────────────────────
# NODE 5 — Duplicate Detector
# ──────────────────────────────────────────
def detect_duplicate(state: ComplaintState) -> ComplaintState:
    # Simple keyword-based check
    # In production you would compare with DB records
    keywords = ["duplicate", "same issue", "already reported", "reported before"]
    text_lower = state["complaint_text"].lower()
    is_duplicate = any(kw in text_lower for kw in keywords)

    return {
        **state,
        "duplicate_flag": is_duplicate
    }

# ──────────────────────────────────────────
# BUILD THE LANGGRAPH WORKFLOW
# ──────────────────────────────────────────
def build_agent():
    graph = StateGraph(ComplaintState)

    # Add all nodes
    graph.add_node("extract_entities",   extract_entities)
    graph.add_node("check_completeness", check_completeness)
    graph.add_node("classify_risk",      classify_risk)
    graph.add_node("generate_summary",   generate_summary)
    graph.add_node("recommend_capa",     recommend_capa)
    graph.add_node("detect_duplicate",   detect_duplicate)

    # Define the flow
    graph.set_entry_point("extract_entities")
    graph.add_edge("extract_entities",   "check_completeness")
    graph.add_edge("check_completeness", "detect_duplicate")
    graph.add_edge("detect_duplicate",   "classify_risk")
    graph.add_edge("classify_risk",      "generate_summary")
    graph.add_edge("generate_summary",   "recommend_capa")
    graph.add_edge("recommend_capa",     END)

    return graph.compile()

# Create the agent
complaint_agent = build_agent()

# ──────────────────────────────────────────
# FUNCTION TO RUN AGENT
# ──────────────────────────────────────────
def run_complaint_agent(
    complaint_text : str,
    product_name   : str = "",
    batch_number   : str = "",
    customer_name  : str = ""
) -> dict:

    initial_state = ComplaintState(
        complaint_text = complaint_text,
        product_name   = product_name,
        batch_number   = batch_number,
        customer_name  = customer_name,
        risk_level     = None,
        category       = None,
        ai_summary     = None,
        capa           = None,
        is_complete    = None,
        missing_fields = None,
        duplicate_flag = None,
        product_strength = None,
        quantity_affected = None,
        complaint_date = None,
        complaint_source = None,
        priority = None,
        manufacturing_date = None,
        expiry_date = None,
    )

    result = complaint_agent.invoke(initial_state)
    return result