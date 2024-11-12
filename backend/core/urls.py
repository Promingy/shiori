from django.contrib import admin
from django.urls import path
from . import views

urlpatters = [
    # path('books', views.book_list, name="book_list"),
    # path('books/<int:pk>', views.book_detail, name="book_detail"),
    path('books', views.BookList.as_view(), name="book_list"),
    path('books/<int:pk>', views.BookDetail.as_view(), name="book_detail"),
]