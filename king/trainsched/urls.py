from django.conf.urls import url
from trainsched import views

urlpatterns = [
    url(r'^all/$', views.routes_all),
    url(r'^fromto/(?P<origin>\w+(\s\w+)*)/(?P<dest>\w+(\s\w+)*)$', views.routes_fromto),
    url(r'^masspost/$', views.routes_masspost),
]