from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, ProducerProfile, Message

class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    phone     = serializers.CharField(required=True)

    class Meta:
        model  = User
        fields = ['username', 'first_name', 'phone', 'password', 'password2', 'role', 'address']
        extra_kwargs = {'username': {'required': False}}

    def validate_phone(self, value):
        value = value.strip().replace(' ', '')
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError('Ce numéro de téléphone est déjà utilisé.')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Les mots de passe ne correspondent pas.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        phone = validated_data.get('phone', '')

        # Auto-générer le username depuis le numéro si absent
        if not validated_data.get('username'):
            digits = ''.join(filter(str.isdigit, phone))
            base = f'user_{digits}'
            username = base
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f'{base}_{counter}'
                counter += 1
            validated_data['username'] = username

        role = validated_data.get('role', 'client')
        if role == 'producer':
            validated_data['is_active']   = True
            validated_data['is_verified'] = False

        user = User.objects.create_user(**validated_data)
        return user

class UserSerializer(serializers.ModelSerializer):
    loyalty_value = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role',
                  'phone', 'address', 'avatar', 'is_verified', 'whatsapp',
                  'date_joined', 'loyalty_points', 'loyalty_value']
        read_only_fields = ['id', 'role', 'is_verified', 'date_joined',
                            'loyalty_points', 'loyalty_value']

    def get_loyalty_value(self, obj):
        return (obj.loyalty_points // 100) * 500

class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['username', 'first_name', 'last_name', 'email', 'phone', 'address', 'avatar', 'whatsapp']

class ProducerProfileSerializer(serializers.ModelSerializer):
    username      = serializers.CharField(source='user.username',   read_only=True)
    first_name    = serializers.CharField(source='user.first_name', read_only=True)
    last_name     = serializers.CharField(source='user.last_name',  read_only=True)
    avatar        = serializers.ImageField(source='user.avatar',    read_only=True)
    phone         = serializers.CharField(source='user.phone',      read_only=True)
    date_joined   = serializers.DateTimeField(source='user.date_joined', read_only=True)
    products_count = serializers.SerializerMethodField()

    class Meta:
        model  = ProducerProfile
        fields = [
            'id', 'username', 'first_name', 'last_name', 'avatar', 'phone', 'date_joined',
            'bio', 'speciality', 'years_experience', 'workshop_photo', 'workshop_video',
            'products_count', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_products_count(self, obj):
        return obj.user.products.filter(is_available=True).count()


class MessageSerializer(serializers.ModelSerializer):
    sender_name    = serializers.CharField(source='sender.username',   read_only=True)
    sender_avatar  = serializers.ImageField(source='sender.avatar',    read_only=True)
    recipient_name = serializers.CharField(source='recipient.username', read_only=True)

    class Meta:
        model  = Message
        fields = ['id', 'sender', 'sender_name', 'sender_avatar',
                  'recipient', 'recipient_name', 'content', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender', 'sender_name', 'sender_avatar',
                            'recipient_name', 'is_read', 'created_at']
