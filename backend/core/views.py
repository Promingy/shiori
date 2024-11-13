from django.shortcuts import render, get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework import status
from django.contrib.auth.models import User
from .models import *
from.serializers import *

# Create your views here.
# #/ function based view
# @api_view(['GET', 'POST'])
# def book_list(request):
#     """
#     List all books or create a new book
#     """

#     if request.method == "GET":
#         books = Books.objects.all()
#         serializer = BookSerializer(books, many=True) # many=True lets serializer know that we're serializing multiple items
#         return Response(serializer.data)
#     elif request.method == "POST":
#         serializer = BookSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['GET', 'PUT', 'DELETE'])
# def book_detail(request, pk):
#     """
#     Retrieve, update or delete a book
#     """

#     book = get_object_or_404(Books, pk=pk)

#     if request.method == "GET":
#         serializer = BookSerializer(book)
#         return Response(serializer.data)
#     elif request.method == "PUT":
#         serializer = BookSerializer(book, data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#     elif request.method == "DELETE":
#         book.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)


# #/ class based view
# class BookList(ListCreateAPIView):
#     queryset = Books.objects.all()
#     serializer_class = BookSerializer

#     def create(self, request, *args, **kwargs):
#         serializer = BookSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class BookDetail(RetrieveUpdateDestroyAPIView):
#     queryset = Books.objects.all()
#     serializer_class = BookSerializer

#     def get_object(self):
#         return get_object_or_404(Books, pk=self.kwargs["pk"])

#     def put(self, request, *args, **kwargs):
#         book = self.get_object()
#         serializer = BookSerializer(book, data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, *args, **kwargs):
#         book = self.get_object()
#         book.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)

Class Signup(CreateAPIView):
    def create(self, request, *args, **kwargs):
        """
        Create a user, profile, 
        """

        try:
            user = User.objects.create_user(
                first_name=request.data["first_name"],
                last_name=request.data["last_name"],
                email = request.data["email"],
                username=request.data["email"],                
                password=request.data["password"],
            )
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        profile = Profile.objects.create(
            user=user,
            first_name=request.data["first_name"],
            last_name=request.data["last_name"],
            email = request.data["email"],
        )

        profile_serializer = ProfileSerializer(data=profile)
        if profile_serializer.is_valid():
            profile_serializer.save()

            # Associate pre-existing decks and cards with the new user
            default_deck = Decks.objects.first()

            if default_deck:
                # Associate all cards & noteswith the profile
                notes = Notes.objects.filter(deck=default_deck)
                cards = Cards.objects.filter(deck=default_deck)

                cards.update(profile=profile)
                notes.update(profile=profile)

            return Response(profile_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
