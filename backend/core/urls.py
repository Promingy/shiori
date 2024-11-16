from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView
)
from .views import *

urlpatterns = [
    path('random_card/', RandomCardView.as_view(), name="random_card"),
]