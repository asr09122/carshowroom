from django.urls import path
from .import views
app_name = 'carversal'
urlpatterns = [
    path("", views.index, name='Car'),
    path("search/", views.search, name='search'),
    path("login/", views.user_login, name='login'),
    path("signup/", views.signup, name='signup'),
    path("add_car/", views.add_car, name='add_car'),
    path("logout/", views.user_logout, name='logout'),
    path("cart/", views.view_cart, name='vc'),
    path('add/<int:car_id>/', views.add_to_cart, name='add_to_cart'),
    path('remove/<int:item_id>/', views.remove_from_cart, name='remove_from_cart'),
    path('details/', views.details, name='details'),
    ]