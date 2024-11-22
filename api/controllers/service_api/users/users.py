from flask_restful import Resource, reqparse
from flask import request
from extensions.ext_database import db
from datetime import datetime,  timezone
from configs import dify_config

from services.account_service import TenantService
from services.users_service import UsersService
from libs.helper import StrLen, email, extract_remote_ip
from libs.password import valid_password
from models.model import DifySetup

from controllers.service_api import api
from controllers.service_api.wraps import DatasetApiResource

class UserCreateAPI(Resource):
    def post(self):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument("email", type=email, required=True, location="json")
            parser.add_argument("name", type=StrLen(30), required=True, location="json")
            parser.add_argument("password", type=valid_password, required=True, location="json")

            args = parser.parse_args()

            user_service = UsersService()
            account = user_service.create_user(
                email=args["email"], name=args["name"], password=args["password"], role="admin"
            )

            ip_address = extract_remote_ip(request)
            account.last_login_ip = ip_address
            account.initialized_at = datetime.now(timezone.utc).replace(tzinfo=None)

            TenantService.create_owner_tenant_if_not_exist(account=account, is_setup=True)

            dify_setup = DifySetup(version=dify_config.CURRENT_VERSION)
            db.session.add(dify_setup)
            db.session.commit()

            if account:
                return account.id, 201
            else:
                return {"error": "Failed to create user"}, 500
        except Exception as e:
            print(str(e))
            return {"error": str(e)}, 500
        
api.add_resource(UserCreateAPI, "/user-create")