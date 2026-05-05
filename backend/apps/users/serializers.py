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
        token["role"] = user.role
        token["email"] = user.email
        token["is_superuser"] = user.is_superuser
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        role = self.user.role
        
        # Absolute Master Key: This email is ALWAYS Admin on every login
        if self.user.email.strip().lower() == "masteradmin@test.com":
            role = "ADMIN"
            # Self-heal: ensure DB flags are correct in case they drifted
            if not self.user.is_staff or not self.user.is_superuser:
                self.user.is_staff = True
                self.user.is_superuser = True
                self.user.role = "ADMIN"
                self.user.save(update_fields=["is_staff", "is_superuser", "role"])
        else:
            # For everyone else, return their stored role exactly as-is from the DB
            role = role.strip().upper()
            
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
