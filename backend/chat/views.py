from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# Create your views here.
class Test(APIView):
    def get(self, request, *args, **kwargs):
        print("!!!!!!!!")
        return Response({"message": "succcess"}, status=status.HTTP_200_OK)

