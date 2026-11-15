from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate

class CustomerService:
    @staticmethod
    def get_customers(
        db: Session,
        skip: int = 0,
        limit: int = 50,
        search: Optional[str] = None,
        contract: Optional[str] = None,
        churn_status: Optional[str] = None
    ) -> Tuple[int, List[Customer]]:
        query = db.query(Customer)

        if search:
            search_fmt = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Customer.customer_code.ilike(search_fmt),
                    Customer.payment_method.ilike(search_fmt)
                )
            )

        if contract and contract != "ALL":
            query = query.filter(Customer.contract == contract)

        if churn_status and churn_status != "ALL":
            if churn_status == "CHURNED":
                query = query.filter(Customer.actual_churn == True)
            elif churn_status == "RETAINED":
                query = query.filter(Customer.actual_churn == False)
            elif churn_status == "UNKNOWN":
                query = query.filter(Customer.actual_churn.is_(None))

        total = query.count()
        items = query.order_by(Customer.id.asc()).offset(skip).limit(limit).all()
        return total, items

    @staticmethod
    def get_customer_by_id(db: Session, customer_id: int) -> Optional[Customer]:
        return db.query(Customer).filter(Customer.id == customer_id).first()

    @staticmethod
    def get_customer_by_code(db: Session, customer_code: str) -> Optional[Customer]:
        return db.query(Customer).filter(Customer.customer_code == customer_code).first()

    @staticmethod
    def create_customer(db: Session, customer_data: CustomerCreate) -> Customer:
        db_customer = Customer(**customer_data.model_dump())
        db.add(db_customer)
        db.commit()
        db.refresh(db_customer)
        return db_customer

    @staticmethod
    def update_customer(db: Session, customer_id: int, customer_data: CustomerUpdate) -> Optional[Customer]:
        db_customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not db_customer:
            return None

        update_dict = customer_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(db_customer, key, value)

        db.commit()
        db.refresh(db_customer)
        return db_customer

    @staticmethod
    def delete_customer(db: Session, customer_id: int) -> bool:
        db_customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not db_customer:
            return False

        db.delete(db_customer)
        db.commit()
        return True

customer_service = CustomerService()
