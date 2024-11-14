from django.contrib import admin
from django.urls import path
from .views import *

urlpatterns = [
    path('signup/', Signup.as_view(), name="signup"),
    path('random_card/', RandomCard.as_view(), name="random_card"),
    path('logout/', Logout.as_view(), name="logout"),
    path('user/', GetUser.as_view(), name="get_user"),
]