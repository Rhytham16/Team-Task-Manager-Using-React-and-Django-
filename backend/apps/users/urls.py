from django.urls import path
from .views import SignupView, LoginView, UserListView, AdminUserListView, UpdateUserRoleView

urlpatterns = [
    path("auth/signup/", SignupView.as_view(), name="signup"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/members/", UserListView.as_view(), name="members-list"),
    path("auth/manage/", AdminUserListView.as_view(), name="admin-user-list"),
    path("auth/manage/<int:pk>/role/", UpdateUserRoleView.as_view(), name="update-user-role"),
]
