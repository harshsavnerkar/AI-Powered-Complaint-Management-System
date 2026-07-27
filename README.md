# AI-Powered Customer Complaint Management System
> **A State-of-the-Art QMS Intake & Triage Module for the Pharmaceutical Industry (API & FDF)**

An advanced, end-to-end complaint management module designed to automate the intake, extraction, and risk assessment of customer complaints in pharmaceutical manufacturing. Built with a modern **React + Redux** frontend and a **Python FastAPI + LangGraph** agentic backend.

---

## 🚀 Live Production Links
*   **Production UI (Vercel)**: `https://ai-powered-complaint-management-system.vercel.app` *(Replace with your actual Vercel link)*
*   **Production API (Render)**: `https://ai-powered-complaint-management-system-4ixh.onrender.com`
*   **Cloud Database (Clever Cloud)**: Managed MySQL Server (Paris, France Zone)

---

## ✨ System Features & Workflows

### 1. Intelligent AI Extraction & Autofill
Paste raw complaint emails or drag-and-drop file documents (`.txt`, `.pdf`). The AI automatically parses and populates the entire intake form, identifying:
*   Customer Name & Complaint Source
*   Product Name & Strength
*   Batch/Lot Number & Quantities
*   Manufacturing & Expiry Dates

### 2. Multi-Node LangGraph Agent Workflow
Upon submission or extraction, the backend executes a structured LangGraph state graph using **Llama-3.3-70b-versatile** on Groq:
1.  **Entity Extractor (Node 0)**: Scans raw text to extract product metadata.
2.  **Completeness Checker (Node 1)**: Verifies if critical regulatory fields are present, flagging missing details.
3.  **Duplicate Detector (Node 2)**: Checks for prior complaints matching similar failure modes.
4.  **Risk Classifier (Node 3)**: Categorizes severity (Minor, Major, Critical) and risk categories.
5.  **Executive Summarizer (Node 4)**: Generates a brief corporate summary of the issue.
6.  **CAPA Recommender (Node 5)**: Drafts root-cause analyses, immediate corrective actions, and long-term preventive actions.

### 3. Triage & Audit Dashboard
*   **Insights Drawer**: Slide out a detailed pane for any complaint to view full AI risk analyses and CAPA drafts.
*   **Interactive Triage**: Change statuses (Open, Under Investigation, Resolved) or delete records directly.

---

## 🛠️ Technology Stack

*   **Frontend**: React (Vite), Redux Toolkit (State Management), Axios (HTTP Client), Vanilla CSS (Custom Design System).
*   **Backend**: Python 3.13, FastAPI (API endpoints), SQLAlchemy (ORM).
*   **Database**: MySQL (Clever Cloud) with automatic table generation.
*   **AI Framework**: LangGraph, LangChain, ChatGroq.

---

## ⚙️ Local Development Setup

### 1. Clone & Initialize
```bash
git clone https://github.com/harshsavnerkar/AI-Powered-Complaint-Management-System.git
cd AI-Powered-Complaint-Management-System
```

### 2. Backend Setup
1.  Navigate to the `backend` folder:
    ```bash
    cd backend
    ```
2.  Create a `.env` file:
    ```ini
    GROQ_API_KEY=your_groq_api_key
    DATABASE_URL=mysql+pymysql://root:password@localhost:3306/pharma_qms
    ```
3.  Install dependencies & run:
    ```bash
    pip install -r requirements.txt
    uvicorn main:app --reload
    ```

### 3. Frontend Setup
1.  Navigate to the `frontend` folder:
    ```bash
    cd ../frontend
    ```
2.  Install packages & run:
    ```bash
    npm install
    npm run dev
    ```
3.  Access the UI at `http://localhost:5173`.
