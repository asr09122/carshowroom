import jwt
import datetime
from functools import wraps
from django.http import JsonResponse
from django.conf import settings
from django.contrib.auth.models import User

JWT_SECRET = getattr(settings, 'SECRET_KEY', 'jwt-secret-key-carversal')
JWT_ALGORITHM = 'HS256'
EXPIRATION_HOURS = 24

def generate_jwt_token(user):
    payload = {
        'user_id': user.id,
        'username': user.username,
        'email': user.email,
        'is_staff': user.is_staff,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=EXPIRATION_HOURS),
        'iat': datetime.datetime.utcnow()
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token

def decode_jwt_token(token):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

def jwt_required(view_func):
    @wraps(view_func)
    def wrapped(request, *args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authorization token required (Bearer token)'}, status=401)
        
        token = auth_header.split(' ')[1]
        payload = decode_jwt_token(token)
        if not payload:
            return JsonResponse({'error': 'Invalid or expired JWT token'}, status=401)
        
        try:
            request.user = User.objects.get(id=payload['user_id'])
        except User.DoesNotExist:
            return JsonResponse({'error': 'User associated with token not found'}, status=401)
            
        return view_func(request, *args, **kwargs)
    return wrapped
