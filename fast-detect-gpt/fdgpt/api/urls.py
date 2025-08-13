from django.urls import path
from .views import FastDetectGPTView

urlpatterns = [path('fast-detect-gpt/detect', FastDetectGPTView.as_view())]