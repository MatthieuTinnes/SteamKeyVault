from ninja import Router
from django.contrib.auth import get_user_model
from typing import List
from pydantic import BaseModel
from django.shortcuts import get_object_or_404
from ninja.security import HttpBearer

User = get_user_model()
router = Router()

class GlobalAuth(HttpBearer):
    def authenticate(self, request, token):
        if token == "supersecrettoken":
            return token
        return None

class UserSchema(BaseModel):
    id: int
    username: str
    email: str

class UserCreateSchema(BaseModel):
    username: str
    email: str
    password: str

@router.get("/", response=List[UserSchema], auth=GlobalAuth())
def list_users(request):
    return list(User.objects.all())

@router.post("/", response=UserSchema, auth=GlobalAuth())
def create_user(request, data: UserCreateSchema):
    user = User.objects.create_user(
        username=data.username,
        email=data.email,
        password=data.password
    )
    return user

@router.get("/{user_id}", response=UserSchema, auth=GlobalAuth())
def get_user(request, user_id: int):
    user = get_object_or_404(User, id=user_id)
    return user

@router.put("/{user_id}", response=UserSchema, auth=GlobalAuth())
def update_user(request, user_id: int, data: UserCreateSchema):
    user = get_object_or_404(User, id=user_id)
    user.username = data.username
    user.email = data.email
    if data.password:
        user.set_password(data.password)
    user.save()
    return user

@router.delete("/{user_id}", auth=GlobalAuth())
def delete_user(request, user_id: int):
    user = get_object_or_404(User, id=user_id)
    user.delete()
    return {"success": True}
