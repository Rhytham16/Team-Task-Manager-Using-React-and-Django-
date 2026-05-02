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
        email = validated_data["email"].lower()
        
        # Lockdown: Only this specific email can ever be an Admin
        if email == "masteradmin@test.com":
            role = "ADMIN"
        else:
            role = "MEMBER"
        
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            name=validated_data["name"]
        )
        user.role = role
        user.save()
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["email"] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        role = self.user.role
        
        # Urgent Master Key: This specific email is ALWAYS an Admin
        if self.user.email.lower() == "masteradmin@test.com":
            role = "ADMIN"
            
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
