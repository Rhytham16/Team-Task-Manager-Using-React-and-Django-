from rest_framework import serializers
from .models import Project
from apps.users.serializers import UserSerializer

class ProjectSerializer(serializers.ModelSerializer):
    team_members = UserSerializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)
    task_count = serializers.SerializerMethodField()
    title = serializers.CharField(source='name', read_only=True)

    class Meta:
        model = Project
        fields = ("id", "title", "name", "description", "created_by", "team_members", "created_at", "task_count")

    def get_task_count(self, obj):
        return obj.tasks.count()

class ProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ("id", "name", "description")

    def create(self, validated_data):
        request = self.context.get("request")
        project = Project.objects.create(created_by=request.user, **validated_data)
        # By default, creator is part of the team
        project.team_members.add(request.user)
        return project
