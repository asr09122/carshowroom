from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    path('auth/login/', views.api_login, name='api_login'),
    path('auth/signup/', views.api_signup, name='api_signup'),
    path('cars/', views.api_cars_list, name='api_cars_list'),
    path('cars/<int:car_id>/', views.api_car_detail, name='api_car_detail'),
    path('cars/add/', views.api_add_car, name='api_add_car'),
    path('cart/', views.api_cart, name='api_cart'),
    path('cart/checkout/', views.api_checkout, name='api_checkout'),
    path('cart/<int:item_id>/', views.api_cart_item_delete, name='api_cart_item_delete'),
]
