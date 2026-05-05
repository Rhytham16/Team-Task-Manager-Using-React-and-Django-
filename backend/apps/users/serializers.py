from rest_framework import serializers
from .models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "name", "email", "role", "created_at")

class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("name", "email", "password", "role")

    def validate_role(self, value):
        # Be tolerant of different casings coming from the client/deployments.
        role = (value or "MEMBER").strip().upper()
        valid_roles = {choice[0] for choice in User.ROLE_CHOICES}
        if role not in valid_roles:
            return "MEMBER"
        return role

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def create(self, validated_data):
        role = validated_data.get("role", "MEMBER")
        is_staff = role == "ADMIN"
        is_superuser = role == "ADMIN"

        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            name=validated_data["name"]
        )
        user.role = role
        user.is_staff = is_staff
        user.is_superuser = is_superuser
        user.save()
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["email"] = user.email
        token["is_superuser"] = user.is_superuser
        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # masteradmin emergency account: always force ADMIN role and self-heal DB if needed
        if self.user.email.strip().lower() == "masteradmin@test.com":
            role = "ADMIN"
            if self.user.role != "ADMIN" or not self.user.is_staff or not self.user.is_superuser:
                self.user.role = "ADMIN"
                self.user.is_staff = True
                self.user.is_superuser = True
                self.user.save(update_fields=["role", "is_staff", "is_superuser"])
        else:
            # For all other users, use their stored role from the database (normalized)
            role = self.user.role.strip().upper()

        return {
            "token": data["access"],
            "refresh": data["refresh"],
            "user": {
                "id": self.user.id,
                "name": self.user.name,
                "email": self.user.email,
                "role": role
            }
        }
