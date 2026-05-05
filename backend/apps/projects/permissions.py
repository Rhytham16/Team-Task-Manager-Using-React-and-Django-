from rest_framework import permissions

class IsProjectAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        role = (getattr(request.user, "role", "") or "").strip().upper()
        return bool(role == "ADMIN" or request.user.is_superuser or obj.created_by == request.user)

class IsProjectMember(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        role = (getattr(request.user, "role", "") or "").strip().upper()
        return bool(role == "ADMIN" or request.user.is_superuser or obj.team_members.filter(id=request.user.id).exists())
