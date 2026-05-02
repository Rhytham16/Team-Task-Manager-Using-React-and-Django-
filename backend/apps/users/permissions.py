from rest_framework import permissions

class IsAdminUserCustom(permissions.BasePermission):
    def has_permission(self, request, view):
        role = (getattr(request.user, "role", "") or "").strip().upper()
        return bool(request.user and request.user.is_authenticated and role == "ADMIN")
