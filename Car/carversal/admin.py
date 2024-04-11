from django.contrib import admin
from .models import Car,CartItem
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

admin.site.register(Car)
admin.site.unregister(User)
admin.site.register(User, UserAdmin)
admin.site.register(CartItem)
