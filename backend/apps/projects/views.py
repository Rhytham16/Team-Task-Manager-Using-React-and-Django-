from rest_framework import viewsets, status, decorators
from rest_framework.response import Response
from .models import Project
from .serializers import ProjectSerializer, ProjectCreateSerializer
from apps.users.permissions import IsAdminUserCustom
from .permissions import IsProjectMember, IsProjectAdmin
from django.shortcuts import get_object_or_404
from apps.users.models import User

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ProjectCreateSerializer
        return ProjectSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy", "add_member", "remove_member"]:
            return [IsAdminUserCustom()]
        return [IsProjectMember()]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Project.objects.none()
        role = (getattr(user, "role", "") or "").strip().upper()
        if role == "ADMIN":
            return Project.objects.all()
        return Project.objects.filter(team_members=user)

    @decorators.action(detail=True, methods=["post"], url_path="add-member")
    def add_member(self, request, pk=None):
        project = self.get_object()
        user_id = request.data.get("user_id")
        if not user_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(id=user_id)
            project.team_members.add(user)
            return Response({"message": f"User {user.email} added to project"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    @decorators.action(detail=True, methods=["post"], url_path="remove-member")
    def remove_member(self, request, pk=None):
        project = self.get_object()
        user_id = request.data.get("user_id")
        if not user_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(id=user_id)
            project.team_members.remove(user)
            return Response({"message": f"User {user.email} removed from project"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
