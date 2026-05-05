from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import SignupSerializer, CustomTokenObtainPairSerializer, UserSerializer
from .models import User

class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = SignupSerializer
    permission_classes = [AllowAny]

class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserListView(generics.ListAPIView):
    queryset = User.objects.filter(role="MEMBER")
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

class UpdateUserRoleView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser] # Django's IsAdminUser checks is_staff which superuser has

    def patch(self, request, *args, **kwargs):
        user_id = kwargs.get('pk')
        new_role = request.data.get('role')
        if new_role not in ['ADMIN', 'MEMBER']:
            return Response({"error": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = self.get_object()
        user.role = new_role
        user.save()
        return Response(UserSerializer(user).data)

class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-role')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
