from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
# from . import views
from carversal import views

urlpatterns = [
    path("", views.login,name='car'),
    path("admin/", admin.site.urls),
    path("car/", include("carversal.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
