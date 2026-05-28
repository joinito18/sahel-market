from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Suggestion, Message, PushSubscription, ProducerProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display  = ['username', 'phone', 'role', 'is_verified', 'is_active', 'loyalty_points', 'date_joined']
    list_filter   = ['role', 'is_verified', 'is_active']
    search_fields = ['username', 'phone', 'email', 'first_name', 'last_name']
    list_editable = ['role', 'is_verified', 'is_active']
    ordering      = ['-date_joined']

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Sahel Market', {
            'fields': ('role', 'phone', 'whatsapp', 'address', 'avatar', 'is_verified', 'loyalty_points'),
        }),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Sahel Market', {
            'fields': ('role', 'phone', 'whatsapp', 'address'),
        }),
    )


@admin.register(ProducerProfile)
class ProducerProfileAdmin(admin.ModelAdmin):
    list_display  = ['user', 'speciality', 'years_experience', 'created_at']
    search_fields = ['user__username', 'speciality', 'bio']


@admin.register(Suggestion)
class SuggestionAdmin(admin.ModelAdmin):
    list_display  = ['user', 'subject', 'created_at']
    search_fields = ['user__username', 'subject', 'message']
    readonly_fields = ['user', 'subject', 'message', 'created_at']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display  = ['sender', 'recipient', 'is_read', 'created_at']
    list_filter   = ['is_read']
    search_fields = ['sender__username', 'recipient__username', 'content']
    readonly_fields = ['sender', 'recipient', 'content', 'created_at']


@admin.register(PushSubscription)
class PushSubscriptionAdmin(admin.ModelAdmin):
    list_display  = ['user', 'created_at']
    search_fields = ['user__username']
