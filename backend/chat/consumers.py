# import json
# import websockets
# from channels.generic.websocket import AsyncWebsocketConsumer
# from channels.db import database_sync_to_async
# from django.conf import settings
# import os
# # from core.models import Card, ReviewCard #/ when needed to avoid docker issue

# class RealtimeConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         print("Attempting websocket connection - from consumer")
#         self.accept()
#         print("Connection accepted - awaiting authentication - from consumer")
#         self.authenticated=False

#         #/ this block can be deleted after we get things working      
#         # try:
#         #     self.user = self.scope["user"]
#         #     if not self.user.is_authenticated:
#         #         print("User not authenticated")
#         #         await self.close()
#         #         return
            
#         #     await self.accept()
#         #     print(f"WebSocket connection accepted for user: {self.user.username}")
            
#         # except Exception as e:
#         #     print(f"Error in connect: {str(e)}")
#         #     await self.close()
#         #/ __________________________________


#         # self.user = self.scope['user']
#         # if not self.user.is_authenticated:
#         #     await self.close()
#         #     return


#         # # Initialize OpenAI Websocket Connections
#         # try:
#         #     self.openai_ws = await websockets.connect(
#         #         "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01",
#         #         extra_headers={
#         #             "Authorization": f"Bearer {os.getenv('OPEN_API_KEY')}",  # Ensure the correct usage of quotes
#         #             "OpenAi-Beta": "realtime=v1"
#         #         }
#         #     )
#         # except (websockets.exceptions.ConnectionClosedError, websockets.exceptions.WebSocketException) as e:
#         #     print(f":Error during websocket connection: {e}")
#         #     await self.close()
#         #     return

#         # profile = await self.get_profile()

#         # known_kana = "placeholder"
#         # known_kanji = "placeholder"

#         # # Configure the session with appropriate instructions
#         # await self.openai_ws.send(json.dumps({
#         #     "type": "session.update",
#         #     "session": {
#         #         "instructions": f"""
#         #         You are a Japanese language tutor. The user's currently going through a Hiragana, Katakana and Japanese Core 2.3k flashcard deck
#         #         in an Anki based app as well as the are making their way through Cure Dolly's grammar course. They currently know the following kana
#         #         {known_kana} and the following kangi {known_kanji}, these are pulled directly from their review cards and also holds their profeicency with each character/word. 
#         #         Adjust your language use to be slightly above their current level to encourage learning. Try to re-enforce words that they are struggling with and 
#         #         avoid using words too far outside of their vocabulary. Speak naturally in Japanese but be ready to explain in English if they struggle.
#         #         Use appropriate politeness levels based on their JLPT level.
#         #         """,
#         #         "voice": "alloy",
#         #     }
#         # }))

#         # # Start listening for OpenAI messages
#         # self.openai_listener = asyncio.create_task(self.listen_to_openai())
    
#     async def disconnect(self, close_code):
#         if hasattr(self, 'openai_ws'):
#             await self.openai_ws.close()
#         if hasattr(self, 'openai_listener'):
#             self.openai_listener.cancel()


#     @database_sync_to_async
#     def get_profile(self):
#         from user_auth import Profile
#         try:
#             return Profile.objects.get(user=self.user)
#         except Profile.objects.get(user=self.user):
#             return None

#     @database_sync_to_async
#     def get_user_from_token(self, token_str):
#         from rest_framework_simplejwt.tokens import AccessToken
#         from rest_framework_simplejwt.exceptions import TokenError

#         try:
#             token = AccessToken(token_str)
#             User = get_user_model()
#             return User.objects.get(id=token.payload.get('user_id'))
#         except (TokenError, User.DoesNotExist) as e:
#             print(f"Authentication error from -get_user_token: {str(e)}")
#             return None
    
#     async def receive(self, text_data):
#         """
#         Handle messages from the client
#         """
#         try:
#             data = json.loads(text_data)

#             # forward the message to OpenAI
#             # await self.openai_ws.send(data)
#             if not self.authenticated and data.get('type') == 'authenticate':
#                 token = data.get('token')
#                 if token:
#                     user = await self.get_user_from_token(token)
#                     if user:
#                         self.user = user
#                         self.authenticated = True
#                         await self.send(json.dumps({
#                             'type': 'authentication_successful',
#                             'message': 'Successfully authenticated'
#                         }))
#                         print(f"User {user.username} authenticated")
#                         return

#                 await self.send(json.dumps({
#                     'type': "authentication_failed",
#                     'message': "Invalid token"
#                 }))
#                 await self.close()
#                 return

#             if not self.authenticated:
#                 await self.send({
#                     'type': 'error',
#                     'messasge': 'Not authenticated'
#                 })
#                 await self.close()
#                 return
            
#             print(f"Recieved authenticated message: {data}")

#         except json.JSONDecodeError:
#             print("Invalid JSON received")
#             await self.close()
#         except Exception as e:
#             print(f"Error in receive: {str(e)}")
#             await self.close()
    
#     async def listen_to_openai(self):
#         """
#         Listen for messages from OpenAI and forward them to the client
#         """

#         try:
#             while True:
#                 message = await self.openai_ws.recv()
#                 await self.send(text_data=message)
#         except websockets.exceptions.ConnectionClosed:
#             await self.close()
#         except Exception as e:
#             print(f"Error in OpenAi Listener: {e}")
#             await self.close()



# Backend Consumer (consumers.py)
import json
import websockets
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.conf import settings

class RealtimeConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("Attempting websocket connection")
        await self.accept()
        print("Connection accepted - awaiting authentication")
        self.authenticated = False
        
    async def disconnect(self, close_code):
        print(f"WebSocket disconnected with code: {close_code}")
        if hasattr(self, 'openai_ws'):
            await self.openai_ws.close()
        if hasattr(self, 'openai_listener'):
            self.openai_listener.cancel()

    @database_sync_to_async
    def get_user_from_token(self, token_str):
        from rest_framework_simplejwt.tokens import AccessToken
        from rest_framework_simplejwt.exceptions import TokenError
        
        try:
            token = AccessToken(token_str)
            User = get_user_model()
            user = User.objects.get(id=token.payload.get('user_id'))
            print(f"Successfully authenticated user: {user.username}")
            return user
        except (TokenError, User.DoesNotExist) as e:
            print(f"Authentication error: {str(e)}")
            return None
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            
            # Handle authentication
            if not self.authenticated:
                if data.get('type') == 'authenticate':
                    token = data.get('token')
                    if token:
                        user = await self.get_user_from_token(token)
                        if user:
                            self.user = user
                            self.authenticated = True
                            await self.send(json.dumps({
                                'type': 'authentication_successful',
                                'message': 'Successfully authenticated'
                            }))
                            print(f"Authentication successful for user: {user.username}")
                            return
                
                    await self.send(json.dumps({
                        'type': 'authentication_failed',
                        'message': 'Invalid token'
                    }))
                    await self.close()
                    return
                else:
                    await self.send(json.dumps({
                        'type': 'error',
                        'message': 'Authentication required'
                    }))
                    await self.close()
                    return
            
            # Handle authenticated messages
            print(f"Received authenticated message: {data}")
            # Process authenticated message here
            
        except json.JSONDecodeError as e:
            print(f"Invalid JSON received: {str(e)}")
            await self.close()
        except Exception as e:
            print(f"Error in receive: {str(e)}")
            await self.close()