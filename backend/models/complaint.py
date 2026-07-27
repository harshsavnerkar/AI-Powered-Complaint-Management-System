from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, Boolean
from sqlalchemy.sql import func
from database import Base
import enum

class RiskLevel(str, enum.Enum):
    critical = "Critical"
    major = "Major"
    minor = "Minor"
    unclassified = "Unclassified"

class StatusEnum(str, enum.Enum):
    open = "Open"
    in_progress = "In Progress"
    closed = "Closed"
    resolved = "Resolved"

class Complaint(Base):
    __tablename__ = "complaints"

    id            = Column(Integer, primary_key=True, index=True)
    title         = Column(String(255), nullable=False)
    description   = Column(Text, nullable=False)
    product_name  = Column(String(255))
    batch_number  = Column(String(100))
    customer_name = Column(String(255))
    customer_email= Column(String(255))
    risk_level    = Column(String(50), default="Unclassified")
    category      = Column(String(100))
    status        = Column(String(50), default="Open")
    ai_summary    = Column(Text)
    capa          = Column(Text)
    is_complete   = Column(Boolean, default=True)
    missing_fields = Column(Text)
    duplicate_flag = Column(Boolean, default=False)
    file_path     = Column(String(500))
    created_at    = Column(DateTime, default=func.now())
    updated_at    = Column(DateTime, default=func.now(), onupdate=func.now())