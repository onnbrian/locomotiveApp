from django.conf.urls import url
from trainsched import views

urlpatterns = [
    url(r'^routes_all/$', views.routes_all),
    url(r'^routes_from_to/(?P<origin>\w+(\s\w+)*)/(?P<dest>\w+(\s\w+)*)$', views.routes_from_to),
    url(r'^routes_from_to_on/(?P<origin>\w+(\s\w+)*)/(?P<dest>\w+(\s\w+)*)/(?P<searchDate>\d{4}(-\d\d){2})$', views.routes_from_to_on),
    url(r'^routes_post_mass/$', views.routes_post_mass),
    url(r'^routes_delete_all/$', views.routes_delete_all),
    url(r'^transfers_all/$', views.transfers_all),
    url(r'^transfers_post_mass/$', views.transfers_post_mass),
]