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
        fields = ("name", "email", "password") # Role removed from signup

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def create(self, validated_data):
        email = validated_data["email"].strip().lower()
        
        # Lockdown: Only this specific email can ever be an Admin
        if email == "masteradmin@test.com":
            role = "ADMIN"
            is_staff = True
            is_superuser = True
        else:
            role = "MEMBER"
            is_staff = False
            is_superuser = False
        
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
        role = user.role
        is_superuser = user.is_superuser

        # Master Key logic for JWT payload
        if user.email.strip().lower() == "masteradmin@test.com":
            role = "ADMIN"
            is_superuser = True

        token["role"] = role
        token["email"] = user.email
        token["is_superuser"] = is_superuser
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        email = user.email.strip().lower()
        
        # Self-healing: If masteradmin logs in, ensure DB matches role/superuser status
        if email == "masteradmin@test.com":
            if user.role != "ADMIN" or not user.is_superuser:
                user.role = "ADMIN"
                user.is_superuser = True
                user.is_staff = True
                user.save()
            role = "ADMIN"
        else:
            role = user.role.strip().upper()
            
        return {
            "token": data["access"],
            "refresh": data["refresh"],
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": role,
                "is_superuser": user.is_superuser
            }
        }
