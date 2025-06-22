from ninja import NinjaAPI
from users.api import users_router
from steamkeyvault.steam.api import steam_router

api = NinjaAPI(csrf=True)
api.add_router("/users/", users_router)
api.add_router("/steam/", steam_router)
