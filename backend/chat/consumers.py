import json
import websockets
import asyncio
import os
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from dotenv import load_dotenv

load_dotenv()

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

    async def handle_authentication(self, data):
        """
        Handle the authentication process for the WebSocket connection.
        Returns True if authentication was successful, False otherwise.
        """
        token = data.get('token')
        if not token:
            await self.send(json.dumps({
                'type': 'authentication_failed',
                'message': 'No token provided'
            }))
            return False

        user = await self.get_user_from_token(token)
        if not user:
            await self.send(json.dumps({
                'type': 'authentication_failed',
                'message': 'Invalid token'
            }))
            return False

        self.user = user
        self.authenticated = True
        
        # Initialize OpenAI connection after successful authentication
        try:
            await self.connect_to_openai()
            await self.send(json.dumps({
                'type': 'authentication_successful',
                'message': 'Successfully authenticated and connected to OpenAI'
            }))
            print(f"Authentication successful for user: {user.username}")
            return True
        except Exception as e:
            print(f"Error connecting to OpenAI: {str(e)}")
            await self.send(json.dumps({
                'type': 'error',
                'message': 'Authentication successful but OpenAI connection failed'
            }))
            await self.close()
            return False

    async def connect_to_openai(self):
        """
        Establish connection to OpenAI's WebSocket
        """
        try:
            self.openai_ws = await websockets.connect(
                "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01",
                extra_headers={
                    "Authorization": f"Bearer {os.getenv('OPEN_API_KEY')}",
                    "OpenAi-Beta": "realtime=v1"
                }
            )
            
            known_kana = "kana_placeholder"
            known_kanji = "kanji_placeholder"

            await self.openai_ws.send(json.dumps({
                'type': 'session.update',
                'session': {
                    "instructions": f"""
                    You are a Japanese language tutor. The user's currently going through a Hiragana, Katakana and Japanese Core 2.3k flashcard deck
                    in an Anki based app as well as the are making their way through Cure Dolly's grammar course. They currently know the following kana
                    {known_kana} and the following kangi {known_kanji}, these are pulled directly from their review cards and also holds their profeicency with each character/word. 
                    avoid using words too far outside of their vocabulary. Speak naturally in Japanese but be ready to explain in English if they struggle.
                    Use appropriate politeness levels based on their JLPT level.
                    """,
                    "voice": "alloy"
                }
            }))

            self.openai_listener = asyncio.create_task(self.listen_to_openai())
            
        except Exception as e:
            print(f"Error establishing OpenAI connection: {str(e)}")
            raise

    async def receive(self, text_data):
        """
        Handle incoming WebSocket messages.
        """
        try:
            data = json.loads(text_data)
            
            # Handle authentication
            if not self.authenticated:
                if data.get('type') == 'authenticate':
                    auth_successful = await self.handle_authentication(data)
                    if not auth_successful:
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
            message_type = data.get('type')
            
            if message_type == 'message':
                # Forward message to OpenAI
                await self.openai_ws.send(json.dumps({
                    'type': 'conversation.item.create',
                    'item': {
                        'type': 'message',
                        'role': 'user',
                        'content': [{
                            'type': 'input_text',
                            'text': data.get('content')
                        }]
                    }
                }))
                
                # Generate response
                await self.openai_ws.send(json.dumps({
                    'type': 'response.create'
                }))
            
            elif message_type == 'input_audio':
                print('THIS IS GETTING HIT')
                await self.openai_ws.send(json.dumps({
                    'type': 'conversation.item.create',
                    "item": {
                        "type": "message",
                        'role': "user",
                        'content': [{
                            'type': 'input_audio',
                            'audio': data.get('content')
                        }]
                    }
                }))

                await self.openai_ws.send(json.dumps({
                    'type': 'response.create'
                }))
                
            elif message_type == 'end_session':
                if hasattr(self, 'openai_ws'):
                    await self.openai_ws.close()
                if hasattr(self, 'openai_listener'):
                    self.openai_listener.cancel()
                await self.close()
                
            else:
                print(f"Unknown message type: {message_type}")
                await self.send(json.dumps({
                    'type': 'error',
                    'message': f'Unknown message type: {message_type}'
                }))
            
        except json.JSONDecodeError as e:
            print(f"Invalid JSON received: {str(e)}")
            await self.close()
        except Exception as e:
            print(f"Error in receive: {str(e)}")
            await self.close()

    async def listen_to_openai(self):
        """
        Listen for messages from OpenAI and forward them to the client
        """
        try:
            while True:
                message = await self.openai_ws.recv()
                await self.send(text_data=message)
        except websockets.exceptions.ConnectionClosed:
            await self.close()
        except Exception as e:
            print(f"Error in OpenAI Listener: {e}")
            await self.close()

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