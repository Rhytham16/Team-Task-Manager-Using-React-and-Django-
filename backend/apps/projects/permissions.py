from rest_framework import permissions

class IsProjectAdmin(permissions.BasePermission):
    """
    Creator of project or system ADMIN.
    """
    def has_object_permission(self, request, view, obj):
        return bool(request.user.role == "ADMIN" or obj.created_by == request.user)

class IsProjectMember(permissions.BasePermission):
    """
    Part of team_members or system ADMIN.
    """
    def has_object_permission(self, request, view, obj):
        return bool(request.user.role == "ADMIN" or obj.team_members.filter(id=request.user.id).exists())
