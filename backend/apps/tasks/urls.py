from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, DashboardView

router = DefaultRouter()
router.register(r"tasks", TaskViewSet, basename="task")

urlpatterns = [
    path("", include(router.urls)),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
]
