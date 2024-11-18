from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from pathlib import Path
import openai

# Create your views here.
class Test(APIView):
    def get(self, request, *args, **kwargs):
        views_dir = Path(__file__).parent

        speech_file_path = views_dir / "test_recording.m4a"

        print("!!!!!!!!")
        return Response({"message": "succcess"}, status=status.HTTP_200_OK)

