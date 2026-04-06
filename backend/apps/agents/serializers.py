from rest_framework import serializers
from apps.users.models import User
from apps.users.serializers import UserSerializer

class AddProducerSerializer(serializers.Serializer):
    nom = serializers.CharField()
    prenom = serializers.CharField()
    email = serializers.EmailField()
    telephone = serializers.CharField()
    adresse = serializers.CharField()

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Cet email est déjà utilisé.')
        return value

    def create(self, validated_data):
        import secrets
        password = secrets.token_urlsafe(12)
        user = User.objects.create_user(
            username=validated_data['email'].split('@')[0],
            email=validated_data['email'],
            first_name=validated_data['prenom'],
            last_name=validated_data['nom'],
            phone=validated_data['telephone'],
            address=validated_data['adresse'],
            role='producer',
            password=password,
        )
        return user, password