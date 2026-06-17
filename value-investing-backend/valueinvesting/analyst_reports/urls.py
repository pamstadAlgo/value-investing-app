from django.urls import path
from . import views

urlpatterns = [
    path("presigned-url/", views.PresignedUploadURLView.as_view()),
    path("confirm/", views.ConfirmUploadView.as_view()),
    path("retry/<int:upload_id>/", views.RetryUploadView.as_view()),
    path("<str:qfs_symbol>/", views.UserUploadsView.as_view()),
]
