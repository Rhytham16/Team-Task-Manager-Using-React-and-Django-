from rest_framework import serializers
from .models import Task, TaskUpdate
from apps.users.serializers import UserSerializer
from apps.users.models import User
from datetime import date

class TaskUpdateSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TaskUpdate
        fields = ("id", "message", "user", "created_at")

class TaskSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(many=True, read_only=True)
    updates = TaskUpdateSerializer(many=True, read_only=True)
    project_title = serializers.CharField(source="project.name", read_only=True)
    
    class Meta:
        model = Task
        fields = ("id", "title", "description", "status", "assigned_to", "project", "due_date", "created_at", "updates", "project_title")

class TaskCreateSerializer(serializers.ModelSerializer):
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        required=False
    )
    class Meta:
        model = Task
        fields = ("title", "description", "status", "assigned_to", "project", "due_date")

    def validate_due_date(self, value):
        if value < date.today():
            raise serializers.ValidationError("Due date cannot be in the past.")
        return value

    def validate(self, data):
        project = data.get("project")
        assigned_to = data.get("assigned_to", [])
        if project and assigned_to:
            for user in assigned_to:
                if not project.team_members.filter(id=user.id).exists():
                    raise serializers.ValidationError(f"User {user.name} is not part of the project team members.")
        return data
