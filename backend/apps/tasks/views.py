from rest_framework import viewsets, status, decorators, views
from rest_framework.response import Response
from .models import Task, TaskUpdate
from .serializers import TaskSerializer, TaskCreateSerializer, TaskUpdateSerializer
from .permissions import TaskPermission
from apps.users.permissions import IsAdminUserCustom
from apps.projects.models import Project
from apps.users.models import User
from datetime import date
from django.db.models import Count

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return TaskCreateSerializer
        return TaskSerializer

    def get_permissions(self):
        if self.action == "destroy":
            return [IsAdminUserCustom()]
        if self.action == "create":
            return [IsAdminUserCustom()]
        return [TaskPermission()]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Task.objects.none()
        role = (getattr(user, "role", "") or "").strip().upper()
        if role == "ADMIN" or user.is_superuser:
            queryset = Task.objects.all()
        else:
            queryset = Task.objects.filter(assigned_to=user)
        
        # Filtering
        status_param = self.request.query_params.get("status")
        project_param = self.request.query_params.get("project")
        assigned_to_param = self.request.query_params.get("assigned_to")
        
        if status_param:
            queryset = queryset.filter(status=status_param)
        if project_param:
            queryset = queryset.filter(project_id=project_param)
        if assigned_to_param:
            queryset = queryset.filter(assigned_to__id=assigned_to_param)
            
        return queryset

    @decorators.action(detail=True, methods=["post"], url_path="add-update")
    def add_update(self, request, pk=None):
        task = self.get_object()
        message = request.data.get("message")
        if not message:
            return Response({"error": "message is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        update = TaskUpdate.objects.create(
            task=task,
            user=request.user,
            message=message
        )
        serializer = TaskUpdateSerializer(update)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @decorators.action(detail=True, methods=["get"], url_path="updates")
    def updates(self, request, pk=None):
        task = self.get_object()
        updates = task.updates.all().order_by("-created_at")
        serializer = TaskUpdateSerializer(updates, many=True)
        return Response(serializer.data)

from rest_framework.permissions import IsAuthenticated

class DashboardView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        my_assigned_tasks = Task.objects.filter(assigned_to=user).order_by("-created_at")
        
        my_project_ids = my_assigned_tasks.values_list("project_id", flat=True).distinct()
        my_projects = Project.objects.filter(id__in=my_project_ids)
            
        status_counts = my_assigned_tasks.values("status").annotate(count=Count("id"))
        status_breakdown = {item["status"]: item["count"] for item in status_counts}
        
        response_data = {
            "my_assigned_tasks": TaskSerializer(my_assigned_tasks[:5], many=True).data,
            "my_projects": my_projects.values("id", "name"),
            "my_stats": {
                "total": my_assigned_tasks.count(),
                "TODO": status_breakdown.get("TODO", 0),
                "IN_PROGRESS": status_breakdown.get("IN_PROGRESS", 0),
                "COMPLETED": status_breakdown.get("COMPLETED", 0),
            }
        }
        
        role = (getattr(user, "role", "") or "").strip().upper()
        if role == "ADMIN" or user.is_superuser:
            global_status_counts = Task.objects.values("status").annotate(count=Count("id"))
            global_breakdown = {item["status"]: item["count"] for item in global_status_counts}
            
            response_data["global_stats"] = {
                "total_members": User.objects.filter(role__iexact="MEMBER").count(),
                "total_projects": Project.objects.count(),
                "total_tasks": Task.objects.count(),
                "TODO": global_breakdown.get("TODO", 0),
                "IN_PROGRESS": global_breakdown.get("IN_PROGRESS", 0),
                "COMPLETED": global_breakdown.get("COMPLETED", 0),
            }
            global_recent_tasks = Task.objects.all().order_by("-created_at")[:5]
            
            response_data["recent_global_tasks"] = TaskSerializer(global_recent_tasks, many=True).data
            response_data["global_members"] = User.objects.filter(role__iexact="MEMBER").values("id", "name", "email")
            
        return Response(response_data)
