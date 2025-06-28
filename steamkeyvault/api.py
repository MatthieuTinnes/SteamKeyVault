from ninja import NinjaAPI
from users.api import users_router
from steamkeyvault.steam.api import steam_router
from steamkeyvault.games.api import router as games_router
from steamkeyvault.keys.api import router as keys_router

api = NinjaAPI(csrf=True)
api.add_router("/users/", users_router)
api.add_router("/steam/", steam_router)
api.add_router("/games/", games_router)
api.add_router("/keys/", keys_router)
