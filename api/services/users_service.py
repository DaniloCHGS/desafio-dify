from services.account_service import AccountService
from datetime import datetime, timedelta, timezone
from constants.languages import languages
from models.account import Account
from extensions.ext_database import db
from core.model_runtime.utils.encoders import jsonable_encoder

class UsersService:
    @classmethod
    def create_user(cls, email: str, name: str, password: str, account_id: str = None, role: str = "common") -> Account:
        account_service = AccountService()
        account = account_service.create_account(
            email=email,
            name=name,
            interface_language=languages[0],
            password=password,
            is_setup=True,
            account_id=account_id,
            role=role,
            interface_theme="light",
        )

        return account 
              
    @classmethod
    def get_accounts(cls, user_id: str = None):
        try:
            if user_id:
                accounts = db.session.query(Account).where(Account.account_id == user_id).all()
                return jsonable_encoder(accounts)
            else:
                accounts = db.session.query(Account).all()
                return jsonable_encoder(accounts)
        except Exception as e:
            return None
        
    @classmethod
    def get_account(cls, id: str):
        try:
            account = db.session.query(Account).where(Account.id == id).all()
            return jsonable_encoder(account)
        except Exception as e:
            return None
        

    @classmethod
    def update_account(cls, id: str, email: str, name: str, password: str, account_id: str, role: str = "common"):
        """
        Atualiza uma conta pelo ID.
        """
        try:
            # Buscar a conta pelo ID
            account = db.session.query(Account).filter_by(id=id).first()

            # Verificar se a conta existe
            if not account:
                return {
                    "message": "Account not found",
                    "account_id": id
                }

            account_service = AccountService()

            # Atualizar a conta usando o serviço
            updated_account = account_service.update_account(
                account=account,  # Passar a instância da conta existente
                email=email,
                name=name,
                interface_language=languages[0],  # Certifique-se que languages está acessível
                password=password,
                account_id=account_id,
                role=role,
            )

            # Verificar se a atualização foi bem-sucedida
            if updated_account:
                return updated_account.id
            else:
                None

        except AttributeError as attr_error:
            return {
                "message": "Attribute error during update",
                "error": str(attr_error)
            }

        except Exception as e:
            return {
                "message": "An unexpected error occurred",
                "error": str(e)
            }


        



