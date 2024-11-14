from django.contrib import admin
from django.urls import path
from .views import *

urlpatterns = [
    path('csrf-token/', CsrfTokenView.as_view(), name="csrf_token"),
    path('signup/', Signup.as_view(), name="signup"),
    path('random_card/', RandomCard.as_view(), name="random_card"),
]