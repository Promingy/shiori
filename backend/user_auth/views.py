from rest_framework.generics import RetrieveAPIView, CreateAPIView
from .serializers import UserSerializer, ProfileSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated  
from django.contrib.auth import authenticate, logout
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework import status

# Create your views here.
class GetUser(RetrieveAPIView):
    serializer_class = UserSerializer
    # permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user


        # if not user.is_authenticated:
        #     return Response({"error": "User is not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = self.serializer_class(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

class Signup(CreateAPIView):
    serializer_class = ProfileSerializer

    def create(self, request, *args, **kwargs):
        """
        Create a user, profile, 
        """

        print('!!!!!!!!!!!!!!!!')

        try:
            user = User.objects.create_user(
                first_name=request.data["first_name"],
                last_name=request.data["last_name"],
                email = request.data["email"],
                username=request.data["email"],                
                password=request.data["password"],
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        authenticate(username=request.data["email"], password=request.data["password"])

        profile_serializer = ProfileSerializer(data={"user": user}, context={"user": user})

        if profile_serializer.is_valid():
            profile = profile_serializer.save()

            # Generate Token
            refresh = RefreshToken.for_user(user)
            token_data = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user' : profile_serializer.data['user']
            }
            
            return Response(token_data, status=status.HTTP_201_CREATED)
        
        return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class Login(APIView):
    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        password = request.data.get("password")
        user = authenticate(username=email, password=password)

        # profile = Profile.objects.get(user=user)

        # if profile is not None and date.today() > profile.last_card_reset:
        #     profile.new_cards_today = 0
        #     profile.last_card_reset = date.today()
        #     profile.save()

        if user is not None:
            refresh = RefreshToken.for_user(user)
            token_data = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user' : UserSerializer(user).data
            }

            
            return Response(token_data, status=status.HTTP_200_OK)

        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class Logout(APIView):
    # permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)