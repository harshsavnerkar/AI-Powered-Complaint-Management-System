from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from models.complaint import Complaint
from agent.complaint_agent import run_complaint_agent
from pydantic import BaseModel
from typing import Optional
import shutil, os

router = APIRouter(prefix="/complaints", tags=["complaints"])

# ── Schemas ──
class ComplaintCreate(BaseModel):
    title          : str
    description    : str
    product_name   : Optional[str] = ""
    batch_number   : Optional[str] = ""
    customer_name  : Optional[str] = ""
    customer_email : Optional[str] = ""
    complaint_type : Optional[str] = ""
    severity       : Optional[str] = ""

class TextExtract(BaseModel):
    text: str

class ChatMessage(BaseModel):
    message: str

# ── 1. Submit Complaint ──
@router.post("/")
async def create_complaint(data: ComplaintCreate, db: Session = Depends(get_db)):
    # Run AI agent
    ai_result = run_complaint_agent(
        complaint_text = data.description,
        product_name   = data.product_name,
        batch_number   = data.batch_number,
        customer_name  = data.customer_name
    )

    complaint = Complaint(
        title          = data.title,
        description    = data.description,
        product_name   = data.product_name,
        batch_number   = data.batch_number,
        customer_name  = data.customer_name,
        customer_email = data.customer_email,
        risk_level     = ai_result.get("risk_level", "Unclassified"),
        category       = ai_result.get("category", "General"),
        ai_summary     = ai_result.get("ai_summary", ""),
        capa           = ai_result.get("capa", ""),
        is_complete    = ai_result.get("is_complete", True),
        missing_fields = ai_result.get("missing_fields", ""),
        duplicate_flag = ai_result.get("duplicate_flag", False),
        status         = "Open"
    )

    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return complaint

# ── 2. Get All Complaints ──
@router.get("/")
def get_complaints(db: Session = Depends(get_db)):
    return db.query(Complaint).order_by(Complaint.created_at.desc()).all()

# ── 3. Get Single Complaint ──
@router.get("/{complaint_id}")
def get_complaint(complaint_id: int, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint

# ── 4. Update Status ──
@router.patch("/{complaint_id}/status")
def update_status(complaint_id: int, status: str, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Not found")
    complaint.status = status
    db.commit()
    db.refresh(complaint)
    return complaint

# ── 5. Extract from File ──
@router.post("/extract")
async def extract_from_file(file: UploadFile = File(...)):
    # Save file temporarily
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        # Read text from file
        text = ""
        if file.filename.endswith(".txt"):
            with open(temp_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
        elif file.filename.endswith(".pdf"):
            import PyPDF2
            with open(temp_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    text += page.extract_text() or ""
        else:
            with open(temp_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()

        if not text.strip():
            text = "Unable to extract text from file."

        # Run AI agent
        result = run_complaint_agent(complaint_text=text)
        result["complaint_text"] = text
        return result

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

# ── 6. Extract from Text ──
@router.post("/extract-text")
async def extract_from_text(data: TextExtract):
    result = run_complaint_agent(complaint_text=data.text)
    result["complaint_text"] = data.text
    return result

# ── 7. AI Chat ──
@router.post("/chat")
async def chat(data: ChatMessage):
    from langchain_groq import ChatGroq
    from dotenv import load_dotenv
    import os
    load_dotenv()

    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        api_key=os.getenv("GROQ_API_KEY"),
        temperature=0.5
    )

    prompt = f"""You are a pharmaceutical QMS expert assistant.
Answer this question helpfully and concisely:

{data.message}"""

    response = llm.invoke(prompt)
    return {"reply": response.content}

# ── 8. Delete Complaint ──
@router.delete("/{complaint_id}")
def delete_complaint(complaint_id: int, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(complaint)
    db.commit()
    return {"message": "Deleted successfully"}