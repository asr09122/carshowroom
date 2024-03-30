from django.urls import path
from .import views
app_name = 'carversal'
urlpatterns = [
    path("", views.index, name='Car'),
    path("search/", views.search, name='search'),
    path("login/",views.login,name='login'),
    path("signup/",views.signup,name='name')
    ]