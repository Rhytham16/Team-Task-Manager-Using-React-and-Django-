from rest_framework import permissions

class IsProjectAdmin(permissions.BasePermission):
    """
    Creator of project, system ADMIN, or Superuser.
    """
    def has_object_permission(self, request, view, obj):
        return bool(request.user.role == "ADMIN" or request.user.is_superuser or obj.created_by == request.user)

class IsProjectMember(permissions.BasePermission):
    """
    Part of team_members, system ADMIN, or Superuser.
    """
    def has_object_permission(self, request, view, obj):
        return bool(request.user.role == "ADMIN" or request.user.is_superuser or obj.team_members.filter(id=request.user.id).exists())
