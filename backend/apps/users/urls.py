from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    MeView,
    SuggestionView,
    ProducerListPublicView,
    ProducerProfileView,
    ProducerPublicProfileView,
    ProducerValidationView,
    ConversationsView,
    ThreadView,
    PushSubscribeView,
    VapidPublicKeyView,
)

urlpatterns = [
    # Auth classique
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # JWT
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # User
    path('me/', MeView.as_view(), name='me'),

    # Suggestions
    path('suggestions/', SuggestionView.as_view(), name='suggestions'),

    # Producteurs publics
    path('producers/', ProducerListPublicView.as_view(), name='producers-public'),
    path('producers/<int:user_id>/', ProducerPublicProfileView.as_view(), name='producer-public-profile'),

    # Profil artisan (privé)
    path('producer-profile/', ProducerProfileView.as_view(), name='producer-profile'),

    # Validation admin
    path('producers/pending/', ProducerValidationView.as_view(), name='producers-pending'),
    path('producers/<int:user_id>/validate/', ProducerValidationView.as_view(), name='producer-validate'),

    # Messagerie
    path('messages/', ConversationsView.as_view(), name='conversations'),
    path('messages/<int:user_id>/', ThreadView.as_view(), name='thread'),

    # Push notifications PWA
    path('push-subscribe/', PushSubscribeView.as_view(), name='push-subscribe'),
    path('push-vapid-key/', VapidPublicKeyView.as_view(), name='vapid-key'),
]