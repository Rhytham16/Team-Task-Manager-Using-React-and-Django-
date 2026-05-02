from rest_framework import permissions

class TaskPermission(permissions.BasePermission):
    """
    Admin -> full access
    Member -> only assigned tasks
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role == "ADMIN":
            return True
        return obj.assigned_to.filter(id=request.user.id).exists()
