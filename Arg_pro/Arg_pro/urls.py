"""
URL configuration for Arg_pro project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from Arg_app import views
urlpatterns = [
    path('admin/', admin.site.urls),
    path("",views.home),
    path("result/",views.disease_solution,name='result'),
    path("generate-advice/",views.generate_crop_advice,name="generate_advice"),

]+ static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT)

