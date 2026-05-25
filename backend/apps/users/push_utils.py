import json
from django.conf import settings


def send_push(user, title, body, url='/'):
    """Envoie une push notification à tous les appareils enregistrés de l'utilisateur."""
    private_key = getattr(settings, 'VAPID_PRIVATE_KEY', '')
    if not private_key:
        return

    try:
        from pywebpush import webpush, WebPushException
    except ImportError:
        return

    subs = user.push_subscriptions.all()
    payload = json.dumps({'title': title, 'body': body, 'url': url})

    for sub in subs:
        try:
            webpush(
                subscription_info={
                    'endpoint': sub.endpoint,
                    'keys': {'p256dh': sub.p256dh, 'auth': sub.auth},
                },
                data=payload,
                vapid_private_key=private_key,
                vapid_claims={'sub': f'mailto:{settings.VAPID_EMAIL}'},
            )
        except Exception:
            pass
