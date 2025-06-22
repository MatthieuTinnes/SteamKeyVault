from ninja import NinjaAPI
from users.api import users_router

api = NinjaAPI(csrf=True)
api.add_router("/users/", users_router)
