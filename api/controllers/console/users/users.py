from flask_login import current_user
from flask_restful import Resource, reqparse
from alembic import op
from flask import request
from extensions.ext_database import db
from models.account import Account
from datetime import datetime, timedelta, timezone
from configs import dify_config


from services.account_service import TenantService
from services.users_service import UsersService, AccountService
from libs.helper import StrLen, email, extract_remote_ip
from libs.password import valid_password
from models.model import DifySetup

from controllers.console import api
from controllers.console.setup import setup_required
from controllers.console.wraps import account_initialization_required, only_edition_cloud
from libs.login import login_required
from core.model_runtime.utils.encoders import jsonable_encoder

class UserCreate(Resource):
    @setup_required
    @login_required
    @account_initialization_required
    def post(self):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument("email", type=email, required=True, location="json")
            parser.add_argument("name", type=StrLen(30), required=True, location="json")
            parser.add_argument("password", type=valid_password, required=True, location="json")
            parser.add_argument("role", type=str, required=False, default="common", location="json")
            parser.add_argument("account_id", type=str, required=True, location="json")

            args = parser.parse_args()

            user_service = UsersService()
            account = user_service.create_user(
                email=args["email"], name=args["name"], password=args["password"], account_id=args["account_id"], role=args["role"]
            )

            ip_address = extract_remote_ip(request)
            account.last_login_ip = ip_address
            account.initialized_at = datetime.now(timezone.utc).replace(tzinfo=None)

            TenantService.create_owner_tenant_if_not_exist(account=account, is_setup=True)

            dify_setup = DifySetup(version=dify_config.CURRENT_VERSION)
            db.session.add(dify_setup)
            db.session.commit()

            if account:
                return account, 201
            else:
                return {"error": "Failed to create user"}, 500
        except Exception as e:
            print(str(e))
            return {"error": str(e)}, 500
        
class Users(Resource):
    @setup_required
    @login_required
    @account_initialization_required
    def get(self, user_id):
        user_service = UsersService()
        accounts = user_service.get_accounts(user_id)
        return accounts
    
class User(Resource):
    @setup_required
    @login_required
    @account_initialization_required
    def get(self, user_id):
        user_service = UsersService()
        account = user_service.get_account(user_id)
        return account
    
class UserUpdate(Resource):
    @setup_required
    @login_required
    @account_initialization_required
    def patch(self, user_id):
        parser = reqparse.RequestParser()
        parser.add_argument("email", type=email, required=True, location="json")
        parser.add_argument("name", type=StrLen(30), required=True, location="json")
        parser.add_argument("password", type=valid_password, required=True, location="json")
        parser.add_argument("role", type=str, required=False, default="common", location="json")
        parser.add_argument("account_id", type=str, required=True, location="json")

        args = parser.parse_args()
        
        user_service = UsersService()
        account = user_service.update_account(user_id, email=args["email"], name=args["name"], password=args["password"], account_id=args["account_id"], role=args["role"])

        if account:
            return account
        else:
            return {"error": "Failed to update user"}, 500
    

class UserDelete(Resource):
    @setup_required
    @login_required
    @account_initialization_required
    def post(self, user_id):
        # Obter o usuário com o user_id
        account = db.session.query(Account).filter_by(id=user_id).first()

        if not account:
            return jsonable_encoder({"message": "Usuário não encontrado"}), 404

        # Chamar o método close_account para fechar a conta
        try:
            AccountService.close_account(account)  # Supondo que cada user tem um 'account'
            return jsonable_encoder({"message": "Conta encerrada com sucesso"}), 200
        except Exception as e:
            return jsonable_encoder({"message": "Erro ao encerrar a conta", "error": str(e)}), 500
        

api.add_resource(Users, "/users/<string:user_id>")
api.add_resource(User, "/users/<string:user_id>")

api.add_resource(UserCreate, "/users")
api.add_resource(UserUpdate, "/user/<string:user_id>")
api.add_resource(UserDelete, "/user/<string:user_id>")